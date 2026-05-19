# AuraBeat Project Handoff

Use this file as the first thing to read in a fresh Codex/Claude chat.

## Fresh Chat Prompt

I am working on the AuraBeat project in `/Users/talha/aurabeat`. Read `PROJECT_HANDOFF.md` first, inspect the current dirty worktree without reverting anything, then continue from the "Remaining Work" section. The app is a Next.js 14 App Router project using Supabase, Tailwind CSS, Zustand, Selenium, and a Gradio/MusicGen backend. Recent work implemented public track update support, Selenium CRUD coverage, responsive polish, screenshot automation, strict admin checks, an admin seed script, and centralized storage cleanup for track deletes. Be careful with `.env.local` and `.admin.local.json`; do not print secrets.

## Current Context

- Current date: 18 May 2026.
- Root: `/Users/talha/aurabeat`.
- Immediate goal: viva/project presentation readiness.
- Reports already exist as Markdown:
  - `WebA03.md`
  - `WebA04.md`
- Report and verification artifacts are under:
  - `artifacts/report/`
  - `artifacts/report/screenshots/`
- The repo is intentionally dirty. Do not revert existing changes unless explicitly asked.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, Storage
- Zustand
- Selenium WebDriver + ChromeDriver
- Gradio/MusicGen backend

## Environment

`.env.local` exists. Do not expose values.

Expected keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLE`
- `GRADIO_SERVER_URL`
- `REPLICATE_API_TOKEN` exists but is not the main generation path right now

Local admin credentials:

- `.admin.local.json` exists and is gitignored.
- It contains generated demo admin credentials.
- It has owner-only permissions.
- Do not print its password in chat or reports.

## Package Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test:selenium
```

Common local run:

```bash
npm run dev -- -p 3001
SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

Optional live AI generation test:

```bash
SELENIUM_RUN_GENERATE=1 SELENIUM_GENERATE_TIMEOUT_MS=240000 SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

## Current Dirty Worktree

Latest known `git status --short`:

```text
 M .gitignore
 D API_KEY.md
 M WebA03.md
 M WebA04.md
 M src/app/admin/page.tsx
 M src/app/api-platform/ApiPlatformClient.tsx
 M src/app/api/admin/tracks/route.ts
 M src/app/api/admin/users/route.ts
 M src/app/api/generate/route.ts
 M src/app/api/v1/generate/route.ts
 M src/app/api/v1/tracks/[id]/route.ts
 M src/app/create/page.tsx
 M src/app/editor/EditorClient.tsx
 M src/app/layout.tsx
 M src/app/library/LibraryClient.tsx
 M src/app/v1/tracks/[id]/route.ts
 M src/components/layout/AppLayout.tsx
 M src/components/layout/AudioPlayer.tsx
 M src/components/layout/Sidebar.tsx
 M tests/selenium/aurabeatCrud.spec.js
?? PROJECT_HANDOFF.md
?? artifacts/
?? scripts/
?? src/app/api/tracks/
?? src/lib/audio/storageCleanup.ts
?? src/lib/auth/admin.ts
?? supabase/
```

Untracked but intentionally ignored:

```text
.admin.local.json
```

## Important Files

App routes:

- `src/app/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/create/page.tsx`
- `src/app/speech/page.tsx`
- `src/app/library/page.tsx`
- `src/app/library/LibraryClient.tsx`
- `src/app/editor/page.tsx`
- `src/app/editor/EditorClient.tsx`
- `src/app/profile/page.tsx`
- `src/app/profile/ProfileClient.tsx`
- `src/app/api-platform/page.tsx`
- `src/app/api-platform/ApiPlatformClient.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/AdminClient.tsx`

Layout:

- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/AudioPlayer.tsx`

API:

- `src/app/api/generate/route.ts`
- `src/app/api/keys/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/tracks/route.ts`
- `src/app/api/tracks/[id]/route.ts`
- `src/app/api/v1/tracks/route.ts`
- `src/app/api/v1/tracks/[id]/route.ts`
- `src/app/api/v1/generate/route.ts`
- `src/app/v1/tracks/route.ts`
- `src/app/v1/tracks/[id]/route.ts`
- `src/app/v1/generate/route.ts`

Shared:

- `src/lib/auth/apiKey.ts`
- `src/lib/auth/admin.ts`
- `src/lib/audio/storageCleanup.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/ai/prompt-engineer.ts`
- `src/lib/store/audioStore.ts`
- `src/lib/store/toastStore.ts`
- `src/lib/audio/download.ts`

Scripts and tests:

- `tests/selenium/aurabeatCrud.spec.js`
- `scripts/capture-report-screenshots.js`
- `scripts/ensure-admin.js`
- `supabase/migrations/20260518_admin_access.sql`

## What Has Been Done

### Reports

`WebA03.md`:

- Assignment 03 report drafted.
- Updated to say track update is implemented through `PATCH /v1/tracks/[id]`.
- Updated to reference captured verification artifacts.

`WebA04.md`:

- Assignment 04 report drafted.
- Updated to say library CRUD includes Create, Read, Update, Delete.
- Updated to say `PATCH /v1/tracks/[id]` is implemented and tested.
- Updated with screenshot artifact paths.

### Public Track CRUD

`src/app/api/v1/tracks/[id]/route.ts`:

- Added `PATCH` handler.
- Allows API-key owner to update:
  - `title`
  - `prompt`
  - `style_tags`
  - `status`
- Sanitizes/truncates values.
- Returns `400` for invalid or empty updates.
- Returns updated track metadata.
- `DELETE` now attempts Supabase Storage cleanup when the URL belongs to the public `tracks` bucket.

### Centralized Track Delete Storage Cleanup

Added:

- `src/lib/audio/storageCleanup.ts`
- `src/app/api/tracks/[id]/route.ts`

Modified:

- `src/app/api/v1/tracks/[id]/route.ts`
- `src/app/api/admin/tracks/route.ts`
- `src/app/library/LibraryClient.tsx`
- `tests/selenium/aurabeatCrud.spec.js`

Behavior:

- Library delete now calls authenticated server route `DELETE /api/tracks/[id]` instead of deleting rows directly from the browser Supabase client.
- Admin track delete fetches the track audio URL, deletes the DB row through the service-role client after admin authorization, then attempts storage cleanup.
- Public API, Library, and Admin delete paths all share `removeStoredTrackAudio`.
- Cleanup recognizes Supabase Storage object URLs for public, signed, and authenticated `tracks` bucket paths.
- Selenium now creates a second track fixture and verifies `DELETE /api/tracks/[id]` removes it.

`src/app/v1/tracks/[id]/route.ts`:

```ts
export { GET, PATCH, DELETE } from "@/app/api/v1/tracks/[id]/route";
```

### Library Edit UI

`src/app/library/LibraryClient.tsx`:

- Added edit buttons in grid cards and list rows.
- Added edit modal for title and comma-separated tags.
- Saves changes with authenticated Supabase browser client.
- Updates local list after save.
- Adds toast feedback.

### Selenium CRUD Coverage

`tests/selenium/aurabeatCrud.spec.js` now covers:

1. Resolve local base URL.
2. Generate temporary silent WAV.
3. Register test user.
4. Extract Supabase session from auth cookies.
5. Verify a normal non-admin user gets `403` from `/api/admin/users`.
6. Update test profile credits directly through Supabase service-role REST for fixture setup.
7. Insert track fixture through authenticated Supabase REST.
8. Upload reference audio through `/create`.
9. Open `/library`, switch to list view, find and play track.
10. Create a second track fixture and verify authenticated `DELETE /api/tracks/[id]`.
11. Open `/editor` and verify controls.
12. Create API key through `/api/keys`.
13. Verify `GET /v1/tracks`.
14. Verify `GET /v1/tracks/[id]`.
15. Verify `PATCH /v1/tracks/[id]`.
16. Optionally verify `/v1/generate` when `SELENIUM_RUN_GENERATE=1`.
17. Verify `DELETE /v1/tracks/[id]`.
18. Verify deleted track returns `404`.
19. Cleanup temp file/user/fixtures.

Latest passing output is saved at:

```text
artifacts/report/selenium-output.txt
artifacts/report/selenium-output-live-generate.txt
artifacts/report/screenshots/17-verification-output.png
```

### Responsive and Screenshot Work

Responsive work touched:

- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/AudioPlayer.tsx`
- `src/app/create/page.tsx`
- `src/app/editor/EditorClient.tsx`
- `src/app/library/LibraryClient.tsx`

Highlights:

- Added mobile bottom nav.
- Mobile nav now fits all primary tabs at 390 px.
- App shell renders mobile nav below main content.
- Bottom audio player stacks on small screens.
- Create page stacks input/results below `xl`.
- Create advanced grid uses `grid-cols-1 sm:grid-cols-2`.
- Editor header/toolbar wrap; waveform area scrolls horizontally.
- Library header controls stack; grid is responsive.

Screenshot automation:

- Added `scripts/capture-report-screenshots.js`.
- Captures auth, dashboard desktop/tablet/mobile, create, library, edit modal, active player, editor, profile, API Platform, API key modal, admin dashboard, and verification output.
- Latest manifest:
  - `artifacts/report/screenshot-manifest.json`
  - 23 screenshots
  - 0 page-level horizontal overflow findings
- Responsive smoke:
  - `artifacts/report/responsive-smoke.json`
  - 0 page-level horizontal overflow findings

### Build Warning Fix

`src/app/layout.tsx`:

- Added `metadataBase`.
- Latest build no longer emits the earlier `metadataBase` warning.

### API Platform Docs

`src/app/api-platform/ApiPlatformClient.tsx`:

- Added visible `PATCH /v1/tracks/:id` endpoint in the Quick Start endpoint list.

### Strict Admin Checks

Strict admin enforcement is now enabled.

Added:

- `src/lib/auth/admin.ts`
- `scripts/ensure-admin.js`
- `supabase/migrations/20260518_admin_access.sql`

Modified:

- `src/app/admin/page.tsx`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/tracks/route.ts`
- `src/components/layout/Sidebar.tsx`
- `tests/selenium/aurabeatCrud.spec.js`
- `scripts/capture-report-screenshots.js`
- `.gitignore`

Behavior:

- `/admin` redirects non-admin users to `/dashboard`.
- `/api/admin/users` returns `403` for non-admin users.
- `/api/admin/tracks` returns `403` for non-admin users.
- Sidebar shows Admin link only to admin users.
- Admin page and admin API mutations use the service-role admin client only after authorization.
- Selenium now asserts a normal test user receives `403` from `/api/admin/users`.

Important DB detail:

- The current Supabase database does **not** have `profiles.is_admin` yet.
- `scripts/ensure-admin.js` tried RPC-based schema application, but the current project does not expose a SQL RPC.
- Until the migration is applied, strict admin checks use fallback role detection:

```text
profiles.plan = "Admin"
```

Admin seed:

- `node scripts/ensure-admin.js` was run.
- It created one admin auth user/profile when none existed.
- It was rerun and now reports `status: "exists"`.
- Non-secret summary:

```text
artifacts/report/admin-seed-result.json
```

Latest summary:

```json
{
  "status": "exists",
  "adminModel": "profiles.plan=Admin fallback",
  "schemaAppliedByRpc": false
}
```

Generated credentials:

- Stored in `.admin.local.json`.
- File is gitignored.
- File permissions are owner-only.
- Do not print the password.

## Verification Already Passed

Latest commands that passed:

```bash
node --check scripts/ensure-admin.js
node --check scripts/capture-report-screenshots.js
node --check tests/selenium/aurabeatCrud.spec.js
node scripts/ensure-admin.js
npm run lint
npm run build
npm run dev -- -p 3001
SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
SELENIUM_RUN_GENERATE=1 SELENIUM_GENERATE_TIMEOUT_MS=240000 SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
SELENIUM_BASE_URL=http://127.0.0.1:3001 node scripts/capture-report-screenshots.js
```

Results:

- Lint passed.
- Build passed.
- Selenium passed.
- Screenshot capture passed.
- Admin seed is idempotent and reports existing admin.
- Screenshot manifest has 23 screenshots and no page-level overflow findings.
- Dev server was stopped after verification.
- After the storage cleanup work, `node --check tests/selenium/aurabeatCrud.spec.js`, `npm run lint`, `npm run build`, and Selenium passed again.
- On 18 May 2026, Gradio health returned `200` and live Selenium generation passed with `SELENIUM_RUN_GENERATE=1`.
- Live Selenium output is saved at `artifacts/report/selenium-output-live-generate.txt`.

## Known Caveats

### Supabase Admin Schema

The intended admin model is:

```sql
profiles.is_admin boolean not null default false
```

Migration exists:

```text
supabase/migrations/20260518_admin_access.sql
```

It still needs the remote Postgres password to be applied through Supabase CLI from this machine.

Latest CLI status:

- `supabase link --project-ref hpkklopnsnmuxpgyzgcx --yes` completed.
- `supabase db push --dry-run --yes` showed one pending migration: `20260518_admin_access.sql`.
- `supabase db push --yes` and `supabase db query --linked -f ...` were blocked by the Supabase pooler after temp-role auth retries.
- The CLI explicitly requested `SUPABASE_DB_PASSWORD`.
- `SUPABASE_DB_PASSWORD`, `DATABASE_URL`, and `POSTGRES_URL` are not present in the shell or `.env.local`.

To apply from CLI, set the DB password without printing it:

```bash
export SUPABASE_DB_PASSWORD='...'
supabase db push --yes
node scripts/ensure-admin.js
```

After applying it, run:

```bash
node scripts/ensure-admin.js
```

Expected after migration:

- `artifacts/report/admin-seed-result.json` should report:

```text
adminModel: "profiles.is_admin"
```

The fallback `plan = "Admin"` can remain for backwards compatibility, or be removed after the DB is confirmed migrated.

### Live AI Generation

`GRADIO_SERVER_URL` is configured and currently usable.

Generation timeout change:

- `src/app/api/generate/route.ts` and `src/app/api/v1/generate/route.ts` now allow up to 180 seconds for Gradio result retrieval.
- Public `/v1/generate` returns `504` with `AI_GENERATION_TIMEOUT` when result retrieval times out.
- This was needed because the first live Selenium run reached Gradio but exceeded the previous 60-second result timeout.

Latest health artifact:

```text
artifacts/report/gradio-health.json
```

Known result:

```text
prediction endpoint returned 200
```

Live verification:

```bash
SELENIUM_RUN_GENERATE=1 SELENIUM_GENERATE_TIMEOUT_MS=240000 SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

Result: passed.

Before live demo:

1. Keep the Colab/Gradio runtime awake.
2. Confirm `GRADIO_SERVER_URL` in `.env.local` still points to the current runtime.
3. Restart Next dev server.
4. Try generation from `/create`.
5. Optionally rerun the live Selenium command above.

### Storage Cleanup

- Public API `DELETE /v1/tracks/[id]`, Library `DELETE /api/tracks/[id]`, and Admin `DELETE /api/admin/tracks?id=...` now all attempt shared Supabase Storage cleanup.
- Cleanup applies when `audio_url` is a parseable Supabase Storage URL for the `tracks` bucket.
- Rows are still deleted even if storage cleanup fails; failures are logged server-side so the user-facing delete flow is not blocked.

### Admin System Health UI

- Admin dashboard currently shows AI Server (Gradio) as static/offline UI.
- Could be made dynamic by calling a health endpoint or checking `/gradio_api/call/predict`.

## Remaining Work

### Highest Priority

1. Apply admin DB migration.
   - Use `supabase/migrations/20260518_admin_access.sql`.
   - Apply through Supabase CLI after setting `SUPABASE_DB_PASSWORD`, or through Supabase SQL Editor.
   - Rerun `node scripts/ensure-admin.js`.
   - Confirm admin seed summary changes from fallback `profiles.plan=Admin` to `profiles.is_admin`.

2. Rerun verification after DB changes.
   - Restart dev server after build or env changes.
   - Run lint/build/Selenium.
   - Refresh screenshots only if UI changed.

### Medium Priority

1. Improve Admin dashboard system health.
   - Make AI Server status dynamic.
   - Show configured/unreachable/online states.

2. Optional admin cleanup after migration.
   - Decide whether to keep `plan = "Admin"` fallback in `src/lib/auth/admin.ts`.
   - Keeping it is safer for demo continuity.
   - Removing it is cleaner after schema migration is guaranteed.

3. Add richer UI test coverage.
   - Profile update.
   - API Platform modal.
   - Admin user update/delete flows.
   - Negative API key tests.

### Lower Priority

1. Add CI.
2. Add broader seed/cleanup utilities.
3. Add rate-limit tests for `/v1/generate`.
4. Add richer Library edit fields for `prompt` and `status`.

## Fresh Chat Recommended First Steps

1. Read this file.
2. Run:

```bash
git status --short
```

3. Confirm admin seed status:

```bash
node scripts/ensure-admin.js
cat artifacts/report/admin-seed-result.json
```

4. If SQL access is available, apply:

```text
supabase/migrations/20260518_admin_access.sql
```

5. Rerun:

```bash
npm run lint
npm run build
npm run dev -- -p 3001
SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

6. For screenshots, run only when needed:

```bash
SELENIUM_BASE_URL=http://127.0.0.1:3001 node scripts/capture-report-screenshots.js
```

7. For live AI demo, update `GRADIO_SERVER_URL` first.

## Safety Notes

- Do not revert unrelated dirty files.
- Do not print `.env.local` values.
- Do not print `.admin.local.json` password.
- Do not commit `.admin.local.json`.
- If a Next dev server behaves strangely after `npm run build`, stop it and restart `npm run dev -- -p 3001`.
