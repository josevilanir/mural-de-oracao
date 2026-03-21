---
phase: 2
slug: audit-logging
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest (via `npm test`) |
| **Config file** | `package.json` (jest config) |
| **Quick run command** | `npm test -- --testPathPattern=audit --passWithNoTests` |
| **Full suite command** | `npm test -- --passWithNoTests` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=audit --passWithNoTests`
- **After every plan wave:** Run `npm test -- --passWithNoTests`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | AUDT-01, AUDT-02 | schema | `npx prisma validate` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | AUDT-01, AUDT-02 | integration | `npm test -- --testPathPattern=audit --passWithNoTests` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/audit-log.test.ts` — stubs verifying audit rows written for moderation and group actions
- [ ] Existing jest infrastructure covers framework requirements

*Wave 0 creates stub test file before implementation tasks run.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audit rows survive app restart | AUDT-01, AUDT-02 | Requires live DB + restart cycle | Write an audit row, restart dev server, query `SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 5` in Neon console |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
