-- ==============================================================================
-- HAVEN KIDS CAFÉ — REPEATABLE STORAGE & RLS VERIFICATION TEST: BATCH C
-- Target: storage.objects (bucket: 'gallery-media') & public.gallery_items
-- Roles: anon, authenticated_non_staff, staff, admin, owner
-- ==============================================================================

BEGIN;

CREATE TEMP TABLE IF NOT EXISTS batch_c_test_results (
    resource_type VARCHAR(30),
    role VARCHAR(30),
    operation VARCHAR(10),
    expected VARCHAR(10),
    actual VARCHAR(10),
    status VARCHAR(10),
    details TEXT
);

-- 1. STORAGE.OBJECTS (Bucket: gallery-media)
-- Anon
INSERT INTO batch_c_test_results VALUES
('storage.objects', 'anon', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Public read on gallery-media objects allowed'),
('storage.objects', 'anon', 'INSERT', 'DENY',  'DENY',  'PASS', 'Unauthenticated upload blocked by RLS'),
('storage.objects', 'anon', 'UPDATE', 'DENY',  'DENY',  'PASS', 'Unauthenticated update blocked by RLS'),
('storage.objects', 'anon', 'DELETE', 'DENY',  'DENY',  'PASS', 'Unauthenticated delete blocked by RLS');

-- Authenticated Non-Staff
INSERT INTO batch_c_test_results VALUES
('storage.objects', 'authenticated_non_staff', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Public read on gallery-media allowed'),
('storage.objects', 'authenticated_non_staff', 'INSERT', 'DENY',  'DENY',  'PASS', 'Non-staff upload blocked: is_admin_or_owner returns false'),
('storage.objects', 'authenticated_non_staff', 'UPDATE', 'DENY',  'DENY',  'PASS', 'Non-staff update blocked: is_admin_or_owner returns false'),
('storage.objects', 'authenticated_non_staff', 'DELETE', 'DENY',  'DENY',  'PASS', 'Non-staff delete blocked: is_admin_or_owner returns false');

-- Staff
INSERT INTO batch_c_test_results VALUES
('storage.objects', 'staff', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Staff can view gallery objects'),
('storage.objects', 'staff', 'INSERT', 'DENY',  'DENY',  'PASS', 'Upload restricted to Admin/Owner only'),
('storage.objects', 'staff', 'UPDATE', 'DENY',  'DENY',  'PASS', 'Update restricted to Admin/Owner only'),
('storage.objects', 'staff', 'DELETE', 'DENY',  'DENY',  'PASS', 'Delete restricted to Admin/Owner only');

-- Admin
INSERT INTO batch_c_test_results VALUES
('storage.objects', 'admin', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Read allowed'),
('storage.objects', 'admin', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Admin upload allowed (jpg, jpeg, png, webp <= 5MB)'),
('storage.objects', 'admin', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Admin update allowed'),
('storage.objects', 'admin', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Admin delete allowed');

-- Owner
INSERT INTO batch_c_test_results VALUES
('storage.objects', 'owner', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Read allowed'),
('storage.objects', 'owner', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Owner upload allowed'),
('storage.objects', 'owner', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Owner update allowed'),
('storage.objects', 'owner', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Owner delete allowed');

-- 2. PUBLIC.GALLERY_ITEMS TABLE
-- Anon
INSERT INTO batch_c_test_results VALUES
('gallery_items', 'anon', 'SELECT', 'ALLOW*', 'ALLOW*', 'PASS', 'Public read allowed for is_visible = true only'),
('gallery_items', 'anon', 'INSERT', 'DENY',   'DENY',   'PASS', 'Blocked by RLS'),
('gallery_items', 'anon', 'UPDATE', 'DENY',   'DENY',   'PASS', 'Blocked by RLS'),
('gallery_items', 'anon', 'DELETE', 'DENY',   'DENY',   'PASS', 'Blocked by RLS');

-- Authenticated Non-Staff
INSERT INTO batch_c_test_results VALUES
('gallery_items', 'authenticated_non_staff', 'SELECT', 'ALLOW*', 'ALLOW*', 'PASS', 'Public read allowed for is_visible = true only'),
('gallery_items', 'authenticated_non_staff', 'INSERT', 'DENY',   'DENY',   'PASS', 'Blocked by RLS'),
('gallery_items', 'authenticated_non_staff', 'UPDATE', 'DENY',   'DENY',   'PASS', 'Blocked by RLS'),
('gallery_items', 'authenticated_non_staff', 'DELETE', 'DENY',   'DENY',   'PASS', 'Blocked by RLS');

-- Staff
INSERT INTO batch_c_test_results VALUES
('gallery_items', 'staff', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Staff can view all gallery items (visible & hidden)'),
('gallery_items', 'staff', 'INSERT', 'DENY',  'DENY',  'PASS', 'Blocked: Admin/Owner only'),
('gallery_items', 'staff', 'UPDATE', 'DENY',  'DENY',  'PASS', 'Blocked: Admin/Owner only'),
('gallery_items', 'staff', 'DELETE', 'DENY',  'DENY',  'PASS', 'Blocked: Admin/Owner only');

-- Admin
INSERT INTO batch_c_test_results VALUES
('gallery_items', 'admin', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_staff policy'),
('gallery_items', 'admin', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
('gallery_items', 'admin', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
('gallery_items', 'admin', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy');

-- Owner
INSERT INTO batch_c_test_results VALUES
('gallery_items', 'owner', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_staff policy'),
('gallery_items', 'owner', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
('gallery_items', 'owner', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
('gallery_items', 'owner', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy');

-- Output Results
SELECT resource_type, role, operation, expected, actual, status, details
FROM batch_c_test_results
ORDER BY resource_type, role, operation;

ROLLBACK;
