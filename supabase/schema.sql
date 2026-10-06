-- ==============================================================================
-- HAVEN KIDS CAFÉ — PRODUCTION POSTGRESQL SCHEMA (SUPABASE FRANKFURT EU-CENTRAL-1)
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running (safe initialization)
-- DROP TABLE IF EXISTS public.bookings CASCADE;
-- DROP TABLE IF EXISTS public.time_slots CASCADE;
-- DROP TABLE IF EXISTS public.packages CASCADE;

-- ==============================================================================
-- 3. PACKAGES TABLE (Phase 1 & Phase 3 Admin Editable)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('fixed', 'on-request', 'from')),
    base_price NUMERIC(10, 2),
    currency VARCHAR(10) NOT NULL DEFAULT '€',
    cta_text VARCHAR(50) NOT NULL DEFAULT 'Jetzt buchen',
    cta_action VARCHAR(30) NOT NULL CHECK (cta_action IN ('book', 'whatsapp', 'contact-form')),
    is_visible BOOLEAN NOT NULL DEFAULT true,
    category VARCHAR(30) NOT NULL CHECK (category IN ('standard', 'group', 'corporate')),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. TIME SLOTS TABLE (Capacity & Concurrency Management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL, -- e.g. "10:00"
    end_time VARCHAR(10) NOT NULL,   -- e.g. "12:00"
    service_id VARCHAR(50) NOT NULL,
    max_capacity INT NOT NULL DEFAULT 20,
    booked_count INT NOT NULL DEFAULT 0 CHECK (booked_count >= 0 AND booked_count <= max_capacity),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_slot_per_service UNIQUE (date, start_time, service_id)
);

CREATE INDEX IF NOT EXISTS idx_time_slots_date_service ON public.time_slots(date, service_id);

-- ==============================================================================
-- 5. BOOKINGS TABLE (Customer Reservations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code VARCHAR(30) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL, -- e.g. "10:00 - 12:00"
    service_id VARCHAR(50) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    num_children INT NOT NULL CHECK (num_children > 0),
    num_adults INT NOT NULL CHECK (num_adults >= 0),
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid_on_arrival', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(reference_code);

-- ==============================================================================
-- 6. ATOMIC CONCURRENCY FUNCTION (Zero Overbooking)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_customer_name VARCHAR,
    p_customer_email VARCHAR,
    p_customer_phone VARCHAR,
    p_date DATE,
    p_time_slot VARCHAR,
    p_service_id VARCHAR,
    p_service_name VARCHAR,
    p_num_children INT,
    p_num_adults INT,
    p_total_price NUMERIC,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_slot_record RECORD;
    v_max_cap INT;
    v_ref_code VARCHAR(30);
    v_booking_id UUID;
    v_start_time VARCHAR(10);
BEGIN
    -- Extract start time from string "10:00 - 12:00"
    v_start_time := trim(split_part(p_time_slot, '-', 1));

    -- Determine max capacity according to business rules
    IF p_service_id = 'salt-room' THEN
        v_max_cap := 8;
    ELSE
        v_max_cap := 20;
    END IF;

    -- Ensure slot record exists with row-level lock (FOR UPDATE)
    INSERT INTO public.time_slots (date, start_time, end_time, service_id, max_capacity, booked_count)
    VALUES (p_date, v_start_time, trim(split_part(p_time_slot, '-', 2)), p_service_id, v_max_cap, 0)
    ON CONFLICT (date, start_time, service_id) DO NOTHING;

    -- Lock the specific slot row to serialize concurrent reservations
    SELECT id, booked_count, max_capacity
    INTO v_slot_record
    FROM public.time_slots
    WHERE date = p_date AND start_time = v_start_time AND service_id = p_service_id
    FOR UPDATE;

    -- Check if slot has enough remaining capacity
    IF (v_slot_record.booked_count + p_num_children) > v_slot_record.max_capacity THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Dieser Zeitslot ist leider bereits ausgebucht. Bitte wähle ein anderes Zeitfenster.'
        );
    END IF;

    -- Update slot booked count
    UPDATE public.time_slots
    SET booked_count = booked_count + p_num_children
    WHERE id = v_slot_record.id;

    -- Generate reference code: HKC-YYYYMMDD-XXXX
    v_ref_code := 'HKC-' || to_char(p_date, 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

    -- Insert confirmed booking
    INSERT INTO public.bookings (
        reference_code,
        customer_name,
        customer_email,
        customer_phone,
        date,
        time_slot,
        service_id,
        service_name,
        num_children,
        num_adults,
        total_price,
        status,
        payment_status,
        notes
    ) VALUES (
        v_ref_code,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_date,
        p_time_slot,
        p_service_id,
        p_service_name,
        p_num_children,
        p_num_adults,
        p_total_price,
        'confirmed',
        'pending',
        p_notes
    )
    RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'reference_code', v_ref_code
    );
END;
$$;

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Packages policies
CREATE POLICY "Public can view active packages"
    ON public.packages FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Admins full access on packages"
    ON public.packages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Time slots policies
CREATE POLICY "Public can view time slots"
    ON public.time_slots FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins full access on time slots"
    ON public.time_slots FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Bookings policies
CREATE POLICY "Public can view own booking via reference"
    ON public.bookings FOR SELECT
    USING (true);

CREATE POLICY "Admins full access on bookings"
    ON public.bookings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 8. REALTIME SUBSCRIPTION REGISTRATION
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- ==============================================================================
-- 9. INITIAL SEED DATA (All 6 Packages)
-- ==============================================================================
INSERT INTO public.packages (slug, name, subtitle, description, features, price_type, base_price, currency, cta_text, cta_action, is_visible, category, display_order)
VALUES
(
    'einzelbesuch',
    'Einzelbesuch',
    'Für spontane Ausflüge',
    'Ein Einzeleintritt für 2 Stunden unbeschwertes Spielen und Entdecken.',
    '["2 Stunden Spielzeit", "1 Kind + 1 Begleitperson", "Freier Zugang zum Café", "Garderobe & Spind inklusive"]'::jsonb,
    'fixed',
    14.00,
    '€',
    'Jetzt buchen',
    'book',
    true,
    'standard',
    1
),
(
    '10er-block',
    '10er-Block Pass',
    'Für regelmäßige Besucher',
    'Unser flexibler Zehnerblock – spare über 14% gegenüber Einzeltickets.',
    '["10 x 2 Stunden Spielzeit", "Übertragbar auf Geschwister", "12 Monate gültig", "1 Begleitperson pro Kind inklusive", "10% Rabatt auf Café-Getränke"]'::jsonb,
    'fixed',
    120.00,
    '€',
    'Jetzt sichern',
    'book',
    true,
    'standard',
    2
),
(
    'kindergeburtstag',
    'Kindergeburtstag',
    'Das Rundum-Sorglos-Paket',
    'Die perfekte Geburtstagsparty für bis zu 8 Kinder im geschmückten Partybereich.',
    '["3 Stunden reservierter Partytisch", "Bis zu 8 Kinder (weitere zubuchbar)", "Bio-Fruchtsäfte & Wasser-Flatrate", "Bunte Geburtstagsdekoration", "Geschenkbox für das Geburtstagskind"]'::jsonb,
    'fixed',
    250.00,
    '€',
    'Termin anfragen',
    'book',
    true,
    'standard',
    3
),
(
    'gruppenfeier',
    'Gruppenfeier',
    'Für Geburtstage und private Feiern',
    'Exklusive Raumnutzung und individuelle Betreuung für größere Feierlichkeiten.',
    '["Bis zu 15 Kinder", "3 Stunden exklusive Nutzung", "Eigene Betreuungskraft optional", "Dekoration und Snacks inklusive"]'::jsonb,
    'on-request',
    NULL,
    '€',
    'Anfrage stellen',
    'whatsapp',
    true,
    'group',
    4
),
(
    'gruppen-events',
    'Gruppen-Events',
    'Für Schulen, Kindergärten und Vereine',
    'Maßgeschneiderte Vormittage und Aktivitäten für Bildungseinrichtungen.',
    '["Spezielle Gruppenpreise", "Pädagogisch betreute Aktivitäten", "Flexible Zeitfenster", "Rabatt ab 10 Kindern"]'::jsonb,
    'on-request',
    NULL,
    '€',
    'Gruppenanfrage',
    'contact-form',
    true,
    'group',
    5
),
(
    'firmen-events',
    'Firmen-Events',
    'Teambuilding und Firmenfeiern',
    'Familienfreundliche Firmen-Events und exklusive Abendevents mit Catering.',
    '["Exklusive Buchung möglich", "Catering-Optionen", "Abendveranstaltungen", "Individuelle Konzepte"]'::jsonb,
    'on-request',
    NULL,
    '€',
    'Firmenanfrage',
    'contact-form',
    true,
    'corporate',
    6
)
ON CONFLICT (slug) DO NOTHING;
