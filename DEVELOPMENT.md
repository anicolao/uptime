# Development guide

## Toolchain

The Nix development shell supplies Node.js 22, JDK 21, Google Cloud SDK, and Git:

```sh
nix develop
```

Install both dependency trees and Playwright Chromium:

```sh
npm ci
npm ci --prefix functions
npx playwright install chromium
```

## Configuration

Copy `.env.example` to `.env`. Vite reads the `VITE_*` values during the web build. Production values are GitHub environment secrets and are never committed.

Functions provenance parameters are populated by CI. For local work, optional `functions/.env.local` values are:

```dotenv
BUILD_GIT_SHA=development
DATABASE_RULES_GIT_SHA=development
ALERT_WEBHOOK_URL=
```

## Checks

Run static checks and production builds:

```sh
npm run check
npm run build --prefix functions
npm run build
```

Run all integration and exact screenshot tests with Auth, Realtime Database, and Functions emulators:

```sh
npx firebase emulators:exec --only auth,database,functions --project demo-antigravity-uptime "npm run test:e2e"
```

Regenerate visual baselines only after intentionally reviewing a UI change:

```sh
npx firebase emulators:exec --only auth,database,functions --project demo-antigravity-uptime "npm run test:e2e:update"
```

The test configuration permits zero different pixels. CI runs on macOS with the same browser and rendering flags used to create committed baselines.
