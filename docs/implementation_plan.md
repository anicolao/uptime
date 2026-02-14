# E2E Test Standardization Plan

## Goal
Ensure all E2E tests generate a `README.md` that documents the test steps and programmatically verifies the content of each screenshot (by listing the active verifications).

## User Review Required
> [!IMPORTANT]
> `WORKFLOW.md` was not found in the root directory. I will assume a standard GitHub Flow (Branch -> Commit -> Push -> PR) unless directed otherwise.

## Proposed Changes

### Helpers
#### [MODIFY] [test-step-helper.ts](file:///Users/anicolao/projects/antigravity/uptime/tests/e2e/helpers/test-step-helper.ts)
- Implement `generateDocs()`:
    - Write `README.md` to the test file's directory.
    - Format: Title, Summary, Steps (Name, Description, Verifications List, Screenshot Image).
- Uncomment/Implement `toHaveScreenshot` in `step()`.
- Ensure `verifications` are captured for the doc generation.

### Tests
#### [NEW] [tests/e2e/002-auth/auth.spec.ts](file:///Users/anicolao/projects/antigravity/uptime/tests/e2e/002-auth/auth.spec.ts)
- Port existing `auth.spec.ts` logic to use `TestStepHelper`.
- usages of `signInTestUser` will be wrapped in step verifications or setup.

#### [DELETE] [tests/e2e/auth.spec.ts](file:///Users/anicolao/projects/antigravity/uptime/tests/e2e/auth.spec.ts)
- Remove the old non-conforming test.

## Verification Plan

### Automated Tests
- Run `npm run test:e2e` to verify:
    1.  Tests pass.
    2.  `tests/e2e/002-auth/README.md` is generated.
    3.  `tests/e2e/001-scaffolding/README.md` is generated.
- specific command: `npx playwright test`

### Manual Verification
- Inspect the generated `README.md` files to ensure they contain the expected verification lists and screenshot links.
