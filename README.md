# Haven Kids Café — Architecture & Security Blueprint

Enterprise-grade booking platform and management system for **Haven Kids Café** in Berlin.

## Architectural Separation & Security Model

The system is strictly divided into two autonomous applications to guarantee customer privacy and server-side authorization:

```text
Kids/
├── public-site/                 # Customer-Facing Web App (https://havenkidscafe.de)
│   ├── src/                     # Customer routes: /, /services, /pricing, /gallery, /faq, /contact
│   ├── public/                  # Assets, brand logo, favicon, photos (<180KB)
│   ├── package.json
│   ├── vite.config.ts           # Configured for Port 5173 (Dev) & 4173 (Preview)
│   └── .env.example
│
├── admin-dashboard/             # Staff & Admin Workspace (https://admin.havenkidscafe.de)
│   ├── src/                     # Supabase Auth, protected dashboard, bookings management
│   ├── public/                  # Favicon
│   ├── package.json
│   ├── vite.config.ts           # Configured for Port 5174 (Dev) & 4174 (Preview)
│   └── .env.example
│
├── supabase/                    # Backend Infrastructure & Security
│   ├── schema.sql               # Hardened PostgreSQL schema, staff_members table, RLS, atomic RPC
│   └── functions/               # Supabase Edge Functions (Resend email confirmation)
│
└── haven_kids_cafe_website.html # Design concept reference
```

---

## Security Invariants

1. **Zero Admin Footprint on Public Site:**
   - No "Admin Login", "Für Personal", or lock icons exist on the customer website.
   - No `/admin-login` or `/admin/dashboard` routes exist in the public bundle.
   - Zero hardcoded admin credentials or `localStorage` auth flags.

2. **Real Supabase Auth & Role-Based Authorization:**
   - Admin authentication is handled strictly via Supabase Auth (`supabase.auth.signInWithPassword`).
   - Staff membership and permissions are validated database-side via `public.staff_members` and `public.is_staff(auth.uid())`.
   - Anonymous/unauthenticated requests cannot access the admin portal.

3. **Hardened Row-Level Security (RLS):**
   - Direct SELECT, UPDATE, or DELETE on `bookings` is restricted strictly to active staff members.
   - Public customer bookings are created solely through the stored procedure `public.create_booking_atomic()` (`SECURITY DEFINER`), guaranteeing mathematical atomicity and zero race-condition overbooking.

---

## Local Development & Ports

| Application | Production Target | Local Dev Port | Local Preview Port |
|---|---|---|---|
| **Public Customer Site** | `https://havenkidscafe.de/` | `http://localhost:5173/` | `http://localhost:4173/` |
| **Admin Staff Portal** | `https://admin.havenkidscafe.de/` | `http://localhost:5174/` | `http://localhost:4174/` |

### Available Root Commands

- `npm run build` — Builds both applications.
- `npm run build:public` — Builds only the public customer website.
- `npm run build:admin` — Builds only the admin staff dashboard.
- `npm run dev:public` — Launches the customer site dev server.
- `npm run dev:admin` — Launches the admin dashboard dev server.
- `npm run preview:public` — Serves production build of customer site on `http://localhost:4173/`.
- `npm run preview:admin` — Serves production build of admin portal on `http://localhost:4174/`.
