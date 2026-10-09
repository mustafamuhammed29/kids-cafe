// @ts-nocheck
// Supabase Edge Function: send-booking-confirmation
// Automatically invoked via Database Webhook or Secure API on public.bookings INSERT
// Uses Resend API for GDPR-compliant EU transactional email delivery

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || '';

const ALLOWED_ORIGINS = [
  'http://localhost:4173',
  'http://localhost:4174',
  'http://localhost:5173',
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

interface BookingPayload {
  record: {
    reference_code: string;
    cancellation_token?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    date: string;
    time_slot: string;
    service_name: string;
    num_children: number;
    num_adults: number;
    total_price: number;
  };
  templateOverride?: {
    headerColor?: string;
    headerTagline?: string;
    logoUrl?: string;
    showLogo?: boolean;
    greetingText?: string;
    visitGuidelines?: string[];
    contactNote?: string;
    footerNote?: string;
    showCancellationLink?: boolean;
    showPriceDetails?: boolean;
    cardTheme?: 'warm' | 'clean';
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  const isAllowed = isOriginAllowed(origin);

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://havenkidscafe.de',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    'Vary': 'Origin',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Security Check: If WEBHOOK_SECRET is set, verify authorization bearer
  if (WEBHOOK_SECRET) {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.includes(WEBHOOK_SECRET)) {
      return new Response(JSON.stringify({ error: 'Unauthorized webhook call' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const payload: BookingPayload = await req.json();
    const b = payload.record;

    if (!b || !b.customer_email) {
      return new Response(JSON.stringify({ error: 'Missing booking record' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default template values
    let headerColor = '#2D5A47';
    let headerTagline = 'Buchungsbestätigung & Besuchsinformationen';
    let logoUrl = '';
    let showLogo = true;
    let greetingText = 'vielen Dank für deine Reservierung! Dein Besuch im Haven Kids Café ist verbindlich gebucht.';
    let visitGuidelines = [
      'Bitte bringe rutschfeste Stoppersocken für alle mit.',
      'Bitte erscheine ca. 10 Minuten vor Slot-Beginn.',
      'Kostenlose Stornierung bis 24 Stunden vor dem Termin möglich.',
    ];
    let address = 'Friedrichstraße 123, 10117 Berlin';
    let contactNote = 'Fragen? Schreib uns auf WhatsApp oder antworte auf diese E-Mail.';
    let footerNote = '© 2026 Haven Kids Café · Friedrichstraße 123, 10117 Berlin · hallo@havenkidscafe.de';
    let showCancellationLink = true;
    let showPriceDetails = true;
    let cardTheme = 'warm';

    if (payload.templateOverride) {
      const t = payload.templateOverride;
      if (t.headerColor) headerColor = t.headerColor;
      if (t.headerTagline) headerTagline = t.headerTagline;
      if (t.logoUrl) logoUrl = t.logoUrl;
      if (t.showLogo !== undefined) showLogo = t.showLogo;
      if (t.greetingText) greetingText = t.greetingText;
      if (Array.isArray(t.visitGuidelines) && t.visitGuidelines.length > 0) visitGuidelines = t.visitGuidelines;
      if (t.contactNote) contactNote = t.contactNote;
      if (t.footerNote) footerNote = t.footerNote;
      if (t.showCancellationLink !== undefined) showCancellationLink = t.showCancellationLink;
      if (t.showPriceDetails !== undefined) showPriceDetails = t.showPriceDetails;
      if (t.cardTheme) cardTheme = t.cardTheme;
    } else if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: dbSettings } = await supabase.from('business_settings').select('key, value');
        if (dbSettings && Array.isArray(dbSettings)) {
          const map = new Map<string, any>();
          dbSettings.forEach((item) => {
            try {
              map.set(item.key, JSON.parse(item.value));
            } catch {
              map.set(item.key, item.value);
            }
          });
          if (map.get('email_header_color')) headerColor = map.get('email_header_color');
          if (map.get('email_header_tagline')) headerTagline = map.get('email_header_tagline');
          if (map.get('email_logo_url')) logoUrl = map.get('email_logo_url');
          else if (map.get('logo_url')) logoUrl = map.get('logo_url');
          if (map.get('email_show_logo') !== undefined) showLogo = Boolean(map.get('email_show_logo'));
          if (map.get('email_greeting_text')) greetingText = map.get('email_greeting_text');
          if (Array.isArray(map.get('email_visit_guidelines')) && map.get('email_visit_guidelines').length > 0) {
            visitGuidelines = map.get('email_visit_guidelines');
          }
          if (map.get('address')) address = map.get('address');
          if (map.get('email_contact_note')) contactNote = map.get('email_contact_note');
          if (map.get('email_footer_note')) footerNote = map.get('email_footer_note');
          if (map.get('email_show_cancellation_link') !== undefined) showCancellationLink = Boolean(map.get('email_show_cancellation_link'));
          if (map.get('email_show_price_details') !== undefined) showPriceDetails = Boolean(map.get('email_show_price_details'));
          if (map.get('email_card_theme')) cardTheme = map.get('email_card_theme');
        }
      } catch (err) {
        console.warn('[TEMPLATE_SETTINGS_WARN] Could not fetch settings, using defaults:', err);
      }
    }

    const cancelUrl = b.cancellation_token
      ? `https://havenkidscafe.de/stornierung?token=${b.cancellation_token}`
      : 'https://havenkidscafe.de/contact';

    const outerBg = cardTheme === 'clean' ? '#FFFFFF' : '#FAF8F5';

    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${outerBg}; margin: 0; padding: 20px; color: #2D3748; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
    .header { background: ${headerColor}; color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; background: ${headerColor}18; color: ${headerColor}; font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 14px; }
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
      ${showLogo && logoUrl ? `<div style="text-align: center; margin-bottom: 12px;"><img src="${logoUrl}" alt="Haven Kids Café" style="max-height: 48px; max-width: 180px; display: inline-block;" /></div>` : ''}
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Haven Kids Café</h1>
      <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">${headerTagline}</p>
    </div>
    <div class="content">
      <p style="font-size: 16px;">Liebe/r <strong>${b.customer_name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">
        ${greetingText}
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <span class="badge">Buchungscode: ${b.reference_code}</span>
      </div>

      <div class="details-box">
        <div class="row">
          <span class="label">Erlebnis / Service:</span>
          <span class="value">${b.service_name}</span>
        </div>
        <div class="row">
          <span class="label">Datum:</span>
          <span class="value">${b.date}</span>
        </div>
        <div class="row">
          <span class="label">Zeitslot:</span>
          <span class="value">${b.time_slot}</span>
        </div>
        <div class="row">
          <span class="label">Gäste:</span>
          <span class="value">${b.num_children} Kind(er), ${b.num_adults} Begleitperson(en)</span>
        </div>
        ${showPriceDetails ? `
        <div class="row">
          <span class="label">Gesamtbetrag:</span>
          <span class="value">${Number(b.total_price).toFixed(2)} € (Zahlung vor Ort)</span>
        </div>
        ` : ''}
      </div>

      ${visitGuidelines.length > 0 ? `
      <div style="background: #FFFDF5; border: 1px solid #FEF08A; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px;">
        <strong>Wichtige Hinweise für deinen Besuch:</strong>
        <ul style="margin: 8px 0 0; padding-left: 20px; line-height: 1.5;">
          ${visitGuidelines.map(g => `<li>${g}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <p style="font-size: 14px; color: #4A5568; line-height: 1.5;">
        <strong>Adresse:</strong> ${address}<br/>
        ${contactNote}
      </p>

      ${showCancellationLink ? `
      <div style="text-align: center; margin-top: 24px;">
        <a href="${cancelUrl}" class="btn-cancel">
          Pläne geändert? Hier mit deinem persönlichen Stornierungs-Token stornieren
        </a>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      ${footerNote}
    </div>
  </div>
</body>
</html>
    `;

    const configuredFrom = Deno.env.get('RESEND_FROM_EMAIL') || 'Haven Kids Café <buchung@havenkidscafe.de>';
    const isOwnerTesting = b.customer_email.toLowerCase() === 'jansatech.alsafi@gmail.com';
    let senderToUse = configuredFrom;

    let resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: senderToUse,
        to: [b.customer_email],
        subject: `Deine Buchungsbestätigung #${b.reference_code} — Haven Kids Café`,
        html: htmlContent,
      }),
    });

    let resendData = await resendResponse.json();

    // If custom domain failed (e.g. 403 unverified) and recipient is the owner testing, try with onboarding@resend.dev
    if (!resendResponse.ok && isOwnerTesting && senderToUse !== 'Haven Kids Café <onboarding@resend.dev>') {
      const fallbackResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Haven Kids Café <onboarding@resend.dev>',
          to: [b.customer_email],
          subject: `[TEST] Deine Buchungsbestätigung #${b.reference_code} — Haven Kids Café`,
          html: htmlContent,
        }),
      });
      if (fallbackResponse.ok) {
        resendData = await fallbackResponse.json();
      }
    }

    return new Response(JSON.stringify({ success: true, resendData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal Server Error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
