---
phase: 2
slug: email-html-escaping
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (to be installed in Wave 0) |
| **Config file** | `vitest.config.ts` — Wave 0 creates it |
| **Quick run command** | `npx vitest run lib/email.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

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
| 02-01-01 | 01 | 1 | EMAIL-01 | unit | `npx vitest run lib/email.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | EMAIL-02 | grep audit | `result=$(grep -n '\${[^}]*}' lib/email.ts \| grep -v 'escape(' \| grep -v 'btn(' \| grep -v 'BASE_URL' \| grep -v 'content') && [ -z "$result" ]` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lib/email.test.ts` — unit tests covering EMAIL-01 (XSS payload escaping for each user-controlled parameter: `name`, `authorName`, `commenterName`, `prayerTitle`, `groupName`)
- [ ] `vitest.config.ts` — minimal config for Node environment (`environment: 'node'`)
- [ ] Framework install: `npm install -D vitest` — no test runner detected in project

*Wave 0 must complete before Task 02-01-01 runs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Existing transactional emails (invites, password reset) send correctly with normal inputs | EMAIL-01 | Requires live Brevo SMTP credentials and a real send | Send a test email to a verified address and confirm no encoding artifacts in subject or body |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
