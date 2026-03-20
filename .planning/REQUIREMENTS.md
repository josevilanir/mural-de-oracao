# Requirements: Mural de Oração — Security Remediation

**Defined:** 2026-03-20
**Core Value:** User-submitted content and uploaded files must not be weaponizable against the platform or other users.

## v1 Requirements

### Upload Security

- [ ] **UPLOAD-01**: Presigned URL endpoint enforces a maximum file size via `ContentLengthRange` condition in the S3 policy
- [ ] **UPLOAD-02**: Presigned URL endpoint validates `Content-Length` header server-side before issuing the URL and rejects requests exceeding the limit

### Email Security

- [ ] **EMAIL-01**: All user-supplied strings (prayer titles, group names, usernames) are HTML-escaped before interpolation into email templates
- [ ] **EMAIL-02**: Escaping is applied consistently across all template files in `src/lib/email/templates/`

### CSRF Protection

- [ ] **CSRF-01**: Server actions and API mutation routes are protected against cross-site request forgery beyond the current SameSite=Lax default
- [ ] **CSRF-02**: Protection mechanism is verified to not break legitimate app flows (Google OAuth, credentials login, all mutation actions)

### Cleanup

- [ ] **CLEAN-01**: Each security issue is removed from `.planning/codebase/CONCERNS.md` after its fix is verified

## v2 Requirements

*(None for this milestone — focused security remediation only)*

## Out of Scope

| Feature | Reason |
|---------|--------|
| Tech debt (any types, orphaned types) | Separate milestone — no security risk |
| Performance fixes (unbounded queries, indexes) | Separate milestone |
| Missing features (notifications, report UI, email verification enforcement) | Separate milestone |
| Test coverage gaps | Separate milestone (though fixes may include targeted tests) |
| Fragile area hardening | Separate milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UPLOAD-01 | Phase 1 | Pending |
| UPLOAD-02 | Phase 1 | Pending |
| EMAIL-01 | Phase 2 | Pending |
| EMAIL-02 | Phase 2 | Pending |
| CSRF-01 | Phase 3 | Pending |
| CSRF-02 | Phase 3 | Pending |
| CLEAN-01 | Each phase | Pending |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after initial definition*
