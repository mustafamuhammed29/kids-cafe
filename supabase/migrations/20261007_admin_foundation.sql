-- ==============================================================================
-- HAVEN KIDS CAFÉ — MIGRATION: ADMIN DASHBOARD BACKEND FOUNDATION
-- Migration Date: 2026-10-07
-- Modules: blocked_dates, site_announcements, faqs, gallery_items, business_settings, event_inquiries
-- ==============================================================================

-- 1. Helper function: Is current user owner?
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

REVOKE ALL ON FUNCTION public.is_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner(UUID) TO authenticated, service_role;

-- ==============================================================================
-- 2. BLOCKED DATES TABLE (Day Closures & Holiday Blocks)
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
-- 3. SITE ANNOUNCEMENTS TABLE (Banner Alerts & Operational Notices)
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
-- 4. FAQS TABLE (Dynamic FAQ Management)
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
-- 5. GALLERY ITEMS TABLE (Dynamic Photo Showcase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Spielbereich',
    description TEXT,
    image_url TEXT NOT NULL,
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
-- 6. BUSINESS SETTINGS TABLE (Owner-Controlled Key-Value Store)
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
-- 7. EVENT INQUIRIES TABLE (Inbound Contact & Party Requests Inbox)
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
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_inquiries ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. Blocked Dates Policies
-- ------------------------------------------------------------------------------
-- Public (anon) can read all blocked dates to grey them out in booking picker
CREATE POLICY "Public can view blocked dates"
    ON public.blocked_dates FOR SELECT
    USING (true);

-- Admins and owners can insert/update/delete blocked dates
CREATE POLICY "Admins can manage blocked dates"
    ON public.blocked_dates FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- ------------------------------------------------------------------------------
-- B. Site Announcements Policies
-- ------------------------------------------------------------------------------
-- Public can view active announcements within valid schedule
CREATE POLICY "Public can view active announcements"
    ON public.site_announcements FOR SELECT
    USING (
        is_active = true
        AND (starts_at IS NULL OR starts_at <= timezone('utc'::text, now()))
        AND (ends_at IS NULL OR ends_at >= timezone('utc'::text, now()))
    );

-- Staff can view all announcements regardless of status
CREATE POLICY "Staff can view all announcements"
    ON public.site_announcements FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Admins and owners can manage announcements
CREATE POLICY "Admins can manage announcements"
    ON public.site_announcements FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- ------------------------------------------------------------------------------
-- C. FAQs Policies
-- ------------------------------------------------------------------------------
-- Public can view published FAQs
CREATE POLICY "Public can view published FAQs"
    ON public.faqs FOR SELECT
    USING (is_published = true);

-- Staff can view all FAQs
CREATE POLICY "Staff can view all FAQs"
    ON public.faqs FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Admins and owners can manage FAQs
CREATE POLICY "Admins can manage FAQs"
    ON public.faqs FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- ------------------------------------------------------------------------------
-- D. Gallery Items Policies
-- ------------------------------------------------------------------------------
-- Public can view visible gallery items
CREATE POLICY "Public can view visible gallery items"
    ON public.gallery_items FOR SELECT
    USING (is_visible = true);

-- Staff can view all gallery items
CREATE POLICY "Staff can view all gallery items"
    ON public.gallery_items FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Admins and owners can manage gallery items
CREATE POLICY "Admins can manage gallery items"
    ON public.gallery_items FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()))
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- ------------------------------------------------------------------------------
-- E. Business Settings Policies (OWNER-GOVERNED)
-- ------------------------------------------------------------------------------
-- Public can view public business settings (address, phone, hours, etc.)
CREATE POLICY "Public can view public business settings"
    ON public.business_settings FOR SELECT
    USING (is_public = true);

-- Staff can view all business settings
CREATE POLICY "Staff can view all business settings"
    ON public.business_settings FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- ONLY Owner can modify/insert/update/delete business identity data
CREATE POLICY "Only owners can manage business settings"
    ON public.business_settings FOR ALL
    TO authenticated
    USING (public.is_owner(auth.uid()))
    WITH CHECK (public.is_owner(auth.uid()));

-- ------------------------------------------------------------------------------
-- F. Event Inquiries Policies (PRIVATE INBOX)
-- ------------------------------------------------------------------------------
-- Public can INSERT inquiries (contact form / party inquiries)
CREATE POLICY "Public can submit event inquiries"
    ON public.event_inquiries FOR INSERT
    WITH CHECK (true);

-- Public has ZERO DIRECT READ access to event inquiries
-- Staff can view and update inquiries (triage, status change, notes)
CREATE POLICY "Staff can view event inquiries"
    ON public.event_inquiries FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update event inquiries"
    ON public.event_inquiries FOR UPDATE
    TO authenticated
    USING (public.is_staff(auth.uid()))
    WITH CHECK (public.is_staff(auth.uid()));

-- Admins and owners can delete inquiries
CREATE POLICY "Admins can delete event inquiries"
    ON public.event_inquiries FOR DELETE
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));

-- ==============================================================================
-- 9. REALTIME PUBLICATION REGISTRATION
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_inquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_dates;

-- ==============================================================================
-- 10. SEED DATA
-- ==============================================================================
-- Business Settings Initial Seed
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

-- FAQs Initial Seed
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

-- Gallery Items Initial Seed
INSERT INTO public.gallery_items (title, category, description, image_url, display_order, is_visible)
VALUES
    ('Pädagogischer Spielbereich', 'Spielbereich', 'Hochwertiges Holzspielzeug, sichere Klettermodule und Motorikstationen.', '/assets/spielbereich.jpg', 1, true),
    ('Eltern-Café & Specialty Coffee', 'Café', 'Frisch zubereitete Kaffeespezialitäten, Bio-Tees und gesunde Kindersnacks.', '/assets/artisan-cafe.jpg', 2, true),
    ('Kreatives Entdecken', 'Spielbereich', 'Liebevoll eingerichtete Spielinseln für fantasievolles und freies Spielen.', '/assets/gallery-3.jpg', 3, true),
    ('Helle Wohlfühl-Atmosphäre', 'Café', 'Offenes Raumkonzept mit uneingeschränkter Sicht auf den Spielbereich.', '/assets/hero-interior.jpg', 4, true),
    ('Geburtstags-Festtisch', 'Events', 'Festlich dekorierter Tisch mit bunten Details und Kindergeschirr.', '/assets/geburtstage.jpg', 5, true),
    ('Salzraum-Ruheoase', 'Salzraum', 'Entspannendes Mikroklima mit feinem Trockensalz und kinderfreundlichen Spielzeugen.', '/assets/salt-sanctuary.jpg', 6, true)
ON CONFLICT DO NOTHING;
