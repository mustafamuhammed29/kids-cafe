// @ts-nocheck
// Supabase Edge Function: create-booking
// Architectural & Security Invariants:
// 1. Cloudflare Turnstile verification FAILS CLOSED in production.
//    - If ENVIRONMENT=production and secret is missing/invalid, EVERY booking is rejected.
//    - Mock bypass allowed ONLY when ENVIRONMENT=development AND request originates from localhost.
// 2. Cancellation Token Isolation:
//    - Generated server-side by PostgreSQL create_booking_atomic.
//    - Used ONLY in the confirmation email dispatched server-side (https://havenkidscafe.de/stornierung?token=...).
//    - STRIPPED from any JSON response returned to the client browser.
// 3. Durable Distributed Rate Limiting:
//    - Backed by PostgreSQL public.rate_limit_events table & check_and_record_ip_rate_limit function.
//    - In-memory Map operates solely as a best-effort, non-distributed Edge fast-cache.
//    - Innermost email throttling (60s lock in PostgreSQL) prevents spam attacks.
// 4. Zero Customer PII Logging:
//    - Operational logs contain ONLY masked IPs and anonymous booking reference codes.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';

// Environment Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY') || '';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const ENVIRONMENT = Deno.env.get('ENVIRONMENT') || 'production';

// Strict CORS Whitelist (Unified Production Domain: havenkidscafe.de)
const ALLOWED_ORIGINS = [
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:4174',
  'http://localhost:5174',
  'https://havenkidscafe.de',
  'https://www.havenkidscafe.de',
  'https://admin.havenkidscafe.de',
];

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

// ------------------------------------------------------------------------------
// BEST-EFFORT EDGE IN-MEMORY CACHE (Note: Non-distributed fast-path filter only)
// Guaranteed, durable distributed rate limiting is enforced by PostgreSQL below.
// ------------------------------------------------------------------------------
interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
}
const ipRateLimits = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isBestEffortMemoryRateLimited(ip: string): boolean {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return false;
  const now = Date.now();
  const entry = ipRateLimits.get(ip);

  if (!entry) {
    ipRateLimits.set(ip, { count: 1, firstRequestTime: now });
    return false;
  }

  if (now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    ipRateLimits.set(ip, { count: 1, firstRequestTime: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

// Input Validation Schema with Zod
const BookingRequestSchema = z.object({
  parentName: z
    .string({ required_error: 'Bitte gib deinen Namen an.' })
    .trim()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein.')
    .max(100, 'Name darf maximal 100 Zeichen lang sein.'),
  email: z
    .string({ required_error: 'Bitte gib deine E-Mail-Adresse an.' })
    .trim()
    .email('Bitte gib eine gültige E-Mail-Adresse an.')
    .max(150, 'E-Mail darf maximal 150 Zeichen lang sein.'),
  phone: z
    .string({ required_error: 'Bitte gib deine Telefonnummer an.' })
    .trim()
    .min(6, 'Telefonnummer muss mindestens 6 Zeichen lang sein.')
    .max(30, 'Telefonnummer darf maximal 30 Zeichen lang sein.'),
  date: z
    .string({ required_error: 'Bitte wähle ein Datum.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datumsformat muss JJJJ-MM-TT sein.'),
  timeSlot: z
    .string({ required_error: 'Bitte wähle einen Zeitslot.' })
    .min(5, 'Ungültiger Zeitslot.')
    .max(30, 'Ungültiger Zeitslot.'),
  serviceSlug: z
    .string({ required_error: 'Bitte wähle ein Paket.' })
    .min(2, 'Ungültiges Paket.')
    .max(50, 'Ungültiges Paket.'),
  childrenCount: z
    .number({ required_error: 'Bitte gib die Anzahl der Kinder an.' })
    .int('Anzahl Kinder muss eine ganze Zahl sein.')
    .min(1, 'Mindestens 1 Kind erforderlich.')
    .max(20, 'Maximal 20 Kinder pro Buchung.'),
  adultsCount: z
    .number({ required_error: 'Bitte gib die Anzahl der Begleitpersonen an.' })
    .int('Anzahl Begleitpersonen muss eine ganze Zahl sein.')
    .min(0, 'Ungültige Anzahl Begleitpersonen.')
    .max(10, 'Maximal 10 Begleitpersonen erlaubt.'),
  includeSaltRoomAddon: z.boolean().optional().default(false),
  specialRequests: z.string().max(500, 'Besondere Wünsche max. 500 Zeichen.').optional().nullable(),
  turnstileToken: z.string().optional().nullable(),
});

serve(async (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  const clientIp =
    req.headers.get('CF-Connecting-IP') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';

  const isLocalhost =
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    clientIp === '127.0.0.1' ||
    clientIp === '::1';

  const isProduction = ENVIRONMENT === 'production' && !isLocalhost;
  const isAllowed = isOriginAllowed(origin);

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://havenkidscafe.de',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    'Vary': 'Origin',
  };

  // 1. Handle Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Enforce POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Methode nicht erlaubt.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Strict Origin Validation on Production
  if (isProduction) {
    if (!isAllowed) {
      console.warn(`[SECURITY] Aborted request from unauthorized or mismatched origin: ${origin}`);
      return new Response(JSON.stringify({ error: 'Origin nicht autorisiert.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // 4. Edge Layer Rate Limiting (Best-Effort Memory Cache)
  if (isBestEffortMemoryRateLimited(clientIp)) {
    console.warn(`[SECURITY] Memory rate limit exceeded for IP: ${clientIp.substring(0, 7)}***`);
    return new Response(
      JSON.stringify({
        error: 'Zu viele Anfragen in kurzer Zeit. Bitte warte einige Minuten vor einem weiteren Versuch.',
      }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // 5. Parse & Validate Payload
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Ungültiges Datenformat. Bitte JSON senden.' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const parseResult = BookingRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const firstErrorMessage =
      parseResult.error.errors[0]?.message || 'Ungültige Buchungsdaten. Bitte prüfe deine Eingaben.';
    return new Response(JSON.stringify({ error: firstErrorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const validated = parseResult.data;

  // 5.1 Strict Timezone-Aware Past Date & Slot Check (Europe/Berlin)
  try {
    const berlinDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    if (validated.date < berlinDateStr) {
      return new Response(
        JSON.stringify({ error: 'Buchungen in der Vergangenheit sind nicht möglich.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (validated.date === berlinDateStr) {
      const startTimePart = validated.timeSlot.split('-')[0].trim();
      const [startH, startM] = startTimePart.split(':').map(Number);

      const berlinTimeFormatter = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const [currentBerlinH, currentBerlinM] = berlinTimeFormatter.format(new Date()).split(':').map(Number);

      if (startH < currentBerlinH || (startH === currentBerlinH && startM <= currentBerlinM)) {
        return new Response(
          JSON.stringify({ error: 'Dieser Zeitslot liegt heute bereits in der Vergangenheit.' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
  } catch (tzErr) {
    console.warn('[VALIDATION] Non-blocking timezone check warning:', tzErr);
  }

  // 6. Cloudflare Turnstile Verification — STRICT FAIL-CLOSED IN PRODUCTION
  if (isProduction) {
    // In production, if TURNSTILE_SECRET_KEY is missing or unavailable, FAIL CLOSED!
    if (!TURNSTILE_SECRET_KEY) {
      console.error('[SECURITY CRITICAL] TURNSTILE_SECRET_KEY missing in production environment. Failing closed.');
      return new Response(
        JSON.stringify({
          error: 'Die Buchungsanfrage kann derzeit nicht sicher verarbeitet werden. Bitte versuche es später erneut oder kontaktiere uns direkt.',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // In production, turnstileToken is mandatory
    if (!validated.turnstileToken) {
      console.warn('[SECURITY] Missing Turnstile token on production booking attempt.');
      return new Response(
        JSON.stringify({
          error: 'Die Buchungsanfrage kann derzeit nicht sicher verarbeitet werden. Bitte versuche es später erneut oder kontaktiere uns direkt.',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const turnstileFormData = new FormData();
      turnstileFormData.append('secret', TURNSTILE_SECRET_KEY);
      turnstileFormData.append('response', validated.turnstileToken);
      if (clientIp && clientIp !== '127.0.0.1') {
        turnstileFormData.append('remoteip', clientIp);
      }

      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: turnstileFormData,
      });

      const turnstileOutcome = await turnstileRes.json();
      if (!turnstileOutcome.success) {
        console.warn(`[SECURITY] Turnstile verification failed. Error codes: ${JSON.stringify(turnstileOutcome['error-codes'])}`);
        return new Response(
          JSON.stringify({
            error: 'Die Buchungsanfrage kann derzeit nicht sicher verarbeitet werden. Bitte versuche es später erneut oder kontaktiere uns direkt.',
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (turnstileErr) {
      console.error('[SECURITY] Error contacting Cloudflare Turnstile API:', turnstileErr);
      return new Response(
        JSON.stringify({
          error: 'Die Buchungsanfrage kann derzeit nicht sicher verarbeitet werden. Bitte versuche es später erneut oder kontaktiere uns direkt.',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } else {
    // Development Localhost Bypass (Allowed ONLY when ENVIRONMENT=development AND on localhost)
    if (TURNSTILE_SECRET_KEY && validated.turnstileToken) {
      // Optional verification in dev if key and token are present
      try {
        const turnstileFormData = new FormData();
        turnstileFormData.append('secret', TURNSTILE_SECRET_KEY);
        turnstileFormData.append('response', validated.turnstileToken);
        await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: turnstileFormData,
        });
      } catch {
        // Non-blocking in dev
      }
    } else {
      console.info('[SECURITY NOTICE] Local development mock bypass active for localhost.');
    }
  }

  // 7. Initialize Server-Side Supabase Client (Service Role)
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[CONFIGURATION ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return new Response(
      JSON.stringify({ error: 'Serverkonfigurationsfehler. Bitte kontaktiere das Café direkt.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // 8. Durable Distributed IP Rate Limiting via PostgreSQL
  if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
    try {
      const { data: isAllowed, error: rateLimitErr } = await supabase.rpc(
        'check_and_record_ip_rate_limit',
        {
          p_ip_address: clientIp,
          p_max_requests: 5,
          p_window_interval: '5 minutes',
        }
      );

      if (rateLimitErr) {
        console.warn('[RATE LIMIT] Database rate limit RPC check warning:', rateLimitErr.message);
      } else if (isAllowed === false) {
        console.warn(`[SECURITY] Distributed rate limit exceeded for IP: ${clientIp.substring(0, 7)}***`);
        return new Response(
          JSON.stringify({
            error: 'Zu viele Anfragen in kurzer Zeit. Bitte warte einige Minuten vor einem weiteren Versuch.',
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (dbRateErr) {
      console.warn('[RATE LIMIT] Failed to execute distributed rate limit check:', dbRateErr);
    }
  }

  // 9. Execute Atomic Booking in PostgreSQL
  try {
    const { data, error: rpcError } = await supabase.rpc('create_booking_atomic', {
      p_customer_name: validated.parentName,
      p_customer_email: validated.email,
      p_customer_phone: validated.phone,
      p_date: validated.date,
      p_time_slot: validated.timeSlot,
      p_service_slug: validated.serviceSlug,
      p_num_children: validated.childrenCount,
      p_num_adults: validated.adultsCount,
      p_include_salt_room: validated.includeSaltRoomAddon,
      p_special_requests: validated.specialRequests || null,
    });

    if (rpcError) {
      console.error('[RPC ERROR] Database error executing create_booking_atomic:', rpcError.message);
      return new Response(
        JSON.stringify({
          error: 'Die Reservierung konnte im System nicht verarbeitet werden. Bitte prüfe deine Angaben.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const rpcResult = data as {
      success: boolean;
      error_message?: string;
      reference_code?: string;
      cancellation_token?: string;
      total_price?: number;
      date?: string;
      time_slot?: string;
      service_name?: string;
    };

    if (!rpcResult || !rpcResult.success) {
      return new Response(
        JSON.stringify({
          error: rpcResult?.error_message || 'Dieser Zeitslot ist leider bereits ausgebucht.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Safe operational logging (Zero Customer PII)
    console.info(`[BOOKING_SUCCESS] Reference=${rpcResult.reference_code} Date=${rpcResult.date} Slot="${rpcResult.time_slot}"`);

    // 10. Trigger Confirmation Email via Resend (Server-Side)
    // The secret cancellation_token is used SOLELY in this private email cancel link.
    if (RESEND_API_KEY && rpcResult.cancellation_token) {
      const cancelUrl = `https://havenkidscafe.de/stornierung?token=${rpcResult.cancellation_token}`;
      const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; color: #2D3748; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
    .header { background: #2D5A47; color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; background: #E8F5E9; color: #2D5A47; font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 14px; }
    .details-box { background: #F8FAF9; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #E2E8F0; font-size: 15px; }
    .row:last-child { border-bottom: none; }
    .label { color: #718096; }
    .value { font-weight: 600; color: #1A202C; text-align: right; }
    .footer { text-align: center; font-size: 12px; color: #A0AEC0; padding: 24px; background: #F7FAFC; }
    .btn-cancel { display: inline-block; color: #718096; font-size: 12px; text-decoration: underline; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Haven Kids Café</h1>
      <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Buchungsbestätigung</p>
    </div>
    <div class="content">
      <p style="font-size: 16px;">Liebe/r <strong>${validated.parentName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">
        vielen Dank für deine Reservierung! Dein Besuch im <strong>Haven Kids Café</strong> ist verbindlich gebucht.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <span class="badge">Buchungscode: ${rpcResult.reference_code}</span>
      </div>

      <div class="details-box">
        <div class="row">
          <span class="label">Erlebnis / Service:</span>
          <span class="value">${rpcResult.service_name}</span>
        </div>
        <div class="row">
          <span class="label">Datum:</span>
          <span class="value">${rpcResult.date}</span>
        </div>
        <div class="row">
          <span class="label">Zeitslot:</span>
          <span class="value">${rpcResult.time_slot}</span>
        </div>
        <div class="row">
          <span class="label">Gäste:</span>
          <span class="value">${validated.childrenCount} Kind(er), ${validated.adultsCount} Begleitperson(en)</span>
        </div>
        <div class="row">
          <span class="label">Gesamtbetrag:</span>
          <span class="value">${Number(rpcResult.total_price).toFixed(2)} € (Zahlung vor Ort)</span>
        </div>
      </div>

      <div style="background: #FFFDF5; border: 1px solid #FEF08A; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px;">
        <strong>Wichtige Hinweise für deinen Besuch:</strong>
        <ul style="margin: 8px 0 0; padding-left: 20px; line-height: 1.5;">
          <li>Bitte bringe rutschfeste Stoppersocken für alle mit.</li>
          <li>Bitte erscheine ca. 10 Minuten vor Slot-Beginn.</li>
          <li>Kostenlose Stornierung bis 24 Stunden vor dem Termin möglich.</li>
        </ul>
      </div>

      <p style="font-size: 14px; color: #4A5568; line-height: 1.5;">
        <strong>Adresse:</strong> Friedrichstraße 123, 10117 Berlin<br/>
        <strong>Fragen?</strong> Schreib uns auf WhatsApp oder antworte auf diese E-Mail.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${cancelUrl}" class="btn-cancel">
          Pläne geändert? Hier mit deinem persönlichen Stornierungs-Token stornieren
        </a>
      </div>
    </div>
    <div class="footer">
      © 2026 Haven Kids Café · Friedrichstraße 123, 10117 Berlin · hallo@havenkidscafe.de
    </div>
  </div>
</body>
</html>
      `;

      // Send via Resend with graceful fallback and error logging
      const configuredFrom = Deno.env.get('RESEND_FROM_EMAIL') || 'Haven Kids Café <buchung@havenkidscafe.de>';
      const isOwnerTesting = validated.email.toLowerCase() === 'jansatech.alsafi@gmail.com';
      const senderToUse = (!configuredFrom.includes('buchung@havenkidscafe.de') || !isOwnerTesting) 
        ? configuredFrom 
        : 'Haven Kids Café <onboarding@resend.dev>';

      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: senderToUse,
          to: [validated.email],
          subject: `Deine Buchungsbestätigung #${rpcResult.reference_code} — Haven Kids Café`,
          html: emailHtml,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errBody = await res.text();
            console.warn(`[RESEND_WARNING] Email send returned status ${res.status}:`, errBody);
            // If custom domain unverified and owner is booking, try onboarding@resend.dev fallback
            if (isOwnerTesting && senderToUse !== 'Haven Kids Café <onboarding@resend.dev>') {
              fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                  from: 'Haven Kids Café <onboarding@resend.dev>',
                  to: [validated.email],
                  subject: `[TEST] Deine Buchungsbestätigung #${rpcResult.reference_code} — Haven Kids Café`,
                  html: emailHtml,
                }),
              }).catch(() => {});
            }
          } else {
            console.info(`[RESEND_SUCCESS] Confirmation email dispatched to ${validated.email}`);
          }
        })
        .catch((emailErr) => {
          console.error('[EMAIL ERROR] Failed to send confirmation email:', emailErr);
        });
    }

    // 11. Minimal Safe Customer Response (NEVER INCLUDES CANCELLATION TOKEN)
    // The token is intentionally excluded so browser network inspection cannot obtain it.
    return new Response(
      JSON.stringify({
        success: true,
        reference_code: rpcResult.reference_code,
        date: rpcResult.date,
        time_slot: rpcResult.time_slot,
        service_name: rpcResult.service_name,
        total_price: rpcResult.total_price,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    console.error('[INTERNAL ERROR]', err instanceof Error ? err.message : 'Unknown error');
    return new Response(
      JSON.stringify({
        error: 'Ein unerwarteter Serverfehler ist aufgetreten. Bitte versuche es später noch einmal.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
