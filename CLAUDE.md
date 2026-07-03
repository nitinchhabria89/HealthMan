# Health Tracker

Private, personal health tracker for 3 users only (owner, spouse, read-only doctor). Not a SaaS — no sign-up flow, no user database. Next.js 14 App Router + TypeScript, hosted on Vercel.

## Stack (do not substitute without asking)

- Next.js 14 App Router + TypeScript
- NextAuth.js v5 (beta) — Credentials provider only, JWT sessions
- Vercel KV (`@vercel/kv`, Redis) — all data storage, no SQL database
- OpenAI SDK — server-side only, `gpt-4o-mini` (switched from Anthropic; see note below)
- Tailwind CSS
- Recharts — charts on Reports page
- bcryptjs — password hashing

## Auth model

3 hardcoded users via env vars (`EMAIL_NITIN`/`PASS_NITIN`, `EMAIL_SPOUSE`/`PASS_SPOUSE`, `EMAIL_DOCTOR`/`PASS_DOCTOR`). Roles: `owner` (Nitin, spouse — full read/write) or `readonly` (doctor).

Doctor is a special case: always views **Nitin's** data, never their own namespace, and is blocked (403) from all writes. This resolution happens in `getDataOwnerEmail()` in `lib/auth.ts`, used by every API route via `lib/api-auth.ts`'s `requireSession()`.

**Config is split across two files** — this matters, don't merge them back together:
- `lib/auth.config.ts` — edge-safe (no bcrypt/Node APIs), used by `middleware.ts`
- `lib/auth.ts` — full config with the Credentials provider (bcrypt), used by API routes and server components

Bcrypt in `middleware.ts` breaks the edge runtime bundle (`setImmediate` not supported). If auth logic changes, keep write-provider logic out of the edge-safe config.

## Data model

KV keys, namespaced per user email:
- `{email}:health:profile` — `Profile`
- `{email}:health:day:{YYYY-MM-DD}` — `DayLog`

All types in `lib/types.ts`. KV helpers in `lib/kv.ts` (`getDay`, `setDay`, `getProfile`, `setProfile`, `listDayDates`, `getDays`).

## Known gotchas

- **`.env.local` and `$` characters**: Next.js's dotenv-expand interprets `$2b$10$...` (bcrypt hash syntax) as variable references, silently corrupting the hash into an empty string. Escape as `\$2b\$10\$...` in local `.env` files. Not an issue for env vars set directly in the Vercel dashboard/CLI — those are literal.
- The `jose`/`@auth/core` edge-runtime warnings about `CompressionStream`/`DecompressionStream` during build are harmless (unused code path in an optional feature) — not the same as the bcrypt issue above, which is a hard error if not split correctly.

## Design system — exact values, no deviations

Colors live in `tailwind.config.ts` as named tokens (`bg`, `surface`, `border`, `borderLight`, `innerBg`, `green`, `blue`, `amber`, `red`, `purple`, `text`, `textMuted`, `textDim`). Always use the token names, never hardcode hex in new components except where Recharts requires inline style props (it doesn't read Tailwind classes for SVG fill/stroke).

- Cards: `rounded-card` (18px). Buttons: `rounded-btn` (12px). Inputs: `rounded-input` (10px).
- Labels: use the `.label` utility class (11px uppercase, 0.09em tracking, `textMuted`).
- Mobile-first, `max-w-app` (560px) centered, `px-4` page padding.
- Bottom tab bar (`components/ui/TabBar.tsx`): 6 tabs — Today/Food/Health/Workout/Coach/Reports.

## File structure

```
/app
  /api/auth/[...nextauth]/route.ts    NextAuth handler
  /api/health/{day,profile,keys}      Data CRUD, doctor-write-blocked
  /api/ai/{analyze-food,symptom-advice,coach,report}   Server-only OpenAI calls
  /(auth)/login                       Public
  /(app)/{dashboard,food,health,workout,coach,reports} Protected, guarded by (app)/layout.tsx + middleware.ts
/components/{ui,dashboard,food,health,workout,coach,reports}
/lib/{types,kv,auth,auth.config,api-auth,utils}.ts
/hooks/{useDay,useProfile,useReportData}.ts
```

## Conventions

- All mutations autosave: `useDay`/`useProfile` hooks POST on every `update()` call, no explicit save flow except Workout page's confirmation button (cosmetic, spec-required).
- AI routes never take write access from readonly (doctor) sessions except `symptom-advice` and `report`, which are informational and allowed for the doctor by design.
- Meal/symptom/medicine IDs: `crypto.randomUUID()`, client-generated.
- Report aggregation (`hooks/useReportData.ts`) fetches `/api/health/keys` (for accurate "days logged" count) *and* every day in the period in parallel (for chart continuity, including gap days) — don't collapse this into one fetch, they serve different purposes.

## Environment variables

See `.env.example`. Full setup (bcrypt hash generation, Vercel KV provisioning, domain setup) documented in `README.md`.

## Build status

All 6 pages, 4 AI routes, and the health/profile/keys API are implemented and build clean (`npm run build`). Auth flow (login → protected routes → doctor 403 on writes → sign out) verified live. Actual data persistence and AI features are untested against real Vercel KV / OpenAI credentials — `.env.local` currently holds dev-only placeholder values.

## Provider note

Originally spec'd for Anthropic (`claude-sonnet-4-5`). Switched to OpenAI (`gpt-4o-mini`) because the user had OpenAI credits and $0 Anthropic balance. All 4 `/api/ai/*` routes use the `openai` SDK, `chat.completions.create` (vision via `image_url` with a base64 data URL, streaming via `stream: true` + async iteration over `chunk.choices[0].delta.content`). Swapping back or between models only touches these 4 route files — no other code depends on the provider.

**`new OpenAI(...)` must stay inside the request handler, not at module scope.** Unlike the Anthropic SDK, the OpenAI SDK throws at construction time if `apiKey` is empty/undefined. Module-scope instantiation ran during `next build`'s page-data collection (which imports route modules without a guaranteed real API key locally) and broke the build. Each route creates its client lazily inside `POST()`.
