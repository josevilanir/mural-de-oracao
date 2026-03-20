---
phase: 2
slug: email-html-escaping
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-20
updated: 2026-03-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run lib/email.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | < 1 second |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run lib/email.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | EMAIL-01 | unit | `npx vitest run lib/email.test.ts` | ✅ | ✅ green |
| 02-01-02 | 01 | 1 | EMAIL-02 | grep audit | `Select-String '\${[^}]*}' lib/email.ts | Where-Object { $_.Line -notmatch 'escape\(' -and $_.Line -notmatch 'btn\(' -and $_.Line -notmatch 'BASE_URL' -and $_.Line -notmatch 'content' -and $_.Line -notmatch 'url' -and $_.Line -notmatch 'body' -and $_.Line -notmatch 'token' }` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `lib/email.test.ts` — unit tests covering EMAIL-01 (XSS payload escaping for each user-controlled parameter: `name`, `authorName`, `commenterName`, `prayerTitle`, `groupName`)
- [x] `vitest.config.ts` — minimal config for Node environment (`environment: 'node'`)
- [x] Framework install: `npm install -D vitest`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Existing transactional emails (invites, password reset) send correctly with normal inputs | EMAIL-01 | Requires live Brevo SMTP credentials and a real send | Send a test email to a verified address and confirm no encoding artifacts in subject or body |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** Verified by Gemini CLI during phase execution.
