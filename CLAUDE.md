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

`Profile` includes `waterGoalLiters` (default 3) and `glassSizeMl` (default 250) — the water tracker's target glass count is *derived* (`round(waterGoalLiters * 1000 / glassSizeMl)`), never hardcoded. Default profile (`hooks/useProfile.ts`'s `DEFAULT_PROFILE`) is Nitin's actual goals: 72kg target weight, 1800kcal, 3L water — these are real values from the user, not placeholders, don't "fix" them back to generic defaults.

`Workout` is a set of yes/no activity flags: `{ walk, yoga, gym, running, tennis, badminton, pickleball }`, plus two optional numeric fields (`steps` for walk, `runningKm` for running). There is no `done`/`type`/`duration`/`intensity`/`notes`/`caloriesBurned` — that richer form existed originally but was explicitly replaced (not extended) per user request, then the activity list was expanded once more per the user's own coach-inspired ask. Anywhere that needs "was there a workout today" — `components/workout/WeekView.tsx`, `hooks/useReportData.ts`, `components/reports/WorkoutHeatmap.tsx`, the coach system prompt — must call `isWorkoutDay(workout)` from `lib/types.ts` rather than re-deriving the OR chain; adding an 8th activity later only means updating that one helper.

`MealPreset` (`{ id, name, calories, type }`) is a separate KV entity from `DayLog`, keyed `{email}:health:mealPresets` (one array per user, not per day) — `getMealPresets`/`setMealPresets` in `lib/kv.ts`, `useMealPresets` hook, `/api/health/meal-presets` route. Lets frequently-eaten meals be saved once (via `AddMealForm`'s "☆ Save" button) and re-added with a single tap from the Food page's Presets chip list, skipping the AI estimate step since calories are already known.

## Known gotchas

- **Env var changes need a dev server restart.** Next.js only reads `.env.local` at process startup — editing `KV_REST_API_URL`/`TOKEN` (or any env var) and expecting a running `next dev` to pick it up won't work. Kill and restart.
- **Upstash dashboard names ≠ our env var names.** Upstash's own UI labels credentials `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`. Our code (`lib/kv.ts`) reads `KV_REST_API_URL`/`KV_REST_API_TOKEN` (the `@vercel/kv` convention) — same values, rename the keys when copying from Upstash.

- **KV retry config**: `lib/kv.ts` builds its client via `createClient({ retry: { retries: 1, backoff: () => 200 } })` instead of importing the default `kv` singleton. The default Upstash client retries 5x with exponential backoff on *any* failed request — against an unreachable host (wrong URL, DNS failure, KV not provisioned yet) that turns a single failed call into 15-20+ seconds, and every page fetches at least one day/profile on load. Don't revert to the default `kv` export without re-adding an explicit low-retry config, or local dev against a misconfigured KV becomes painfully slow.

- **`.env.local` and `$` characters**: Next.js's dotenv-expand interprets `$2b$10$...` (bcrypt hash syntax) as variable references, silently corrupting the hash into an empty string. Escape as `\$2b\$10\$...` in local `.env` files. Not an issue for env vars set directly in the Vercel dashboard/CLI — those are literal.
- The `jose`/`@auth/core` edge-runtime warnings about `CompressionStream`/`DecompressionStream` during build are harmless (unused code path in an optional feature) — not the same as the bcrypt issue above, which is a hard error if not split correctly.

## Design system — exact values, no deviations

**Light theme, Inter font** — matches thecuriouspm.com (Nitin's personal site) by explicit request. Colors live in `tailwind.config.ts` as named tokens (`bg` #F8FAFC, `surface` white, `border` #E2E8F0, `borderLight`, `innerBg` #F1F5F9, `green` #16A34A, `blue` #0056D2 — the site's accent, `amber` #D97706, `red` #DC2626, `purple` #7C3AED, `text` #0F172A, `textMuted` #64748B, `textDim` #94A3B8). Always use the token names, never hardcode hex in new components except where Recharts requires inline style props (it doesn't read Tailwind classes for SVG fill/stroke) — if you do, match these exact values, don't reintroduce the old dark-mode hex (`#08111E`, `#4ADE80`, `#38BDF8`, etc.) by copy-paste.

- Cards: `rounded-card` (20px) + `shadow-card` (soft shadow, not a hard border, for elevation — `components/ui/Card.tsx` applies both). Buttons: `rounded-btn` (12px). Inputs: `rounded-input` (10px).
- Labels: use the `.label` utility class (11px uppercase, 0.09em tracking, `textMuted`).
- Font is Inter via `next/font/google` in `app/layout.tsx` (`--font-inter` CSS var, wired into Tailwind's `font-sans`) — not Geist, not a local font file.
- Logo: `components/ui/Logo.tsx` exports `LogoIcon` (blue rounded-square "N" mark) and `LogoFull` (icon + "NITIN CHHABRIA" wordmark, dark/blue two-tone). `LogoFull` on the login page, `LogoIcon` in every in-app `Header`. This is Nitin's personal brand mark reused intentionally — don't swap for a generic health/fitness icon.
- Mobile-first, `max-w-app` (560px) centered, `px-4` page padding.
- Multi-field rows (name + amount + button, etc.) need explicit `w-*`/`shrink-0`/`min-w-0` — plain `flex-1` siblings will overflow off-screen at 375px width once you add a 3rd element to a row. Bit us twice (`AddMealForm`, `MedicineLogger`) before landing on this rule.
- Bottom tab bar (`components/ui/TabBar.tsx`): 6 tabs — Today/Food/Health/Workout/Coach/Reports, deliberately fixed. Sub-pages that don't warrant a 7th tab (e.g. `/weight`) are reached via a link from whichever Dashboard card they detail, and use `Header`'s `backHref` prop to render a "← Back" link instead of adding nav real estate.

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
- `/api/ai/analyze-food` accepts *either* `{ image, mimeType }` (photo) *or* `{ description }` (text-only, e.g. "2 boiled eggs and a banana") — the description path skips the vision call and asks the model to estimate calories from the text directly. `AddMealForm`'s "Estimate" button uses the text path; `PhotoUpload` uses the image path. Same route, same response shape (`{ analysis, estimatedCalories }`).
- Report aggregation (`hooks/useReportData.ts`) fetches `/api/health/keys` (for accurate "days logged" count) *and* every day in the period in parallel (for chart continuity, including gap days) — don't collapse this into one fetch, they serve different purposes.

## Environment variables

See `.env.example`. Full setup (bcrypt hash generation, Vercel KV provisioning, domain setup) documented in `README.md`.

## Build status

All 6 pages, 4 AI routes, and the health/profile/keys API are implemented and build clean (`npm run build`). Auth flow (login → protected routes → doctor 403 on writes → sign out), real data persistence (Upstash Redis), and AI features (OpenAI) have all been verified live end-to-end via the preview browser tooling, not just build/type checks.

## Provider note

Originally spec'd for Anthropic (`claude-sonnet-4-5`). Switched to OpenAI (`gpt-4o-mini`) because the user had OpenAI credits and $0 Anthropic balance. All 4 `/api/ai/*` routes use the `openai` SDK, `chat.completions.create` (vision via `image_url` with a base64 data URL, streaming via `stream: true` + async iteration over `chunk.choices[0].delta.content`). Swapping back or between models only touches these 4 route files — no other code depends on the provider.

**`new OpenAI(...)` must stay inside the request handler, not at module scope.** Unlike the Anthropic SDK, the OpenAI SDK throws at construction time if `apiKey` is empty/undefined. Module-scope instantiation ran during `next build`'s page-data collection (which imports route modules without a guaranteed real API key locally) and broke the build. Each route creates its client lazily inside `POST()`.
