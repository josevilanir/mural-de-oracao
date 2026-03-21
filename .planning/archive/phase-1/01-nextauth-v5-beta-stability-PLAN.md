---
wave: 1
depends_on: []
files_modified:
  - package.json
  - package-lock.json
autonomous: true
---

# Plan 1: Pin NextAuth v5 Beta Version

## Objective
Pin the `next-auth` version strictly in `package.json` to avoid unexpected breaking changes from new pre-releases of the v5 beta, and ensure compatibility with the Edge Runtime.

## Requirements
- `next-auth` version in `package.json` must be exactly `5.0.0-beta.30` (no `^` or `~`).

## Tasks

<task>
<action>
Modify `package.json` to change the `next-auth` dependency from `"^5.0.0-beta.30"` to exactly `"5.0.0-beta.30"`.
Run `npm install` to update `package-lock.json`.
</action>
<read_first>
- package.json
</read_first>
<acceptance_criteria>
- `package.json` contains exactly `"next-auth": "5.0.0-beta.30"` (without the caret).
- Running `npm run build` succeeds, proving no build errors were introduced.
</acceptance_criteria>
</task>

## Verification
- Run `npm ls next-auth` and verify it reports `5.0.0-beta.30` exactly.
- Run `npm run lint` and `npm run build` to ensure the project still builds.

## must_haves
- [ ] `next-auth` is strictly pinned in `package.json`.
- [ ] Lockfile is updated (`package-lock.json`).
