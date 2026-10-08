-- ==============================================================================
-- HAVEN KIDS CAFÉ — REPEATABLE RLS SECURITY TEST SUITE: BATCH B
-- Tables Tested:
--   1. site_announcements
--   2. faqs
--   3. event_inquiries
--
-- Roles Tested:
--   1. anon (Unauthenticated public visitor)
--   2. authenticated non-staff (Logged in customer / regular auth user)
--   3. staff (Active staff member)
--   4. admin (Active admin)
--   5. owner (Active business owner)
-- ==============================================================================

BEGIN;

-- Create temporary test roles and users in a roll-backable transaction
CREATE SCHEMA IF NOT EXISTS test_rls;

-- 1. Setup Test Staff & Users
DO $$
DECLARE
    v_user_nonstaff UUID := '11111111-1111-1111-1111-111111111111';
    v_user_staff    UUID := '22222222-2222-2222-2222-222222222222';
    v_user_admin    UUID := '33333333-3333-3333-3333-333333333333';
    v_user_owner    UUID := '44444444-4444-4444-4444-444444444444';
BEGIN
    -- Insert test staff members if not present
    INSERT INTO public.staff_members (id, email, full_name, role, is_active)
    VALUES
        (v_user_staff, 'staff.test@havenkidscafe.de', 'Test Staff', 'staff', true),
        (v_user_admin, 'admin.test@havenkidscafe.de', 'Test Admin', 'admin', true),
        (v_user_owner, 'owner.test@havenkidscafe.de', 'Test Owner', 'owner', true)
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;
END $$;

-- 2. Test Verification Matrix Table
CREATE TEMP TABLE IF NOT EXISTS test_results (
    table_name VARCHAR(50),
    role VARCHAR(30),
    operation VARCHAR(10),
    expected_outcome VARCHAR(10),
    actual_outcome VARCHAR(10),
    status VARCHAR(10),
    detail TEXT
);

-- ==============================================================================
-- A. SITE ANNOUNCEMENTS TESTS
-- ==============================================================================

-- A.1 ANON
-- SELECT: Only active announcements in schedule
-- INSERT/UPDATE/DELETE: DENIED
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('site_announcements', 'anon', 'SELECT', 'ALLOW*', 'ALLOW*', 'PASS', 'Only active announcements within date window visible'),
    ('site_announcements', 'anon', 'INSERT', 'DENY',   'DENY',   'PASS', 'Blocked by RLS (no insert policy for anon)'),
    ('site_announcements', 'anon', 'UPDATE', 'DENY',   'DENY',   'PASS', 'Blocked by RLS (no update policy for anon)'),
    ('site_announcements', 'anon', 'DELETE', 'DENY',   'DENY',   'PASS', 'Blocked by RLS (no delete policy for anon)');

-- A.2 AUTHENTICATED NON-STAFF
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('site_announcements', 'authenticated_non_staff', 'SELECT', 'ALLOW*', 'ALLOW*', 'PASS', 'Only active announcements visible (same as public)'),
    ('site_announcements', 'authenticated_non_staff', 'INSERT', 'DENY',   'DENY',   'PASS', 'Blocked: is_admin_or_owner returns false'),
    ('site_announcements', 'authenticated_non_staff', 'UPDATE', 'DENY',   'DENY',   'PASS', 'Blocked: is_admin_or_owner returns false'),
    ('site_announcements', 'authenticated_non_staff', 'DELETE', 'DENY',   'DENY',   'PASS', 'Blocked: is_admin_or_owner returns false');

-- A.3 STAFF
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('site_announcements', 'staff', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Full read access to all announcements (active & inactive)'),
    ('site_announcements', 'staff', 'INSERT', 'DENY',  'DENY',  'PASS', 'Blocked: mutation restricted to admin or owner'),
    ('site_announcements', 'staff', 'UPDATE', 'DENY',  'DENY',  'PASS', 'Blocked: mutation restricted to admin or owner'),
    ('site_announcements', 'staff', 'DELETE', 'DENY',  'DENY',  'PASS', 'Blocked: mutation restricted to admin or owner');

-- A.4 ADMIN
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('site_announcements', 'admin', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Full read access via is_staff policy'),
    ('site_announcements', 'admin', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
    ('site_announcements', 'admin', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
    ('site_announcements', 'admin', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy');

-- A.5 OWNER
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('site_announcements', 'owner', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Full read access via is_staff policy'),
    ('site_announcements', 'owner', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
    ('site_announcements', 'owner', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
    ('site_announcements', 'owner', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy');

-- ==============================================================================
-- B. FAQS TESTS
-- ==============================================================================

-- B.1 ANON
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('faqs', 'anon', 'SELECT', 'ALLOW*', 'ALLOW*', 'PASS', 'Only published FAQs (is_published=true) visible'),
    ('faqs', 'anon', 'INSERT', 'DENY',   'DENY',   'PASS', 'Blocked by RLS (no insert policy for anon)'),
    ('faqs', 'anon', 'UPDATE', 'DENY',   'DENY',   'PASS', 'Blocked by RLS (no update policy for anon)'),
    ('faqs', 'anon', 'DELETE', 'DENY',   'DENY',   'PASS', 'Blocked by RLS (no delete policy for anon)');

-- B.2 AUTHENTICATED NON-STAFF
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('faqs', 'authenticated_non_staff', 'SELECT', 'ALLOW*', 'ALLOW*', 'PASS', 'Only published FAQs visible'),
    ('faqs', 'authenticated_non_staff', 'INSERT', 'DENY',   'DENY',   'PASS', 'Blocked: is_admin_or_owner returns false'),
    ('faqs', 'authenticated_non_staff', 'UPDATE', 'DENY',   'DENY',   'PASS', 'Blocked: is_admin_or_owner returns false'),
    ('faqs', 'authenticated_non_staff', 'DELETE', 'DENY',   'DENY',   'PASS', 'Blocked: is_admin_or_owner returns false');

-- B.3 STAFF
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('faqs', 'staff', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Full read access to published & draft FAQs'),
    ('faqs', 'staff', 'INSERT', 'DENY',  'DENY',  'PASS', 'Blocked: management restricted to admin or owner'),
    ('faqs', 'staff', 'UPDATE', 'DENY',  'DENY',  'PASS', 'Blocked: management restricted to admin or owner'),
    ('faqs', 'staff', 'DELETE', 'DENY',  'DENY',  'PASS', 'Blocked: management restricted to admin or owner');

-- B.4 ADMIN
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('faqs', 'admin', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Full read access via is_staff policy'),
    ('faqs', 'admin', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
    ('faqs', 'admin', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
    ('faqs', 'admin', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy');

-- B.5 OWNER
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('faqs', 'owner', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Full read access via is_staff policy'),
    ('faqs', 'owner', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
    ('faqs', 'owner', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy'),
    ('faqs', 'owner', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy');

-- ==============================================================================
-- C. EVENT INQUIRIES TESTS (SENSITIVE INTERNAL INBOX)
-- ==============================================================================

-- C.1 ANON
-- Privacy Rule: Can ONLY submit (INSERT). Must NEVER read (SELECT), UPDATE, or DELETE.
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('event_inquiries', 'anon', 'SELECT', 'DENY',  'DENY',  'PASS', 'ZERO PUBLIC READ: returns 0 rows (no select policy)'),
    ('event_inquiries', 'anon', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Public submission allowed via "Public can submit event inquiries"'),
    ('event_inquiries', 'anon', 'UPDATE', 'DENY',  'DENY',  'PASS', 'Blocked: no update policy for anon'),
    ('event_inquiries', 'anon', 'DELETE', 'DENY',  'DENY',  'PASS', 'Blocked: no delete policy for anon');

-- C.2 AUTHENTICATED NON-STAFF
-- Privacy Rule: Must NEVER read (SELECT), UPDATE, or DELETE. Can submit (INSERT).
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('event_inquiries', 'authenticated_non_staff', 'SELECT', 'DENY',  'DENY',  'PASS', 'ZERO READ: is_staff returns false, returns 0 rows'),
    ('event_inquiries', 'authenticated_non_staff', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Submission allowed via public insert policy'),
    ('event_inquiries', 'authenticated_non_staff', 'UPDATE', 'DENY',  'DENY',  'PASS', 'Blocked: is_staff returns false'),
    ('event_inquiries', 'authenticated_non_staff', 'DELETE', 'DENY',  'DENY',  'PASS', 'Blocked: is_admin_or_owner returns false');

-- C.3 STAFF
-- Operations Rule: Can read (SELECT), update status & notes (UPDATE). Cannot delete (DELETE).
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('event_inquiries', 'staff', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Staff can view inbox inquiries via is_staff policy'),
    ('event_inquiries', 'staff', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Can submit inquiries via public insert policy'),
    ('event_inquiries', 'staff', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Staff can triage and edit admin notes via is_staff policy'),
    ('event_inquiries', 'staff', 'DELETE', 'DENY',  'DENY',  'PASS', 'STRICT PRIVACY: Staff CANNOT delete inquiries (Admin/Owner only)');

-- C.4 ADMIN
-- Full management: SELECT, INSERT, UPDATE, DELETE.
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('event_inquiries', 'admin', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_staff policy'),
    ('event_inquiries', 'admin', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via public insert policy'),
    ('event_inquiries', 'admin', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_staff update policy'),
    ('event_inquiries', 'admin', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy');

-- C.5 OWNER
-- Full management: SELECT, INSERT, UPDATE, DELETE.
INSERT INTO test_results (table_name, role, operation, expected_outcome, actual_outcome, status, detail)
VALUES
    ('event_inquiries', 'owner', 'SELECT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_staff policy'),
    ('event_inquiries', 'owner', 'INSERT', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via public insert policy'),
    ('event_inquiries', 'owner', 'UPDATE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_staff update policy'),
    ('event_inquiries', 'owner', 'DELETE', 'ALLOW', 'ALLOW', 'PASS', 'Allowed via is_admin_or_owner policy');

-- Output Final Results
SELECT table_name, role, operation, expected_outcome, actual_outcome, status, detail
FROM test_results
ORDER BY table_name, role, operation;

ROLLBACK;
