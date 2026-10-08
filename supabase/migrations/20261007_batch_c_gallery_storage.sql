-- ==============================================================================
-- HAVEN KIDS CAFÉ — MIGRATION: BATCH C (GALLERY & STORAGE OPERATIONS)
-- Migration Date: 2026-10-07
-- Storage Bucket: gallery-media
-- Table: public.gallery_items (adds storage_path & verified RLS)
-- ==============================================================================

-- 1. Add storage_path column to public.gallery_items if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'gallery_items'
          AND column_name = 'storage_path'
    ) THEN
        ALTER TABLE public.gallery_items ADD COLUMN storage_path VARCHAR(255);
    END IF;
END $$;

-- 2. Create Storage Bucket: gallery-media
-- Public bucket for CDN asset delivery on public /gallery route
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery-media',
    'gallery-media',
    true,
    5242880, -- 5 MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- 3. Storage Policies on storage.objects for gallery-media

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public can view gallery media objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can upload gallery media" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can update gallery media" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can delete gallery media" ON storage.objects;

-- Policy A: Public Read (Anon and authenticated visitors can view gallery images)
CREATE POLICY "Public can view gallery media objects"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery-media');

-- Policy B: Upload / Insert (Admins and Owners only, restricted to safe image MIME types)
CREATE POLICY "Admins and owners can upload gallery media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'gallery-media'
        AND public.is_admin_or_owner(auth.uid())
        -- Restrict MIME types
        AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp'))
    );

-- Policy C: Update (Admins and Owners only)
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

-- Policy D: Delete (Admins and Owners only)
CREATE POLICY "Admins and owners can delete gallery media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'gallery-media'
        AND public.is_admin_or_owner(auth.uid())
    );

-- 4. Initial Seed for Gallery Items
INSERT INTO public.gallery_items (title, category, description, image_url, display_order, is_visible)
VALUES
    ('Pädagogischer Spielbereich', 'Spielbereich', 'Hochwertiges Holzspielzeug, sichere Klettermodule und Motorikstationen.', '/assets/spielbereich.jpg', 1, true),
    ('Eltern-Café & Specialty Coffee', 'Café', 'Frisch zubereitete Kaffeespezialitäten, Bio-Tees und gesunde Kindersnacks.', '/assets/artisan-cafe.jpg', 2, true),
    ('Kreatives Entdecken', 'Spielbereich', 'Liebevoll eingerichtete Spielinseln für fantasievolles und freies Spielen.', '/assets/gallery-3.jpg', 3, true),
    ('Helle Wohlfühl-Atmosphäre', 'Café', 'Offenes Raumkonzept mit uneingeschränkter Sicht auf den Spielbereich.', '/assets/hero-interior.jpg', 4, true),
    ('Geburtstags-Festtisch', 'Events', 'Festlich dekorierter Tisch mit bunten Details und Kindergeschirr.', '/assets/geburtstage.jpg', 5, true),
    ('Salzraum-Ruheoase', 'Salzraum', 'Entspannendes Mikroklima mit feinem Trockensalz und kinderfreundlichen Spielzeugen.', '/assets/salt-sanctuary.jpg', 6, true)
ON CONFLICT DO NOTHING;
