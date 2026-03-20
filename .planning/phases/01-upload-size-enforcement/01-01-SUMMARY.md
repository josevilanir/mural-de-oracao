---
phase: 01-upload-size-enforcement
plan: "01"
subsystem: upload
tags: [security, s3, presigned-post, file-upload]
dependency_graph:
  requires: []
  provides: [upload-size-enforcement]
  affects: [app/api/upload/route.ts, app/(app)/grupos/novo/page.tsx]
tech_stack:
  added: ["@aws-sdk/s3-presigned-post"]
  patterns: [presigned-post, content-length-range, FormData-upload]
key_files:
  created: []
  modified:
    - app/api/upload/route.ts
    - app/(app)/grupos/novo/page.tsx
    - package.json
decisions:
  - "Use createPresignedPost with content-length-range to enforce 5MB at the S3/R2 policy layer, not just server validation"
  - "Validate contentLength server-side before issuing presigned URL as a defense-in-depth measure"
  - "Client sends blob.size as contentLength param so server can reject oversized requests before generating any S3 credentials"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-20"
  tasks_completed: 2
  files_modified: 3
---

# Phase 01 Plan 01: Upload Size Enforcement Summary

**One-liner:** Presigned POST with content-length-range condition caps R2 uploads at 5MB, with server-side contentLength pre-validation before any S3 credentials are issued.

## What Was Built

Closed the "Presigned Upload URL With No File Size Limit" vulnerability (UPLOAD-01, UPLOAD-02) by:

1. Replacing `PutObjectCommand` + `getSignedUrl` with `createPresignedPost` which embeds a `content-length-range` S3 policy condition — R2 itself enforces the 5MB ceiling independently of the application layer.
2. Adding server-side `contentLength` parameter validation: the API rejects requests exceeding 5MB before issuing any presigned credentials.
3. Updating the client to pass `blob.size` as `contentLength` and upload via `POST` with `FormData` (required by presigned POST protocol).

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Install s3-presigned-post and rewrite upload API route | 4b65d8d | app/api/upload/route.ts, package.json |
| 2 | Update client upload to use presigned POST with FormData | e6290cb | app/(app)/grupos/novo/page.tsx |

## Decisions Made

1. **Defense-in-depth size validation**: Both server-side (contentLength param check) and S3-policy-level (content-length-range condition) enforcement. Either layer alone would suffice, but both together prevent bypasses at different trust boundaries.

2. **File field appended last in FormData**: Required by S3/R2 presigned POST protocol — all policy fields must precede the file field.

3. **No Content-Type header on upload fetch**: Browser sets the correct `multipart/form-data` boundary automatically; explicitly setting it would break the multipart form.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc --noEmit`: PASS
- `grep -n "content-length-range" app/api/upload/route.ts`: FOUND (line 36)
- `grep -n "MAX_FILE_SIZE" app/api/upload/route.ts`: FOUND (line 8, 25, 36)
- `grep -n "contentLength" app/api/upload/route.ts`: FOUND (lines 23-25)
- `grep -n "contentLength" app/(app)/grupos/novo/page.tsx`: FOUND (line 58)
- `grep -n "FormData" app/(app)/grupos/novo/page.tsx`: FOUND (line 66)
- No `PutObjectCommand` or `getSignedUrl` in route.ts: PASS
- No `method: "PUT"` or `presignedUrl` in client: PASS
