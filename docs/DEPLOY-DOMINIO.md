# Deploy gratuito da GitHub

## URL gratuito (senza comprare dominio)

Collegando la repo a Vercel ottieni un dominio **gratis per sempre**:

```
https://run-club-olive.vercel.app
```

(o simile, in base al nome progetto su Vercel)

Un dominio tipo `runclubgiovinazzo.com` **non è gratis** — costa ~10 €/anno. Per un run club va benissimo l’URL `.vercel.app`.

---

## Setup rapido (5 minuti)

### 1. Push del codice su GitHub

Repo: https://github.com/sanfelix2004/run-club

Il codice viene pushato automaticamente dall’agent quando hai configurato il token `GITHUB_TOKEN` nell’environment.

### 2. Crea progetto Vercel collegato a GitHub

1. Vai su https://vercel.com/new
2. **Import** → seleziona `sanfelix2004/run-club`
3. Nome progetto: `run-club-giovinazzo` → URL gratis: `run-club-giovinazzo.vercel.app`
4. Aggiungi le **Environment Variables**:

| Variabile | Valore |
|-----------|--------|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://run-club-olive.vercel.app` |
| `AUTH_GOOGLE_ID` | da Google Cloud |
| `AUTH_GOOGLE_SECRET` | da Google Cloud |
| `ADMIN_PIN` | PIN staff |
| `QR_SECRET` | stringa casuale |

5. Clicca **Deploy**

Da questo momento ogni `git push` su `main` ridistribuisce il sito automaticamente.

### 3. (Opzionale) Deploy via GitHub Actions

Se preferisci che sia GitHub Actions a fare il deploy (non il webhook Vercel), aggiungi questi **secrets** nella repo GitHub → Settings → Secrets:

| Secret | Dove trovarlo |
|--------|----------------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel → progetto → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel → progetto → Settings → General |

Il workflow `.github/workflows/deploy.yml` parte ad ogni push su `main`.

---

## Google OAuth (URL gratuito Vercel)

In [Google Cloud Console → Credenziali](https://console.cloud.google.com/apis/credentials):

**Origini JavaScript autorizzate:**
```
https://run-club-olive.vercel.app
http://localhost:43123
```

**URI di reindirizzamento:**
```
https://run-club-olive.vercel.app/api/auth/callback/google
http://localhost:43123/api/auth/callback/google
```

Aggiorna su Vercel: `AUTH_URL=https://run-club-olive.vercel.app`

---

## Database online

SQLite su Vercel non persiste i dati. Per produzione usa **Turso** (gratis) o **Neon** (gratis):

1. Crea database su https://turso.tech o https://neon.tech
2. Aggiungi `DATABASE_URL` nelle env di Vercel
3. Se usi PostgreSQL, in `prisma/schema.prisma` cambia `provider` in `postgresql` e fai `npx prisma db push`

---

## Pagine del sito

| Pagina | URL |
|--------|-----|
| Home | https://run-club-olive.vercel.app |
| Admin eventi | https://run-club-olive.vercel.app/admin/events |
| Check-in QR | https://run-club-olive.vercel.app/admin/checkin |
| Area atleta | https://run-club-olive.vercel.app/area-atleta |
