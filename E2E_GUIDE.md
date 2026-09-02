# E2E testing guide

Playwright verifies the application against Firebase Auth, Realtime Database, and Functions emulators. The suite covers database authorization rules, the signed-out auth wall, authenticated navigation, administrator authorization, event projection, a protected monitor run, and the resulting dashboard status.

## Zero-pixel tolerance

Every documented UI step is asserted before capture and compared with:

```ts
maxDiffPixels: 0
threshold: 0
```

There is no visual tolerance. Dynamic values such as timestamps, latency, generated IDs, and Git SHAs are explicitly marked and masked using one stable color. The surrounding layout, labels, and all non-dynamic pixels remain exact.

CI uses one macOS worker, one Chromium version, a fixed viewport, locale, timezone, color scheme, reduced motion, and software-rendering flags. The screenshot-update workflow is manual so a failing comparison cannot silently approve its own new baseline.

## Structure

Tests live under `tests/e2e/`:

```text
000-security/     Realtime Database authorization
001-scaffolding/  Signed-out shell
002-auth/         Authentication and private routes
003-mvp/          Complete monitoring workflow
helpers/          Step assertions, screenshots, and generated docs
```

`TestStepHelper` writes each scenario's `README.md` from its asserted steps. A step performs its action, executes every listed verification, and only then captures the screenshot.

## Commands

From `nix develop`, after building both packages:

```sh
npx firebase emulators:exec --only auth,database,functions --project demo-antigravity-uptime "npm run test:e2e"
npx playwright show-report
```

To intentionally replace baselines, use the repository's manual **Update screenshots** workflow, or run the emulator command with `npm run test:e2e:update` on the same macOS toolchain and review every image diff.
