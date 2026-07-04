# Health Tracker

Private, personal health tracking app for 3 users (owner, spouse, read-only doctor). Next.js 14 App Router, NextAuth v5 Credentials auth, Vercel KV, OpenAI AI features.

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see below). Then:

```bash
npm run dev
```

App runs at http://localhost:3000.

**Note on `$` in `.env.local`:** Next.js expands `$VAR` references when loading `.env` files. Bcrypt hashes contain literal `$` characters (e.g. `$2b$10$...`), which will get mangled into empty strings unless escaped. Always escape them as `\$` in `.env.local`:

```
PASS_NITIN=\$2b\$10\$AGKv63TKl8CnwmWnhoSZceCTpjl2LDvXIqLshllnkJjVV7btkQf1W
```

This only matters for local `.env` files — env vars set directly in the Vercel dashboard/CLI are stored literally and don't need escaping.

## 2. Generate bcrypt password hashes

```bash
node -e "console.log(require('bcryptjs').hashSync('yourpassword123', 10))"
```

Run once per user (Nitin, spouse, doctor) and put the output in `PASS_NITIN` / `PASS_SPOUSE` / `PASS_DOCTOR`.

## 3. Environment variables

```
NEXTAUTH_SECRET=       # random string, e.g. `openssl rand -base64 32`
NEXTAUTH_URL=           # http://localhost:3000 locally, your production URL on Vercel

PASS_NITIN=             # bcrypt hash (escape $ as \$ in local .env files)
PASS_SPOUSE=
PASS_DOCTOR=

EMAIL_NITIN=
EMAIL_SPOUSE=
EMAIL_DOCTOR=

KV_REST_API_URL=        # from Vercel KV, or Upstash dashboard's "REST API" tab
KV_REST_API_TOKEN=      # same source — note Upstash labels these UPSTASH_REDIS_REST_URL/TOKEN, rename to the keys above

OPENAI_API_KEY=         # platform.openai.com

NEXT_PUBLIC_APP_NAME=Health Tracker
```

Doctor's account (`EMAIL_DOCTOR`) is always read-only and always views Nitin's data (`EMAIL_NITIN`'s KV namespace) — this is hardcoded in `lib/auth.ts`.

## 4. KV setup

The app talks to Redis via Upstash's REST API — `@vercel/kv` is just a thin wrapper around it (see `lib/kv.ts`). Two ways to get a working store, same result either way:

**Option A — Upstash directly (fastest for local dev, no Vercel project needed):**
1. Sign up at [upstash.com](https://upstash.com) (free tier, no card).
2. Create Database → Redis → pick a region.
3. Open the DB → **REST API** tab → copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
4. Put those values into `.env.local` as `KV_REST_API_URL` and `KV_REST_API_TOKEN` — same values, different key names.
5. Restart the dev server (Next.js only reads `.env.local` at process startup, so env var changes need a restart to take effect).

**Option B — Vercel KV (when you're already deploying to Vercel):**
1. In the Vercel dashboard, open your project → **Storage** → **Create Database** → **KV** (or install a Redis integration from the Marketplace if KV is unavailable).
2. Link the store to your project.
3. Vercel injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically for deployed environments. For local dev, copy those values from the store's `.env.local` tab into your own `.env.local`.

Both options produce a store you can also link into Vercel later — an Upstash DB created directly (Option A) can be connected to a Vercel project afterward via the Marketplace integration, no data migration needed.

## 5. Deploy to Vercel

```bash
npm i -g vercel   # if not already installed
vercel
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard for git-based deploys. Set all environment variables above in **Project Settings → Environment Variables** before the first deploy.

### Domain setup

In Vercel: **Project Settings → Domains** → add your domain → follow the DNS instructions (usually a CNAME to `cname.vercel-dns.com` or an A record to Vercel's IP). HTTPS is automatic.

Update `NEXTAUTH_URL` to your final domain (e.g. `https://health.yourdomain.com`) and redeploy.

## 6. Adding or changing users

Users are hardcoded via environment variables — there's no sign-up flow or user database.

To change a password: generate a new bcrypt hash (step 2) and update the corresponding `PASS_*` env var, then redeploy.

To add a 4th user: this requires a small code change in `lib/auth.ts` (`getUsers()`) and `lib/auth.config.ts` — add a new `EMAIL_*` / `PASS_*` pair and decide their role (`owner` or `readonly`).

## Architecture notes

- All AI calls (`/api/ai/*`) run server-side only; `OPENAI_API_KEY` is never sent to the client.
- Food photos are processed in-memory and never persisted to disk or KV — only the resulting meal entry (name/calories) is saved.
- Data is namespaced per user email in KV: `{email}:health:day:{date}` and `{email}:health:profile`.
- Doctor account always reads/writes (attempted writes are blocked with 403) Nitin's namespace, never the doctor's own.
