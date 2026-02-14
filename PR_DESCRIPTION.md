# Fix E2E Test Standards

## User Request

> I over-eagerly accepted the last PR without noticing that the e2e test does not conform to standards. It is supposed to generate a README.md and have programmatic verification of what is in each screenshot. Fix it and follow WORKFLOW.md rigidly to put up a PR that corrects the e2e test.

## Changes

- Updated `TestStepHelper` in `tests/e2e/helpers/test-step-helper.ts` to generate `README.md` automatically.
- Refactored `auth.spec.ts` to `tests/e2e/002-auth/auth.spec.ts` using the new helper.
- Added documentation artifacts in `docs/`.

## Verification

- `001-scaffolding.spec.ts` verified to pass and generate correct documentation.
- `auth.spec.ts` implemented but requires Firebase Emulators (check CI).
