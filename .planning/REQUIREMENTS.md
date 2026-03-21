# Requirements: Mural de Oração — v1.3 Quality & Observability

**Defined:** 2026-03-21
**Core Value:** User-submitted content and uploaded files must not be weaponizable against the platform or other users.

## v1 Requirements

Requirements for milestone v1.3. Each maps to roadmap phases.

### Testing

- [ ] **TEST-01**: Server actions for prayer operations (create, delete, comment, resolve) have automated tests
- [ ] **TEST-02**: Server actions for group management (create, delete, membership) have automated tests
- [ ] **TEST-03**: API routes (`/api/upload`, `/api/notifications`, `/api/groups`) have automated tests
- [ ] **TEST-04**: Auth flows (registration, login, password reset, email verification) have automated tests
- [ ] **TEST-05**: Typed mock factories replace `as any` casts in existing test files

### Observability

- [ ] **OBSV-01**: Unhandled errors in server actions are captured in external error tracking
- [ ] **OBSV-02**: Unhandled errors in API routes are captured in external error tracking

### Audit Logging

- [ ] **AUDT-01**: Admin moderation actions (hide/approve prayer, approve/reject group) are logged to a database audit trail
- [ ] **AUDT-02**: Group management actions (create, delete, membership changes) are logged to the audit trail

### Email

- [ ] **EMAIL-01**: Email templates use a shared builder function that enforces `sanitizeUserInput()` on all user-supplied fields

### Code Quality

- [ ] **CODE-01**: `scope: 'mural'` query behavior clarified with inline comment in `feed.ts`

## Future Requirements

### Testing

- **TEST-06**: React component tests for key UI components
- **TEST-07**: End-to-end tests for critical user flows

### Observability

- **OBSV-03**: Performance monitoring (slow query detection, response time tracking)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Notification system | Feature work — next milestone |
| Report UI | Feature work — next milestone |
| Email verification enforcement | Feature work — next milestone |
| R2 lifecycle policies / multi-region DB | Scaling — future milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 3 | Pending |
| TEST-02 | Phase 3 | Pending |
| TEST-03 | Phase 3 | Pending |
| TEST-04 | Phase 3 | Pending |
| TEST-05 | Phase 3 | Pending |
| OBSV-01 | Phase 1 | Pending |
| OBSV-02 | Phase 1 | Pending |
| AUDT-01 | Phase 2 | Pending |
| AUDT-02 | Phase 2 | Pending |
| EMAIL-01 | Phase 1 | Pending |
| CODE-01 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after roadmap creation*
