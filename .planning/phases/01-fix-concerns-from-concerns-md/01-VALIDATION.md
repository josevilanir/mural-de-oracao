---
phase: 1
slug: 01-fix-concerns-from-concerns-md
status: final
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | Concern 1, 3 | config | `cat package.json` | ✅ | ✅ green |
| 1-01-02 | 01 | 1 | Concern 2 | config | `cat next.config.mjs` | ✅ | ✅ green |
| 1-01-03 | 01 | 1 | Concern 6-8 | config | `cat .env.example` | ✅ | ✅ green |
| 1-01-04 | 01 | 1 | Concern 9 | typecheck | `npx tsc --noEmit` | ✅ | ✅ green |
| 1-01-05 | 01 | 1 | Concern 10 | unit | `npm run test` | ✅ | ✅ green |
| 1-01-06 | 01 | 1 | Concern 11 | config | `ls tests/__mocks__` | ✅ | ✅ green |
| 1-01-07 | 01 | 1 | Concern 5 | config | `cat .github/workflows/ci.yml` | ✅ | ✅ green |
| 1-01-08 | 01 | 1 | Concern Tracking | doc | `cat .planning/codebase/CONCERNS.md` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-20
