# run club giovinazzo

A production-ready single-page website for **run club giovinazzo** — a friendly running community on the Adriatic coast in Giovinazzo, Puglia.

Includes a full **registration & ticketing system** for weekly meetups with PDF pass generation, QR codes, and an admin check-in scanner.

## Features

### Website
- Immersive parallax hero with interactive particle canvas
- Fixed navigation with responsive hamburger mobile menu
- Scroll-triggered fade-in animations
- Card-based session grid, pricing table, testimonial carousel
- Animated statistics counter and Google Maps embed

### Registration & Ticketing
- Runner registration form with Zod validation
- SQLite database (Prisma) — swap to PostgreSQL for production
- Encrypted QR token generation per ticket
- On-screen ticket preview with QR code
- Professional PDF bib/ticket download (`/api/ticket/[token]`)
- €5 on-site payment flow (PENDING_PAYMENT → PAID_AND_CHECKED_IN)

### Area Atleta (`/area-atleta`)
- Login with email/password or Google
- View profile data and event history
- Stats: bookings, attended events, upcoming reservations

### Authentication
- **Accedi / Registrati** buttons always visible in the navbar
- Welcome popup on first visit for new users (dismissible)
- Email + password registration
- Google OAuth (configure env vars)
- Session-linked event bookings

- PIN-protected staff access (default: `runclub2026`)
- Live camera QR scanner (html5-qrcode)
- Runner lookup with payment status
- One-tap "Conferma Presenza e Incassa 5,00€"
- Live tally: registered, checked-in, total collected (€)

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, Server Actions)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/) 5 + SQLite (local) / PostgreSQL (production)
- [Zod](https://zod.dev/) validation
- [jsPDF](https://github.com/parallax/jsPDF) + [qrcode](https://github.com/soldair/node-qrcode) for PDF tickets
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) for admin scanner
- [Framer Motion](https://www.framer.com/motion/) + [Sonner](https://sonner.emilkowal.ski/) toasts

## Getting Started

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:43123](http://localhost:43123) for the site.

- **Registration:** scroll to the Booking section or visit `#booking`
- **Admin check-in:** [http://localhost:43123/admin/checkin](http://localhost:43123/admin/checkin)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Prisma connection string | `file:./dev.db` |
| `ADMIN_PIN` | Staff check-in PIN | `runclub2026` |
| `QR_SECRET` | HMAC secret for QR tokens | built-in dev key |
| `AUTH_SECRET` | Auth.js session secret | required |
| `AUTH_URL` | App URL for OAuth callbacks | `http://localhost:43123` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | optional |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | optional |

### Google OAuth (local)

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (type: Web application).
3. **Authorized JavaScript origins:** `http://localhost:43123`
4. **Authorized redirect URIs:** `http://localhost:43123/api/auth/callback/google`  
   (must match exactly — not `/api/` alone)
5. Copy Client ID and Client Secret into `.env` as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
6. If the app is in **Testing** mode, add your Gmail under OAuth consent screen → **Test users**.
7. Restart the dev server after changing `.env`.

For production, repeat steps 3–4 with your live domain (e.g. `https://tuodominio.it` and `https://tuodominio.it/api/auth/callback/google`) and set `AUTH_URL` to that domain on your host.

For PostgreSQL / Supabase production:

```
DATABASE_URL="postgresql://user:password@host:5432/runclub?schema=public"
```

Update `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`.

## Database Schema

- **users** — account (email/password or OAuth)
- **events** — title, date_time, location_name, price_amount (5.00), currency
- **registrations** — runner details, qr_token, status, optional user_id link

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── actions/       # Server actions (registration, check-in)
│   ├── api/ticket/    # PDF download endpoint
│   └── admin/checkin/ # Staff QR scanner page
├── components/        # UI sections + TicketPreview, AdminCheckIn
└── lib/               # DB, PDF, QR, validations
prisma/
├── schema.prisma
└── seed.ts
```
