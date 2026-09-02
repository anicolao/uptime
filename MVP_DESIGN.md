# MVP design: private one-minute Firebase monitor

## Product boundary

Uptime is an internal tool. Every application route and every database read requires Firebase Authentication. The administrator surface and all event writes additionally require an administrator record at `admins/{uid}: true`. There is no public status page.

## Architecture

1. The SvelteKit static client is hosted by Firebase Hosting. Svelte components own their scoped CSS; Tailwind is not part of the stack.
2. Firebase Authentication provides Google sign-in. The root Svelte layout renders route content only for an authenticated user.
3. Administrators append validated `ADD_SERVICE`, `UPDATE_SERVICE`, and `REMOVE_SERVICE` events to Realtime Database.
4. A database-triggered Function validates each event again and maintains the `services` projection.
5. A scheduled Function runs every minute. It checks all services concurrently with a ten-second request timeout, stores current state under `status`, and retains detailed `history` for 24 hours.
6. A database lock prevents overlapping checks. An authenticated administrator-only endpoint can request an immediate check.
7. An optional webhook receives initial-down and subsequent state-transition alerts.
8. The authenticated UI reports the exact web, Functions, and database-rules Git SHAs deployed together.

## Data ownership

| Path | Authenticated read | Client write | Server write |
| --- | --- | --- | --- |
| `events` | administrators only | administrators, append-only and validated | no |
| `services` | yes | no | event projector |
| `status` | yes | no | monitor |
| `history` | yes | no | monitor |
| `admins/{uid}` | own record only | no | provisioning only |
| `system` | yes | no | monitor |

The Functions Admin SDK is trusted to update projections and results. Rules deny every unspecified path.

## Deployment and provenance

The production workflow checks the Svelte and TypeScript projects, builds both packages, authenticates to Google Cloud, and performs one Firebase CLI deployment containing Hosting, Functions, and Realtime Database rules. It injects the workflow commit as:

- `VITE_GIT_SHA` in the web bundle;
- `BUILD_GIT_SHA` in Functions configuration;
- `DATABASE_RULES_GIT_SHA` in Functions configuration for the rules deployed by that same command.

The private footer combines the web value with the protected `/api/version` response.

Scheduled Functions require a billing-enabled Firebase project. Runtime usage and webhook-provider costs must be monitored against the project's actual plan rather than assuming Spark-plan availability.

## Verification

- Svelte and TypeScript checks must have no errors or warnings.
- Both production builds must succeed on Node.js 22.
- Security-rule tests prove anonymous reads fail and only administrators append events.
- Emulator E2E proves an admin event reaches the trigger, a protected check runs, and status appears in the private dashboard.
- Screenshot comparisons require exactly zero different pixels.
