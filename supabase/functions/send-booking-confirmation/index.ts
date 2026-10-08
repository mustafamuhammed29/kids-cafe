// Supabase Edge Function: send-booking-confirmation
// Automatically invoked via Database Webhook or Secure API on public.bookings INSERT
// Uses Resend API for GDPR-compliant EU transactional email delivery

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
}

serve(async (req) => {
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

    const cancelUrl = b.cancellation_token
      ? `https://havenkidscafe.de/stornierung?token=${b.cancellation_token}`
      : 'https://havenkidscafe.de/contact';

    const htmlContent = `
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
      <p style="font-size: 16px;">Liebe/r <strong>${b.customer_name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">
        vielen Dank für deine Reservierung! Dein Besuch im <strong>Haven Kids Café</strong> ist verbindlich gebucht.
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
        <div class="row">
          <span class="label">Gesamtbetrag:</span>
          <span class="value">${Number(b.total_price).toFixed(2)} € (Zahlung vor Ort)</span>
        </div>
      </div>

      <div style="background: #FFFDF5; border: 1px solid #FEF08A; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px;">
        <strong>Wichtige Hinweise für deinen Besuch:</strong>
        <ul style="margin: 8px 0 0; padding-left: 20px; line-height: 1.5;">
          <li>Bitte bringe rutschfeste Stoppersocken für alle mit.</li>
          <li>Bitte erscheine ca. 10 Minuten vor Slot-Beginn.</li>
          <li>Kostenlose Online-Stornierung bis zu 2 Stunden vor dem Termin möglich.</li>
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

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Haven Kids Café <buchung@havenkidscafe.de>',
        to: [b.customer_email],
        subject: `Deine Buchungsbestätigung #${b.reference_code} — Haven Kids Café`,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

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
