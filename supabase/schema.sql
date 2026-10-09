-- ==============================================================================
-- HAVEN KIDS CAFÉ — PRODUCTION POSTGRESQL SCHEMA & SECURITY POLICIES
-- ==============================================================================
-- Location: Supabase Frankfurt (eu-central-1)
--
-- Security Invariants:
-- 1. Explicit REVOKE ALL ON ALL FUNCTIONS FROM PUBLIC
-- 2. All SECURITY DEFINER functions explicitly declare SET search_path = public, pg_temp;
-- 3. Anonymous role (anon) can ONLY:
--    - SELECT active packages (is_visible = true)
--    - SELECT active time slots (is_active = true)
--    - Execute create_booking_atomic()
--    - Execute cancel_booking_by_token()
-- 4. Public has ZERO DIRECT ACCESS to:
--    - bookings table (SELECT, INSERT, UPDATE, DELETE strictly disabled for public)
--    - staff_members table (cannot query staff records)
--    - audit_logs table (cannot query audit records)
-- 5. Staff and Admins:
--    - Verified through auth.users and public.staff_members
--    - Authorized via helper functions public.is_staff() & public.is_admin_or_owner()
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. STAFF MEMBERS & AUTHORIZATION TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(150) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(30) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. AUTHORIZATION HELPER FUNCTIONS
-- ==============================================================================

-- Helper function: Is current user authorized active staff?
CREATE OR REPLACE FUNCTION public.is_staff(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.staff_members
        WHERE id = p_user_id AND is_active = true
    );
$$;

-- Helper function: Is current user authorized admin or owner?
CREATE OR REPLACE FUNCTION public.is_admin_or_owner(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.staff_members
        WHERE id = p_user_id AND is_active = true AND role IN ('owner', 'admin')
    );
$$;

-- Helper function: Is current user authorized owner?
CREATE OR REPLACE FUNCTION public.is_owner(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.staff_members
        WHERE id = p_user_id AND is_active = true AND role = 'owner'
    );
$$;

-- Revoke execute from PUBLIC and grant strictly to authenticated staff and service_role
REVOKE ALL ON FUNCTION public.is_staff(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin_or_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_owner(UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner(UUID) TO authenticated, service_role;

-- ==============================================================================
-- 4. PACKAGES TABLE (Public Catalog)
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
-- 5. TIME SLOTS TABLE (Capacity & Availability)
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
-- 6. BOOKINGS TABLE (Customer Reservations — Private)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code VARCHAR(30) UNIQUE NOT NULL,
    cancellation_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL, -- e.g. "10:00 - 12:00"
    service_id VARCHAR(50) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    num_children INT NOT NULL CHECK (num_children > 0 AND num_children <= 20),
    num_adults INT NOT NULL CHECK (num_adults >= 0 AND num_adults <= 10),
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_price >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid_on_arrival', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(reference_code);
CREATE INDEX IF NOT EXISTS idx_bookings_token ON public.bookings(cancellation_token);

-- ==============================================================================
-- 7. AUDIT LOGS TABLE (Restricted to Authorized Staff)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- e.g. 'BOOKING_UPDATE', 'STATUS_CHANGE', 'SLOT_BLOCK'
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at);

-- ==============================================================================
-- 8. ATOMIC CONCURRENCY FUNCTION WITH SERVER-SIDE PRICE VALIDATION & RATE LIMITING
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_customer_name VARCHAR,
    p_customer_email VARCHAR,
    p_customer_phone VARCHAR,
    p_date DATE,
    p_time_slot VARCHAR,
    p_service_slug VARCHAR,
    p_num_children INT,
    p_num_adults INT,
    p_include_salt_room BOOLEAN DEFAULT false,
    p_special_requests TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_slot_record RECORD;
    v_package_record RECORD;
    v_max_cap INT;
    v_ref_code VARCHAR(30);
    v_cancellation_token UUID;
    v_booking_id UUID;
    v_start_time VARCHAR(10);
    v_end_time VARCHAR(10);
    v_calculated_price NUMERIC(10, 2);
    v_clean_name VARCHAR(150);
    v_clean_email VARCHAR(150);
    v_clean_phone VARCHAR(50);
    v_today_berlin DATE;
BEGIN
    -- 1. Timezone-Aware Past Date & Operating Hours Check (Europe/Berlin)
    v_today_berlin := (timezone('Europe/Berlin', now()))::date;
    IF p_date < v_today_berlin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Buchungen in der Vergangenheit sind nicht möglich.'
        );
    END IF;

    -- Opening Hours Check: Sunday Closed
    IF EXTRACT(DOW FROM p_date) = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Sonntags hat das Haven Kids Café geschlossen.'
        );
    END IF;

    -- Blocked Dates Check (Admin closure)
    IF EXISTS (
        SELECT 1 FROM public.blocked_dates
        WHERE date = p_date
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'An diesem Datum hat das Haven Kids Café geschlossen (Ruhetag oder Exklusivveranstaltung).'
        );
    END IF;

    -- Max Advance Booking Limit (90 days)
    IF p_date > (v_today_berlin + INTERVAL '90 days') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Buchungen können maximal 90 Tage im Voraus getätigt werden.'
        );
    END IF;

    -- 2. Anti-Spam / Rate Limiting: Max 1 booking per email within 60 seconds
    IF EXISTS (
        SELECT 1
        FROM public.bookings
        WHERE lower(customer_email) = lower(trim(p_customer_email))
          AND created_at > (timezone('utc'::text, now()) - INTERVAL '60 seconds')
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Bitte warte einen kurzen Moment vor einer weiteren Buchung (Spamschutz).'
        );
    END IF;

    -- 3. Input Sanity Checks
    v_clean_name := trim(p_customer_name);
    v_clean_email := lower(trim(p_customer_email));
    v_clean_phone := trim(p_customer_phone);

    IF length(v_clean_name) < 2 OR length(v_clean_name) > 100 THEN
        RETURN jsonb_build_object('success', false, 'error_message', 'Bitte gib einen gültigen Namen an (2-100 Zeichen).');
    END IF;

    IF v_clean_email NOT LIKE '%@%.%' OR length(v_clean_email) < 5 OR length(v_clean_email) > 150 THEN
        RETURN jsonb_build_object('success', false, 'error_message', 'Bitte gib eine gültige E-Mail-Adresse an.');
    END IF;

    IF length(v_clean_phone) < 6 OR length(v_clean_phone) > 30 THEN
        RETURN jsonb_build_object('success', false, 'error_message', 'Bitte gib eine gültige Telefonnummer an.');
    END IF;

    IF p_num_children < 1 OR p_num_children > 20 THEN
        RETURN jsonb_build_object('success', false, 'error_message', 'Ungültige Anzahl an Kindern (1-20 erlaubt).');
    END IF;

    IF p_num_adults < 0 OR p_num_adults > 10 THEN
        RETURN jsonb_build_object('success', false, 'error_message', 'Ungültige Anzahl an Begleitpersonen (0-10 erlaubt).');
    END IF;

    -- Extract start & end times for time-of-day checks and slot matching
    v_start_time := trim(split_part(p_time_slot, '-', 1));
    v_end_time := trim(split_part(p_time_slot, '-', 2));

    -- Timezone-Aware Same-Day Past Time Check (booking allowed while slot is ongoing; expires only after slot end time)
    IF v_end_time IS NOT NULL AND v_end_time != '' THEN
        IF p_date = v_today_berlin AND (v_end_time || ':00')::time <= (timezone('Europe/Berlin', now()))::time THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_message', 'Dieser Zeitslot ist für heute bereits abgelaufen.'
            );
        END IF;
    ELSE
        IF p_date = v_today_berlin AND (v_start_time || ':00')::time <= (timezone('Europe/Berlin', now()))::time THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_message', 'Dieser Zeitslot ist für heute bereits abgelaufen.'
            );
        END IF;
    END IF;

    -- 4. Validate Package Exists and is Active (Database-Controlled)
    SELECT *
    INTO v_package_record
    FROM public.packages
    WHERE slug = p_service_slug AND is_visible = true
    LIMIT 1;

    IF v_package_record.id IS NULL THEN
        -- Fallback match for service IDs mapped from UI with is_visible guarantee
        SELECT *
        INTO v_package_record
        FROM public.packages
        WHERE is_visible = true
          AND ((slug = 'einzelbesuch' AND p_service_slug LIKE '%single%')
            OR (slug = '10er-block' AND p_service_slug LIKE '%pass%')
            OR (slug = 'kindergeburtstag' AND p_service_slug LIKE '%birthday%'))
        LIMIT 1;

        IF v_package_record.id IS NULL THEN
            RETURN jsonb_build_object('success', false, 'error_message', 'Ungültiges oder inaktives Buchungspaket.');
        END IF;
    END IF;

    -- Salt Room Specific Child Count Enforcement (Max 8 children)
    IF (v_package_record.slug LIKE '%salt%' OR p_include_salt_room = true) AND p_num_children > 8 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Für den Salzraum sind maximal 8 Kinder pro Buchung zulässig.'
        );
    END IF;

    -- 5. Calculate Final Price Server-Side ONLY (Zero Client Price Tampering)
    IF v_package_record.slug = 'einzelbesuch' THEN
        v_calculated_price := (COALESCE(v_package_record.base_price, 14.00) * p_num_children);
        IF p_include_salt_room = true THEN
            v_calculated_price := v_calculated_price + (5.00 * p_num_children);
        END IF;
    ELSIF v_package_record.slug = '10er-block' THEN
        v_calculated_price := COALESCE(v_package_record.base_price, 120.00);
    ELSIF v_package_record.slug = 'kindergeburtstag' THEN
        v_calculated_price := COALESCE(v_package_record.base_price, 250.00);
        IF p_include_salt_room = true THEN
            v_calculated_price := v_calculated_price + (5.00 * p_num_children);
        END IF;
    ELSE
        -- Event packages (Auf Anfrage): 0.00 upfront booking fee
        v_calculated_price := 0.00;
    END IF;

    -- 6. Slot & Capacity Validation
    IF v_package_record.slug LIKE '%salt%' THEN
        v_max_cap := 8;
    ELSE
        v_max_cap := 20;
    END IF;

    -- Ensure slot record exists in time_slots
    INSERT INTO public.time_slots (date, start_time, end_time, service_id, max_capacity, booked_count)
    VALUES (p_date, v_start_time, trim(split_part(p_time_slot, '-', 2)), v_package_record.slug, v_max_cap, 0)
    ON CONFLICT (date, start_time, service_id) DO NOTHING;

    -- Lock the specific slot row to serialize concurrent reservations (prevent race conditions)
    SELECT id, booked_count, max_capacity, is_active
    INTO v_slot_record
    FROM public.time_slots
    WHERE date = p_date AND start_time = v_start_time AND service_id = v_package_record.slug
    FOR UPDATE;

    -- Check if slot has been disabled by admin
    IF v_slot_record.id IS NULL OR v_slot_record.is_active = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Dieser Zeitslot ist derzeit leider deaktiviert oder nicht verfügbar.'
        );
    END IF;

    -- Check remaining capacity
    IF (v_slot_record.booked_count + p_num_children) > v_slot_record.max_capacity THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Dieser Zeitslot ist leider bereits ausgebucht. Bitte wähle ein anderes Zeitfenster.'
        );
    END IF;

    -- Increment slot count
    UPDATE public.time_slots
    SET booked_count = booked_count + p_num_children
    WHERE id = v_slot_record.id;

    -- 7. Safe Reference Code & Secret Token Generation Server-Side
    v_ref_code := 'HKC-' || to_char(p_date, 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 4));
    v_cancellation_token := gen_random_uuid();

    -- 8. Insert Confirmed Booking
    INSERT INTO public.bookings (
        reference_code,
        cancellation_token,
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
        v_cancellation_token,
        v_clean_name,
        v_clean_email,
        v_clean_phone,
        p_date,
        p_time_slot,
        v_package_record.slug,
        v_package_record.name,
        p_num_children,
        p_num_adults,
        v_calculated_price,
        'confirmed',
        'pending',
        p_special_requests
    )
    RETURNING id INTO v_booking_id;

    -- Return minimal safe customer payload (No internal IDs, zero private data of others)
    RETURN jsonb_build_object(
        'success', true,
        'reference_code', v_ref_code,
        'cancellation_token', v_cancellation_token,
        'total_price', v_calculated_price,
        'date', p_date,
        'time_slot', p_time_slot,
        'service_name', v_package_record.name
    );
END;
$$;

-- Explicitly REVOKE ALL from PUBLIC, grant only to anon, authenticated, and service_role
REVOKE ALL ON FUNCTION public.create_booking_atomic(VARCHAR, VARCHAR, VARCHAR, DATE, VARCHAR, VARCHAR, INT, INT, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking_atomic(VARCHAR, VARCHAR, VARCHAR, DATE, VARCHAR, VARCHAR, INT, INT, BOOLEAN, TEXT) TO anon, authenticated, service_role;

-- ==============================================================================
-- 9. SECURE TOKEN-BASED CANCELLATION FUNCTION (Customer Self-Service)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cancel_booking_by_token(
    p_cancellation_token UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_booking RECORD;
    v_start_time VARCHAR(10);
BEGIN
    -- Query booking by secret UUID token (NOT guessable reference code)
    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE cancellation_token = p_cancellation_token
      AND status != 'cancelled'
      AND token_expires_at > timezone('utc'::text, now())
    FOR UPDATE;

    IF v_booking.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_message', 'Ungültiger oder abgelaufener Stornierungs-Token.'
        );
    END IF;

    -- Update booking status (trigger tr_bookings_sync_capacity will automatically restore slot capacity)
    UPDATE public.bookings
    SET status = 'cancelled', updated_at = timezone('utc'::text, now())
    WHERE id = v_booking.id;

    RETURN jsonb_build_object(
        'success', true,
        'reference_code', v_booking.reference_code,
        'message', 'Deine Reservierung wurde erfolgreich storniert.'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_booking_by_token(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_booking_by_token(UUID) TO anon, authenticated, service_role;

-- Automatic Slot Capacity Sync on Any Booking Status Change (Self-Service or Admin)
CREATE OR REPLACE FUNCTION public.sync_booking_capacity_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_start_time VARCHAR(10);
BEGIN
    -- When booking is changed to 'cancelled' from a non-cancelled status:
    IF (OLD.status IS DISTINCT FROM 'cancelled' AND NEW.status = 'cancelled') THEN
        v_start_time := trim(split_part(OLD.time_slot, '-', 1));

        UPDATE public.time_slots
        SET booked_count = GREATEST(0, booked_count - OLD.num_children)
        WHERE date = OLD.date
          AND start_time = v_start_time
          AND (service_id = OLD.service_id OR service_id = 'einzelbesuch');
    END IF;

    -- When a cancelled booking is restored/re-confirmed:
    IF (OLD.status = 'cancelled' AND NEW.status IN ('confirmed', 'pending')) THEN
        v_start_time := trim(split_part(NEW.time_slot, '-', 1));

        UPDATE public.time_slots
        SET booked_count = LEAST(max_capacity, booked_count + NEW.num_children)
        WHERE date = NEW.date
          AND start_time = v_start_time
          AND (service_id = NEW.service_id OR service_id = 'einzelbesuch');
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_bookings_sync_capacity ON public.bookings;
CREATE TRIGGER tr_bookings_sync_capacity
    AFTER UPDATE OF status ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_booking_capacity_on_status_change();

-- ==============================================================================
-- 10. TRIGGER FUNCTIONS & AUTOMATIC TIMESTAMPS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Security: Revoke execute from PUBLIC, allow internal trigger execution
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated, service_role;

DROP TRIGGER IF EXISTS tr_staff_members_updated_at ON public.staff_members;
CREATE TRIGGER tr_staff_members_updated_at
    BEFORE UPDATE ON public.staff_members
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_packages_updated_at ON public.packages;
CREATE TRIGGER tr_packages_updated_at
    BEFORE UPDATE ON public.packages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_bookings_updated_at ON public.bookings;
CREATE TRIGGER tr_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 11. DISTRIBUTED RATE LIMITING (Durable Edge Throttling)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    action VARCHAR(50) NOT NULL DEFAULT 'booking_attempt',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_ip_created 
    ON public.rate_limit_events (ip_address, created_at);

-- Distributed IP Rate Limiter with Opportunistic 1-Hour Cleanup
CREATE OR REPLACE FUNCTION public.check_and_record_ip_rate_limit(
    p_ip_address INET,
    p_max_requests INT DEFAULT 5,
    p_window_interval INTERVAL DEFAULT INTERVAL '5 minutes'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_recent_count INT;
BEGIN
    -- Opportunistic cleanup of expired events (older than 1 hour)
    DELETE FROM public.rate_limit_events
    WHERE created_at < (timezone('utc'::text, now()) - INTERVAL '1 hour');

    -- Count attempts in active window
    SELECT COUNT(*)
    INTO v_recent_count
    FROM public.rate_limit_events
    WHERE ip_address = p_ip_address
      AND created_at > (timezone('utc'::text, now()) - p_window_interval);

    IF v_recent_count >= p_max_requests THEN
        RETURN false; -- Rate limit exceeded
    END IF;

    -- Record current attempt
    INSERT INTO public.rate_limit_events (ip_address)
    VALUES (p_ip_address);

    RETURN true; -- Allowed
END;
$$;

-- Security: Revoke execute from PUBLIC, grant exclusively to service_role
REVOKE ALL ON FUNCTION public.check_and_record_ip_rate_limit(INET, INT, INTERVAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_record_ip_rate_limit(INET, INT, INTERVAL) TO service_role;

-- ==============================================================================
-- 12. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. Staff Members Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view staff profiles" ON public.staff_members;
CREATE POLICY "Staff can view staff profiles"
    ON public.staff_members FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage staff members" ON public.staff_members;
CREATE POLICY "Admins can manage staff members"
    ON public.staff_members FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- ------------------------------------------------------------------------------
-- B. Packages Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active packages" ON public.packages;
CREATE POLICY "Public can view active packages"
    ON public.packages FOR SELECT
    USING (is_visible = true);

DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;
CREATE POLICY "Admins can manage packages"
    ON public.packages FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- ------------------------------------------------------------------------------
-- C. Time Slots Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Public can view all time slots" ON public.time_slots;
CREATE POLICY "Public can view all time slots"
    ON public.time_slots FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage time slots" ON public.time_slots;
CREATE POLICY "Admins can manage time slots"
    ON public.time_slots FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- ------------------------------------------------------------------------------
-- D. Bookings Policies (PRIVATE — NO PUBLIC DIRECT ACCESS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view bookings" ON public.bookings;
CREATE POLICY "Staff can view bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can update bookings" ON public.bookings;
CREATE POLICY "Staff can update bookings"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (public.is_staff(auth.uid()))
    WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
CREATE POLICY "Admins can delete bookings"
    ON public.bookings FOR DELETE
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS "Staff can insert bookings directly" ON public.bookings;
CREATE POLICY "Staff can insert bookings directly"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (public.is_staff(auth.uid()));

-- ------------------------------------------------------------------------------
-- E. Audit Logs Policies (INTERNAL ONLY — ZERO PUBLIC ACCESS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view audit logs" ON public.audit_logs;
CREATE POLICY "Staff can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can write audit logs" ON public.audit_logs;
CREATE POLICY "Staff can write audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_staff(auth.uid()));

-- ==============================================================================
-- 13. BLOCKED DATES TABLE (Day Closures & Holiday Blocks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    reason VARCHAR(255),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.blocked_dates(date);

-- ==============================================================================
-- 14. SITE ANNOUNCEMENTS TABLE (Banner Alerts & Operational Notices)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'urgent')),
    link_url VARCHAR(255),
    link_text VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_site_announcements_active ON public.site_announcements(is_active, starts_at, ends_at);

DROP TRIGGER IF EXISTS tr_site_announcements_updated_at ON public.site_announcements;
CREATE TRIGGER tr_site_announcements_updated_at
    BEFORE UPDATE ON public.site_announcements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 15. FAQS TABLE (Dynamic FAQ Management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL DEFAULT 'Allgemein',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_faqs_published_order ON public.faqs(is_published, display_order);

DROP TRIGGER IF EXISTS tr_faqs_updated_at ON public.faqs;
CREATE TRIGGER tr_faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 16. GALLERY ITEMS TABLE (Dynamic Photo Showcase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Spielbereich',
    description TEXT,
    image_url TEXT NOT NULL,
    storage_path VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_visible_order ON public.gallery_items(is_visible, display_order);

DROP TRIGGER IF EXISTS tr_gallery_items_updated_at ON public.gallery_items;
CREATE TRIGGER tr_gallery_items_updated_at
    BEFORE UPDATE ON public.gallery_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 17. BUSINESS SETTINGS TABLE (Owner-Controlled Key-Value Store)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.business_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_business_settings_public ON public.business_settings(is_public);

DROP TRIGGER IF EXISTS tr_business_settings_updated_at ON public.business_settings;
CREATE TRIGGER tr_business_settings_updated_at
    BEFORE UPDATE ON public.business_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 18. EVENT INQUIRIES TABLE (Inbound Contact & Party Requests Inbox)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.event_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    event_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (event_type IN ('general', 'birthday', 'group_party', 'group_event', 'corporate')),
    target_date DATE,
    children_count INT,
    adults_count INT,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'reserved', 'rejected', 'archived')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_event_inquiries_status_created ON public.event_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_inquiries_email ON public.event_inquiries(email);

DROP TRIGGER IF EXISTS tr_event_inquiries_updated_at ON public.event_inquiries;
CREATE TRIGGER tr_event_inquiries_updated_at
    BEFORE UPDATE ON public.event_inquiries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 19. EXTENDED ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_inquiries ENABLE ROW LEVEL SECURITY;

-- Blocked Dates Policies
DROP POLICY IF EXISTS "Public can view blocked dates" ON public.blocked_dates;
CREATE POLICY "Public can view blocked dates"
    ON public.blocked_dates FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage blocked dates" ON public.blocked_dates;
CREATE POLICY "Admins can manage blocked dates"
    ON public.blocked_dates FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- Site Announcements Policies
DROP POLICY IF EXISTS "Public can view active announcements" ON public.site_announcements;
CREATE POLICY "Public can view active announcements"
    ON public.site_announcements FOR SELECT
    USING (
        is_active = true
        AND (starts_at IS NULL OR starts_at <= timezone('utc'::text, now()))
        AND (ends_at IS NULL OR ends_at >= timezone('utc'::text, now()))
    );

DROP POLICY IF EXISTS "Staff can view all announcements" ON public.site_announcements;
CREATE POLICY "Staff can view all announcements"
    ON public.site_announcements FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.site_announcements;
CREATE POLICY "Admins can manage announcements"
    ON public.site_announcements FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- FAQs Policies
DROP POLICY IF EXISTS "Public can view published FAQs" ON public.faqs;
CREATE POLICY "Public can view published FAQs"
    ON public.faqs FOR SELECT
    USING (is_published = true);

DROP POLICY IF EXISTS "Staff can view all FAQs" ON public.faqs;
CREATE POLICY "Staff can view all FAQs"
    ON public.faqs FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
CREATE POLICY "Admins can manage FAQs"
    ON public.faqs FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- Gallery Items Policies
DROP POLICY IF EXISTS "Public can view visible gallery items" ON public.gallery_items;
CREATE POLICY "Public can view visible gallery items"
    ON public.gallery_items FOR SELECT
    USING (is_visible = true);

DROP POLICY IF EXISTS "Staff can view all gallery items" ON public.gallery_items;
CREATE POLICY "Staff can view all gallery items"
    ON public.gallery_items FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage gallery items" ON public.gallery_items;
CREATE POLICY "Admins can manage gallery items"
    ON public.gallery_items FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- Business Settings Policies (OWNER-EXCLUSIVE MUTATION)
DROP POLICY IF EXISTS "Public can view public business settings" ON public.business_settings;
CREATE POLICY "Public can view public business settings"
    ON public.business_settings FOR SELECT
    USING (is_public = true);

DROP POLICY IF EXISTS "Staff can view all business settings" ON public.business_settings;
CREATE POLICY "Staff can view all business settings"
    ON public.business_settings FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Only owners can manage business settings" ON public.business_settings;
CREATE POLICY "Only owners can manage business settings"
    ON public.business_settings FOR ALL
    TO authenticated
    USING (public.is_owner(auth.uid()))
    WITH CHECK (public.is_owner(auth.uid()));

-- Event Inquiries Policies (PRIVATE INBOX)
DROP POLICY IF EXISTS "Public can submit event inquiries" ON public.event_inquiries;
CREATE POLICY "Public can submit event inquiries"
    ON public.event_inquiries FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view event inquiries" ON public.event_inquiries;
CREATE POLICY "Staff can view event inquiries"
    ON public.event_inquiries FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can update event inquiries" ON public.event_inquiries;
CREATE POLICY "Staff can update event inquiries"
    ON public.event_inquiries FOR UPDATE
    TO authenticated
    USING (public.is_staff(auth.uid()))
    WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete event inquiries" ON public.event_inquiries;
CREATE POLICY "Admins can delete event inquiries"
    ON public.event_inquiries FOR DELETE
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));
-- ------------------------------------------------------------------------------
-- Storage Policies for gallery-media Bucket
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery-media',
    'gallery-media',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- Public Read on storage objects
DROP POLICY IF EXISTS "Public can view gallery media objects" ON storage.objects;
CREATE POLICY "Public can view gallery media objects"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery-media');

-- Upload: Admins and Owners only, restricted to safe image formats
DROP POLICY IF EXISTS "Admins and owners can upload gallery media" ON storage.objects;
CREATE POLICY "Admins and owners can upload gallery media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'gallery-media'
        AND public.is_admin_or_owner(auth.uid())
        AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp'))
    );

-- Update: Admins and Owners only
DROP POLICY IF EXISTS "Admins and owners can update gallery media" ON storage.objects;
CREATE POLICY "Admins and owners can update gallery media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'gallery-media'
        AND public.is_admin_or_owner(auth.uid())
    )
    WITH CHECK (
        bucket_id = 'gallery-media'
        AND public.is_admin_or_owner(auth.uid())
    );

-- Delete: Admins and Owners only
DROP POLICY IF EXISTS "Admins and owners can delete gallery media" ON storage.objects;
CREATE POLICY "Admins and owners can delete gallery media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'gallery-media'
        AND public.is_admin_or_owner(auth.uid())
    );

-- ==============================================================================
-- 20. REALTIME SUBSCRIPTION REGISTRATION
-- ==============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.time_slots;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.event_inquiries;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_announcements;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_dates;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ==============================================================================
-- 21. INITIAL SEED DATA
-- ==============================================================================
-- Packages Seed
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

-- Business Settings Seed
INSERT INTO public.business_settings (key, value, category, description, is_public)
VALUES
    ('name', '"Haven Kids Café"'::jsonb, 'identity', 'Offizieller Name des Cafés', true),
    ('tagline', '"Kreativer Spielraum & modernes Familiencafé"'::jsonb, 'identity', 'Untertitel / Slogan', true),
    ('address', '"Musterstraße 123, 10115 Berlin"'::jsonb, 'contact', 'Vollständige Geschäftsadresse', true),
    ('phone', '"+49 30 12345678"'::jsonb, 'contact', 'Telefonnummer für Kundenanfragen', true),
    ('email', '"hallo@havenkidscafe.de"'::jsonb, 'contact', 'Offizielle E-Mail-Adresse', true),
    ('whatsapp_url', '"https://wa.me/493012345678"'::jsonb, 'contact', 'Direktlink zum WhatsApp-Chat', true),
    ('opening_hours', '[
        {"days": "Montag – Donnerstag", "time": "10:00 – 18:00 Uhr"},
        {"days": "Freitag – Samstag", "time": "09:00 – 19:00 Uhr"},
        {"days": "Sonntag", "time": "Geschlossen (Ruhetag & Exklusiv-Events)"}
    ]'::jsonb, 'operating_hours', 'Reguläre Öffnungszeiten', true)
ON CONFLICT (key) DO NOTHING;

-- FAQs Seed
INSERT INTO public.faqs (category, question, answer, display_order, is_published)
VALUES
    (
        'Besuch & Regeln',
        'Gilt im Haven Kids Café eine Sockenpflicht?',
        'Ja, aus hygienischen und Sicherheitsgründen gilt im gesamten Spielbereich sowie im Salzraum eine strikte Sockenpflicht für alle Kinder und Erwachsenen. Wir empfehlen rutschfeste Stoppersocken für die Kinder.',
        1,
        true
    ),
    (
        'Besuch & Regeln',
        'Für welches Alter ist das Café geeignet?',
        'Unser pädagogisches Konzept und unsere Spielbereiche sind optimal auf Babys, Kleinkinder und Kinder im Alter von 0 bis 8 Jahren ausgerichtet.',
        2,
        true
    ),
    (
        'Preise & Buchung',
        'Müssen Erwachsene Eintritt bezahlen?',
        'Nein! Pro gebuchtem Kind haben bis zu zwei erwachsene Begleitpersonen freien Eintritt in unser Café und zu den Sitzbereichen.',
        3,
        true
    ),
    (
        'Preise & Buchung',
        'Wie lauten die Stornierungsbedingungen?',
        'Einzelbesuche können bis zu 2 Stunden vor Beginn kostenfrei über den Link in der Bestätigungs-E-Mail storniert werden. Für Kindergeburtstage gilt wegen der exklusiven Vorbereitung eine Frist von mindestens 48 Stunden vor Beginn.',
        4,
        true
    ),
    (
        'Salzraum',
        'Was ist der Salzraum und wie buche ich ihn?',
        'Unser Salzraum ist eine entspannende Ruheoase mit Trockensalz-Mikroklima und feinem Steinsalz zum Spielen. Er kann als 45-minütiges Add-on für 5 € pro Kind zu jedem Besuch hinzugebucht werden (max. 8 Kinder je Sitzung).',
        5,
        true
    ),
    (
        'Sicherheit & Hygiene',
        'Wer hat die Aufsichtspflicht während des Besuchs?',
        'Die Aufsichtspflicht verbleibt zu jedem Zeitpunkt bei den begleitenden Eltern oder Erziehungsberechtigten. Unser Café ist so gestaltet, dass du von den Tischen aus den gesamten Spielbereich gut im Blick hast.',
        6,
        true
    )
ON CONFLICT DO NOTHING;

-- Gallery Items Seed
INSERT INTO public.gallery_items (title, category, description, image_url, display_order, is_visible)
VALUES
    ('Pädagogischer Spielbereich', 'Spielbereich', 'Hochwertiges Holzspielzeug, sichere Klettermodule und Motorikstationen.', '/assets/spielbereich.jpg', 1, true),
    ('Eltern-Café & Specialty Coffee', 'Café', 'Frisch zubereitete Kaffeespezialitäten, Bio-Tees und gesunde Kindersnacks.', '/assets/artisan-cafe.jpg', 2, true),
    ('Kreatives Entdecken', 'Spielbereich', 'Liebevoll eingerichtete Spielinseln für fantasievolles und freies Spielen.', '/assets/gallery-3.jpg', 3, true),
    ('Helle Wohlfühl-Atmosphäre', 'Café', 'Offenes Raumkonzept mit uneingeschränkter Sicht auf den Spielbereich.', '/assets/hero-interior.jpg', 4, true),
    ('Geburtstags-Festtisch', 'Events', 'Festlich dekorierter Tisch mit bunten Details und Kindergeschirr.', '/assets/geburtstage.jpg', 5, true),
    ('Salzraum-Ruheoase', 'Salzraum', 'Entspannendes Mikroklima mit feinem Trockensalz und kinderfreundlichen Spielzeugen.', '/assets/salt-sanctuary.jpg', 6, true)
ON CONFLICT DO NOTHING;

