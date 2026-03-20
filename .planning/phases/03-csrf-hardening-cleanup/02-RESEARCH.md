# Phase 3: CSRF Hardening + Cleanup - Research

**Confidence:** HIGH

## Summary
Next.js 15 provides baseline CSRF protection for Server Actions by default. This phase focuses on extending this protection to API routes and hardening the validation logic to prevent bypasses in proxy environments, followed by a cleanup of the security concerns log.

## Standard Stack
- **Next.js 15**: Built-in `Origin` vs `Host` check for Server Actions.
- **NextAuth v5**: Internal CSRF state management for authentication flows.

## Architecture Patterns
### Global CSRF Middleware
Verify `Origin` header for all `POST/PUT/PATCH/DELETE` requests.
- **Exemptions**: `/api/auth/*` (handled by NextAuth).
- **Validation**: `Origin` must match `process.env.NEXTAUTH_URL` or `X-Forwarded-Host`.

## Common Pitfalls
- **OAuth Callbacks**: Strict origin checks can break OAuth redirects from providers like Google/GitHub if the callback route isn't exempted.
- **Mobile/Native Clients**: If the app eventually supports native clients, they might not send standard `Origin` headers.

## Cleanup Targets (CONCERNS.md)
- Remove: "HTML Injection in Email Templates" (Fixed in Phase 2)
- Remove: "No CSRF Protection on Server Actions" (Fixed in Phase 3)
- Remove: "Unbounded file uploads" (Fixed in Phase 1)

## File Analysis
### `middleware.ts`
Current middleware handles authentication gating. We need to add a conditional block to check request headers for mutation methods.

### `lib/auth.ts`
NextAuth configuration. Confirming that `/api/auth` is the base path for OAuth callbacks.

### `.planning/codebase/CONCERNS.md`
Exact entries to be removed are under the "Security Issues" header.
