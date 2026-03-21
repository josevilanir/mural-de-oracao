---
description: "Fix concerns from CONCERNS.md"
depends_on: ""
files_modified:
  - "package.json"
  - "next.config.mjs"
  - ".env.example"
  - "middleware.ts"
  - "components/prayers/PrayerRequestsSection.tsx"
  - "lib/mock-prayer-requests.ts"
  - "lib/email.ts"
  - "lib/email.test.ts"
  - "tests/__mocks__/mock-prayer-requests.ts"
  - ".github/workflows/ci.yml"
  - ".planning/codebase/CONCERNS.md"
wave: 1
autonomous: true
---

# Phase 1: Fix concerns from CONCERNS.md

**Goal:** Resolve the critical issues identified in CONCERNS.md, including typing/linting checks, environment variables, dependencies cleanup, types in middleware, mock data leak, sanitization logic, and establishing a basic CI workflow.

## Tasks

```xml
<task>
  <description>Task 1: Resolve Dependencies Mismatches (Concerns 1 & 3)</description>
  <action>
    Run `npm uninstall resend html-escaper @types/html-escaper`. 
    Check `package.json` to ensure `"next-auth":"5.0.0-beta.30"` is strictly pinned (no ^ or ~). If it has ^ or ~ in front of the version, remove it.
  </action>
  <read_first>
    - package.json
  </read_first>
  <acceptance_criteria>
    - `package.json` does NOT contain `resend`
    - `package.json` does NOT contain `html-escaper`
    - `package.json` contains `"next-auth": "5.0.0-beta.30"`
  </acceptance_criteria>
</task>

<task>
  <description>Task 2: Enable Build-Time Checks (Concern 2)</description>
  <action>
    Edit `next.config.mjs`:
    - Delete the `eslint` block containing `ignoreDuringBuilds: true`.
    - Delete the `typescript` block containing `ignoreBuildErrors: true`.
  </action>
  <read_first>
    - next.config.mjs
  </read_first>
  <acceptance_criteria>
    - `next.config.mjs` no longer contains `ignoreDuringBuilds: true`
    - `next.config.mjs` no longer contains `ignoreBuildErrors: true`
  </acceptance_criteria>
</task>

<task>
  <description>Task 3: Update Environment Variables (Concerns 6, 7, 8)</description>
  <action>
    Edit `.env.example`:
    - Remove the section for Resend and `RESEND_API_KEY`.
    - Add Brevo configuration:
      `BREVO_API_KEY="xkeysib-..."`
      `BREVO_FROM_EMAIL="noreply@domain.com"`
      `BREVO_FROM_NAME="Mural de Oracao"`
    - Add Upstash configuration:
      `UPSTASH_REDIS_REST_URL="https://...upstash.io"`
      `UPSTASH_REDIS_REST_TOKEN="AY..."`
    - Add Cloudflare R2 configuration:
      `CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"`
      `CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key"`
      `CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_key"`
      `CLOUDFLARE_R2_BUCKET_NAME="your_bucket_name"`
      `CLOUDFLARE_R2_PUBLIC_URL="https://pub-..."`
  </action>
  <read_first>
    - .env.example
  </read_first>
  <acceptance_criteria>
    - `.env.example` contains `BREVO_API_KEY`
    - `.env.example` contains `CLOUDFLARE_R2_ACCOUNT_ID`
    - `.env.example` contains `UPSTASH_REDIS_REST_URL`
    - `.env.example` does NOT contain `RESEND_API_KEY`
  </acceptance_criteria>
</task>

<task>
  <description>Task 4: Fix `any` Type in Middleware (Concern 9)</description>
  <action>
    Edit `middleware.ts`:
    - Import `NextRequest` from `"next/server"`.
    - Add `type NextAuthRequest = NextRequest & { auth: any };` right above the `export default auth(...)` call.
    - Replace `export default auth((req: any) => {` with `export default auth((req: NextAuthRequest) => {`.
  </action>
  <read_first>
    - middleware.ts
  </read_first>
  <acceptance_criteria>
    - `middleware.ts` contains `NextAuthRequest`
    - `middleware.ts` no longer contains `(req: any)`
  </acceptance_criteria>
</task>

<task>
  <description>Task 5: Consolidate Sanitization Logic (Concern 10)</description>
  <action>
    Edit `lib/email.ts`:
    - Remove `import { escape } from 'html-escaper';`.
    - Import `sanitizeUserInput` from `@/lib/sanitize` instead: `import { sanitizeUserInput } from '@/lib/sanitize';`
    - Replace all calls to `escape(...)` with `sanitizeUserInput(...)`.
    Edit `lib/email.test.ts`:
    - Substitute the `escape` mock logic or expectations with `sanitizeUserInput`.
    - Note that `sanitizeUserInput` expects `&#x27;` for single quotes instead of `&#39;`.
  </action>
  <read_first>
    - lib/email.ts
    - lib/email.test.ts
    - lib/sanitize.ts
  </read_first>
  <acceptance_criteria>
    - `lib/email.ts` imports `sanitizeUserInput`
    - `lib/email.ts` does NOT contain `html-escaper`
    - Tests for email must pass (e.g. run `npx vitest run lib/email.test.ts`)
  </acceptance_criteria>
</task>

<task>
  <description>Task 6: Move Mock Data Out of Production (Concern 11)</description>
  <action>
    Run `mkdir -p tests/__mocks__`.
    Run `git mv lib/mock-prayer-requests.ts tests/__mocks__/mock-prayer-requests.ts` (or standard mv).
    Edit `components/prayers/PrayerRequestsSection.tsx`:
    - Change import `import { mockPrayerRequests } from "@/lib/mock-prayer-requests";` to `import { mockPrayerRequests } from "@/tests/__mocks__/mock-prayer-requests";` (or relative path string pointing to `../../tests/__mocks__/mock-prayer-requests`).
  </action>
  <read_first>
    - components/prayers/PrayerRequestsSection.tsx
  </read_first>
  <acceptance_criteria>
    - `tests/__mocks__/mock-prayer-requests.ts` exists on disk.
    - `lib/mock-prayer-requests.ts` does NOT exist.
    - `components/prayers/PrayerRequestsSection.tsx` imports from the new mocks path.
  </acceptance_criteria>
</task>

<task>
  <description>Task 7: Establish Explicit CI/CD Pipeline (Concern 5)</description>
  <action>
    Create a new file `.github/workflows/ci.yml`.
    Add the following YAML content (adjust indentation):
    ```yaml
    name: CI Pipeline
    on:
      push:
        branches: [ main ]
      pull_request:
        branches: [ main ]
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: '20'
          - run: npm ci
          - run: npm run lint
          - run: npx tsc --noEmit
          - run: npm run test
    ```
  </action>
  <read_first>
    - package.json
  </read_first>
  <acceptance_criteria>
    - `.github/workflows/ci.yml` exists.
    - `.github/workflows/ci.yml` contains a step with `npx tsc --noEmit`.
  </acceptance_criteria>
</task>

<task>
  <description>Task 8: Mark CONCERNS.md as Fixed</description>
  <action>
    Edit `.planning/codebase/CONCERNS.md`:
    - Add `(FIXED)` or checkboxes `[x]` to all the headings or to the document to specify that they have been resolved. Wait, just prepend `[FIXED] ` to each of the `##` section titles from Concern 1 to 11.
  </action>
  <read_first>
    - .planning/codebase/CONCERNS.md
  </read_first>
  <acceptance_criteria>
    - `.planning/codebase/CONCERNS.md` contains `[FIXED]` on its headers.
  </acceptance_criteria>
</task>
```

## Verification

Wait for the executor to finish and visually confirm each file respects the action and output cleanly.
