# Roadmap: Mural de Oração — Security Remediation

## Overview

Three confirmed security vulnerabilities are closed in sequence: unbounded file uploads, HTML injection via email templates, and CSRF exposure beyond SameSite=Lax. Each phase is independently verifiable. The final phase confirms all CONCERNS.md entries are cleared.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Upload Size Enforcement** - Presigned URL endpoint enforces a hard file-size ceiling server-side and in the S3 policy
- [ ] **Phase 2: Email HTML Escaping** - All user-supplied strings are HTML-escaped before interpolation into every email template
- [ ] **Phase 3: CSRF Hardening + Cleanup** - Server actions and API mutations are protected beyond SameSite=Lax; all CONCERNS.md security entries removed

## Phase Details

### Phase 1: Upload Size Enforcement
**Goal**: Uploaded files cannot exceed the enforced size limit regardless of client behavior
**Depends on**: Nothing (first phase)
**Requirements**: UPLOAD-01, UPLOAD-02
**Success Criteria** (what must be TRUE):
  1. A request to the presigned URL endpoint with a `Content-Length` exceeding the limit is rejected before a URL is issued
  2. The S3 presigned policy includes a `ContentLengthRange` condition that R2 enforces directly
  3. A legitimate upload within the size limit succeeds end-to-end without error
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — Enforce 5MB file-size ceiling via createPresignedPost content-length-range and server-side contentLength validation

### Phase 2: Email HTML Escaping
**Goal**: User-supplied strings cannot inject HTML into outbound email
**Depends on**: Phase 1
**Requirements**: EMAIL-01, EMAIL-02
**Success Criteria** (what must be TRUE):
  1. A prayer title containing `<script>alert(1)</script>` renders as literal escaped text in the sent email, not as markup
  2. Every template file in `src/lib/email/templates/` passes a grep audit showing no unescaped interpolation of user-supplied values
  3. Existing transactional emails (invites, password reset) send correctly with normal inputs
**Plans**: TBD

Plans:
- [ ] 02-01: Implement HTML escape utility and apply it across all email template interpolation points

### Phase 3: CSRF Hardening + Cleanup
**Goal**: Cross-site requests cannot trigger mutations; all confirmed security issues are cleared from CONCERNS.md
**Depends on**: Phase 2
**Requirements**: CSRF-01, CSRF-02, CLEAN-01
**Success Criteria** (what must be TRUE):
  1. A cross-origin POST to a server action or API mutation route is rejected (Origin/Host mismatch causes 403 or equivalent)
  2. Google OAuth callback, credentials login, and all in-app mutation flows complete successfully with protection active
  3. All three security issue entries (upload, email, CSRF) are absent from `.planning/codebase/CONCERNS.md`
**Plans**: TBD

Plans:
- [ ] 03-01: Implement Origin/Host validation in middleware for mutation routes and verify all legitimate flows pass
- [ ] 03-02: Remove resolved security entries from CONCERNS.md after verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Upload Size Enforcement | 0/1 | Not started | - |
| 2. Email HTML Escaping | 0/1 | Not started | - |
| 3. CSRF Hardening + Cleanup | 0/2 | Not started | - |
