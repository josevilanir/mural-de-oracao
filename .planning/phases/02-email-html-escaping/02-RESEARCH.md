# Phase 2: Email HTML Escaping - Research

**Researched:** 2026-03-20
**Domain:** HTML injection prevention in transactional email templates (TypeScript/Node.js)
**Confidence:** HIGH

## Summary

The email module is a single file at `lib/email.ts`. It contains all templates as TypeScript template literals that interpolate user-supplied strings directly into raw HTML without any encoding. Five exported functions are affected: `sendVerificationEmail`, `sendCommentNotificationEmail`, `sendGroupStatusEmail`, `sendJoinRequestStatusEmail`, and — to a lesser degree — `sendPasswordResetEmail` (which only uses a token, not a user-controlled display string, but `name` is absent there). The CONCERNS.md audit already identified this as "HTML Injection in Email Templates" with zero mitigation in place.

The fix is a narrow, targeted change: add a single HTML-escaping helper and apply it to every user-supplied string at the point of interpolation inside `lib/email.ts`. No architectural change is required. The `html-escaper` npm package (3.0.3, zero dependencies, ESM+CJS) is the standard choice for this problem in the Node/Next.js ecosystem — it encodes `&`, `<`, `>`, `"`, and `'` to their HTML entity equivalents.

**Primary recommendation:** Install `html-escaper`, wrap every user-controlled value interpolated in the template literals with `escape()` from that package, and verify with a grep audit that no raw interpolations remain.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EMAIL-01 | All user-supplied strings (prayer titles, group names, usernames) are HTML-escaped before interpolation into email templates | `html-escaper` applied at each interpolation site in `lib/email.ts` |
| EMAIL-02 | Escaping is applied consistently across all template files in `src/lib/email/templates/` | Only one file exists (`lib/email.ts`); CONCERNS.md references an older path that no longer exists — audit confirms single file |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| html-escaper | 3.0.3 | Encode `& < > " '` to HTML entities | Zero dependencies, ESM+CJS, ~200 bytes minified, sole purpose is correct HTML escaping |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| html-escaper | `he` (1.2.0) | `he` is full HTML entity codec — encodes named/numeric entities too. Overkill for output escaping; heavier. |
| html-escaper | Hand-rolled replace chain | Missing edge cases (e.g., single quotes, order of replacements). Never hand-roll. |
| html-escaper | Template engine (Handlebars, Mustache) | Would require rewriting all templates. Disproportionate scope for this phase. |

**Installation:**
```bash
npm install html-escaper
```

**Version verification:** `npm view html-escaper version` returned `3.0.3` on 2026-03-20.

## Architecture Patterns

### Affected File Structure
```
lib/
└── email.ts        # Single file — all templates and send logic live here
```

The CONCERNS.md references `src/lib/email/templates/` but that path does not exist in the repository. The actual file is `lib/email.ts` at the project root level. EMAIL-02's audit target is this single file.

### Pattern 1: Escape at Interpolation Site
**What:** Import `escape` from `html-escaper` and wrap every user-controlled variable at the point of interpolation, not before passing to the function.
**When to use:** When templates are TypeScript template literals (as here), applying escape at the interpolation site is the safest approach — it cannot be forgotten for new strings added to the same template.
**Example:**
```typescript
// Source: html-escaper README (https://github.com/WebReflection/html-escaper)
import { escape } from 'html-escaper';

// Before (vulnerable):
`<strong>${authorName}</strong>`

// After (safe):
`<strong>${escape(authorName)}</strong>`
```

### User-Controlled Strings Requiring Escaping
Every parameter that comes from user input across all five template functions:

| Function | Parameters to escape |
|----------|---------------------|
| `sendVerificationEmail` | `name` |
| `sendCommentNotificationEmail` | `authorName`, `commenterName`, `prayerTitle` |
| `sendGroupStatusEmail` | `name`, `groupName` (also appears in `subject` line — subject is plain text, not HTML, so escaping there is unnecessary and would double-encode) |
| `sendJoinRequestStatusEmail` | `name`, `groupName` (same subject caveat) |

Note: `token` in password-reset/verification is not user-controlled (server-generated JWT/UUID). URL values interpolated via `BASE_URL` + `token` are also not user-controlled. The `btn()` helper takes `href` (server-constructed) and `label` (static strings) — these do not need escaping. The `label` parameter of `btn()` is always a hardcoded string literal in the current code; that invariant should be preserved.

### Anti-Patterns to Avoid
- **Escaping in the subject line:** `subject` is plain-text content sent to Brevo's `subject` field — it is not rendered as HTML. Escaping it would produce visible `&amp;` literals in email subject lines.
- **Escaping URL values:** `href` attributes constructed from `BASE_URL` + server-generated tokens should not go through HTML escaping — `encodeURIComponent` handles the URL encoding concern separately, and HTML-escaping a URL would break it.
- **Sanitizing instead of escaping:** DOMPurify-style sanitization strips tags. For email output, encoding is correct — preserve the text content, make tags inert.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML entity encoding | Custom `.replace(/&/g, '&amp;')` chain | `html-escaper` | Order matters (`&` must be replaced first); single-quote handling is easy to forget; `"` in attribute context requires encoding; the library handles all five cases correctly in the right order |

**Key insight:** A hand-rolled replace chain that replaces `<` before `&` will double-encode entities already present. `html-escaper` applies replacements in the correct order and has a test suite validating correctness.

## Common Pitfalls

### Pitfall 1: Escaping the Subject Line
**What goes wrong:** Applying `escape()` to `groupName` or `commenterName` in subject string interpolation produces `&amp;` visible to the email recipient in their inbox subject preview.
**Why it happens:** Subject is passed as a plain-text field to the email API, not rendered as HTML.
**How to avoid:** Only apply `escape()` inside the `html` string (the `layout()` call argument), never to values used only in the `subject` string.
**Warning signs:** Email subjects showing `&amp;` or `&#x27;` in a test send.

### Pitfall 2: Double-Escaping URLs
**What goes wrong:** Passing an `href` value through `escape()` converts `&` query parameters to `&amp;`, producing broken links.
**Why it happens:** URLs use `&` as query separator; HTML-encoding it makes the link non-functional.
**How to avoid:** `btn(url, label)` — the `url` argument is server-constructed and must not be HTML-escaped. Only the display `label` and surrounding text needs escaping (but `label` is always a hardcoded string in current usage).
**Warning signs:** Clicking the button in the email navigates to a 404 or returns a malformed token.

### Pitfall 3: Missing EMAIL-02 Scope
**What goes wrong:** CONCERNS.md references `src/lib/email/templates/` but that directory does not exist. The audit must target `lib/email.ts` at the project root.
**Why it happens:** The CONCERNS.md was likely written against an anticipated or past structure.
**How to avoid:** Run the grep audit against `lib/email.ts` (the actual file), not the path in CONCERNS.md.

## Code Examples

Verified patterns from official sources:

### Installing and Using html-escaper
```typescript
// Source: https://github.com/WebReflection/html-escaper (npm 3.0.3)
import { escape } from 'html-escaper';

// Encodes: & → &amp;  < → &lt;  > → &gt;  " → &quot;  ' → &#39;
escape('<script>alert(1)</script>')
// → '&lt;script&gt;alert(1)&lt;/script&gt;'
```

### Grep Audit Command
```bash
# Find template literal interpolations in lib/email.ts that are NOT wrapped in escape()
# Any ${...} that doesn't start with escape( is potentially unescaped user data
grep -n '\${[^}]*}' lib/email.ts | grep -v 'escape(' | grep -v 'btn(' | grep -v 'BASE_URL' | grep -v 'content'
```

### Correct Pattern After Fix
```typescript
import { escape } from 'html-escaper';

// Inside sendCommentNotificationEmail:
layout(`
  <h2 ...>Novo comentário de encorajamento</h2>
  <p ...>
    Olá, <strong>${escape(authorName)}</strong>!<br/>
    <strong>${escape(commenterName)}</strong> deixou uma palavra de encorajamento no seu pedido
    <em>"${escape(prayerTitle)}"</em>.
  </p>
  ${btn(url, "Ver comentário")}
`)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Handlebars/Mustache auto-escaping | Escape at interpolation site for raw template literals | Always applicable | No template engine migration needed — targeted library call is idiomatic in modern Node |
| Custom replace chains | `html-escaper` or equivalent | Node ecosystem standardized ~2018 | No custom code needed |

## Open Questions

1. **CONCERNS.md path discrepancy (`src/lib/email/templates/` vs `lib/email.ts`)**
   - What we know: `lib/email.ts` at project root is the only email file and contains all templates
   - What's unclear: Whether the `src/lib/email/templates/` path ever existed or is an anticipatory reference
   - Recommendation: Planner should specify the grep audit runs against `lib/email.ts` and updates CONCERNS.md to reference the correct path when closing EMAIL-01/02

2. **Subject line values with special chars**
   - What we know: `subject` strings interpolate `groupName` and `commenterName` in plain-text context
   - What's unclear: Whether Brevo's API renders subjects as HTML in any edge case
   - Recommendation: Do not HTML-escape subject values; Brevo's `subject` field is plain text per their API spec. If a group is named `<Oração>`, the recipient should see `<Oração>` in their subject, not `&lt;Oração&gt;`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, or test files exist in the project |
| Config file | None — Wave 0 must create it |
| Quick run command | `npx vitest run lib/email.test.ts` (after Wave 0 setup) |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EMAIL-01 | `<script>alert(1)</script>` in prayer title renders as escaped text in email HTML | unit | `npx vitest run lib/email.test.ts` | ❌ Wave 0 |
| EMAIL-02 | All interpolations in `lib/email.ts` are wrapped with `escape()` | grep audit (not automated test) | `grep -n '\${[^}]*}' lib/email.ts \| grep -v escape` | N/A — manual audit step |

### Sampling Rate
- **Per task commit:** `npx vitest run lib/email.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `lib/email.test.ts` — unit tests covering EMAIL-01 (XSS payload escaping for each user-controlled parameter)
- [ ] `vitest.config.ts` — minimal config for Node environment (`environment: 'node'`)
- [ ] Framework install: `npm install -D vitest` — no test runner detected

## Sources

### Primary (HIGH confidence)
- `lib/email.ts` — direct code inspection, all five template functions reviewed
- `package.json` — confirmed dependency list; `html-escaper` not yet installed
- `npm view html-escaper version` — confirmed current version 3.0.3 (2026-03-20)
- `.planning/codebase/CONCERNS.md` — "HTML Injection in Email Templates" confirmed, zero mitigation
- https://github.com/WebReflection/html-escaper — official README reviewed

### Secondary (MEDIUM confidence)
- Brevo SMTP API docs (https://developers.brevo.com/reference/sendtransacemail) — `subject` is plain-text field, `htmlContent` is HTML; escaping in subject would produce literal entities

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package verified against npm registry, zero dependencies confirmed
- Architecture: HIGH — based on direct code inspection of the single affected file
- Pitfalls: HIGH — derived from direct analysis of actual code, not hypothetical patterns

**Research date:** 2026-03-20
**Valid until:** 2026-06-20 (stable domain — HTML escaping has not changed in a decade)
