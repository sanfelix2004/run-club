# Pubblicare su GitHub + dominio personalizzato

Sito temporaneo attivo: **https://temporary-spry-dune-93swulh.vercel.app**

## Dominio consigliato: `runclubgiovinazzo.com`

| Dominio | Pro | Contro |
|---------|-----|--------|
| **runclubgiovinazzo.com** | Facile da registrare, nessun codice fiscale, ~10–12 €/anno | Meno “italiano” visivamente |
| runclubgiovinazzo.it | Ottimo per audience italiana | Spesso richiede codice fiscale / dati IT per la registrazione |

**Consiglio:** compra **runclubgiovinazzo.com** su [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/), [Namecheap](https://www.namecheap.com) o [Google Domains (Squarespace)](https://domains.google).

---

## Passo 1 — Carica il codice su GitHub (2 min)

Repo vuota: https://github.com/sanfelix2004/run-club

Sul tuo computer (dove hai già il progetto o dopo aver clonato da Cursor):

```bash
git remote add github https://github.com/sanfelix2004/run-club.git
git push -u github main
```

Se chiede login, usa un **Personal Access Token** GitHub (Settings → Developer settings → Tokens) al posto della password.

---

## Passo 2 — Collega Vercel al repo (3 min)

1. Apri: https://vercel.com/claim-deployment?code=c8b0b9a4-bd62-4434-91a2-6532adef69ab  
   *(oppure Import da https://vercel.com/new → repo `sanfelix2004/run-club`)*
2. Accedi con GitHub e autorizza Vercel.
3. Nelle **Environment Variables** aggiungi:

| Variabile | Valore |
|-----------|--------|
| `AUTH_SECRET` | genera con `openssl rand -base64 32` |
| `AUTH_URL` | `https://runclubgiovinazzo.com` *(dopo il dominio)* |
| `AUTH_GOOGLE_ID` | il tuo client Google |
| `AUTH_GOOGLE_SECRET` | il tuo secret Google |
| `ADMIN_PIN` | PIN admin staff |
| `QR_SECRET` | stringa casuale lunga |
| `DATABASE_URL` | vedi passo 4 |

4. Clicca **Deploy**.

---

## Passo 3 — Collega il dominio (5 min)

1. Vercel → progetto → **Settings** → **Domains**
2. Aggiungi: `runclubgiovinazzo.com` e `www.runclubgiovinazzo.com`
3. Vercel mostra i record DNS da copiare nel registrar dove hai comprato il dominio:

**Esempio tipico (Cloudflare / Namecheap):**

| Tipo | Nome | Valore |
|------|------|--------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

4. Attendi 5–30 minuti (propagazione DNS).
5. In Vercel imposta `runclubgiovinazzo.com` come dominio **primary** e redirect `www` → root (o viceversa).

6. Aggiorna su Vercel la variabile:
   - `AUTH_URL` = `https://runclubgiovinazzo.com`

---

## Passo 4 — Google OAuth (dopo il dominio)

In [Google Cloud Console → Credenziali](https://console.cloud.google.com/apis/credentials):

**Origini JavaScript autorizzate:**
```
https://runclubgiovinazzo.com
https://www.runclubgiovinazzo.com
http://localhost:43123
```

**URI di reindirizzamento:**
```
https://runclubgiovinazzo.com/api/auth/callback/google
https://www.runclubgiovinazzo.com/api/auth/callback/google
http://localhost:43123/api/auth/callback/google
```

*(Usa solo l’origine che diventa primary — se redirecti sempre `www` → root, basta quella senza `www`.)*

---

## Passo 5 — Database online (obbligatorio per dati persistenti)

SQLite su Vercel **non salva** iscrizioni tra un deploy e l’altro. Per produzione:

**Opzione A — Turso (consigliata, hai già fatto login):**
1. Crea database su https://turso.tech
2. Copia `DATABASE_URL` (libsql://...)
3. In `prisma/schema.prisma` cambia `provider = "sqlite"` in `provider = "sqlite"` con adapter libsql, **oppure** passa a PostgreSQL

**Opzione B — PostgreSQL gratuito (Neon / Supabase):**
1. Crea progetto su https://neon.tech
2. `DATABASE_URL=postgresql://...`
3. In `prisma/schema.prisma`: `provider = "postgresql"`
4. `npx prisma db push` in locale, poi redeploy su Vercel

---

## URL finali

| Pagina | URL |
|--------|-----|
| Home | https://runclubgiovinazzo.com |
| Admin eventi | https://runclubgiovinazzo.com/admin/events |
| Check-in QR | https://runclubgiovinazzo.com/admin/checkin |
| Area atleta | https://runclubgiovinazzo.com/area-atleta |

---

## Cosa non posso fare io automaticamente

- **Acquistare il dominio** (serve la tua carta sul registrar)
- **Push su GitHub** (serve il tuo token GitHub)
- **Claim Vercel** (serve il tuo account Vercel collegato a GitHub)

Dopo questi 3 click (~10 min totali) il sito resta online con dominio proprio e deploy automatico ad ogni push su `main`.
