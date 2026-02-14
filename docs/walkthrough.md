# E2E Test Fix Walkthrough

## Overview
I have standardized the E2E tests by upgrading `TestStepHelper` to automatically generate `README.md` documentation with screenshot verification details. I also refactored `auth.spec.ts` to use this new helper.

## Changes

### 1. `TestStepHelper` Upgrade
Modified `tests/e2e/helpers/test-step-helper.ts` to:
- Be aware of `TestInfo` and `Page`.
- Implement `generateDocs()` which writes a `README.md` in the test directory.
- Capture screenshots automatically in `step()`.
- Log verifications for documentation.

### 2. `auth.spec.ts` Refactor
Created `tests/e2e/002-auth/auth.spec.ts` which:
- Uses `TestStepHelper` to define steps.
- Verifies Auth Wall for unauthenticated users.
- Performs programmatic sign-in (requires Emulators).
- Verifies Dashboard access for authenticated users.

### 3. Verification
I verified the `TestStepHelper` changes using the existing `001-scaffolding.spec.ts` test.

#### Scaffolding Test Result
- **Status**: PASSED
- **Documentation**: Generated at `tests/e2e/001-scaffolding/README.md`
- **Screenshot**:
  ![Home Page](../tests/e2e/001-scaffolding/screenshots/home-page.png)

#### Auth Test Status
> [!WARNING]
> `auth.spec.ts` could not be fully verified locally because the Firebase Emulators require **Java**, which is not installed in this environment.

- **Action Required**: Run this test in an environment with Java installed (e.g., CI/CD) to generate the initial snapshots and `README.md`.
- **Command**: `VITE_FIREBASE_USE_EMULATORS=true npx playwright test tests/e2e/002-auth/auth.spec.ts --update-snapshots`

## Next Steps
1. Push changes to branch.
2. Ensure CI environment has Java installed.
3. Review generated `README.md` in `tests/e2e/002-auth/` after CI run.
