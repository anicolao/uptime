# Uptime

Uptime is a private, one-minute HTTP/HTTPS monitor. Signed-in users can view live service health, and administrators can add services and run an immediate check. There is no public status page.

The system consists of:

- a SvelteKit web application styled with component-scoped CSS;
- Firebase Authentication with Google sign-in;
- Firebase Realtime Database for events, services, current status, and 24 hours of detailed history;
- Firebase Functions for event projection, scheduled checks, protected manual checks, alert webhooks, and component provenance;
- Firebase Hosting for the web application and authenticated Function routes.

Every deploy publishes Hosting, Functions, and Realtime Database rules from one Git commit. The signed-in web UI displays the Git SHA for the web build, Functions build, and deployed database rules.

## Local development

Enter the reproducible development shell and install dependencies:

```sh
nix develop
npm ci
npm ci --prefix functions
npx playwright install chromium
```

Copy `.env.example` to `.env` and provide a Firebase web-app configuration. For emulator testing, the demo values in `.env.example` work without a live Firebase project.

Build and run the complete E2E suite:

```sh
npm run check
npm run build --prefix functions
npm run build
npx firebase emulators:exec --only auth,database,functions --project demo-antigravity-uptime "npm run test:e2e"
```

See [DEVELOPMENT.md](DEVELOPMENT.md), [E2E_GUIDE.md](E2E_GUIDE.md), and [MVP_DESIGN.md](MVP_DESIGN.md) for details.

## Production setup

The production GitHub environment needs the Firebase `VITE_FIREBASE_*` secrets listed in `.env.example` plus `GOOGLE_CREDENTIALS`, containing a Google service-account credential authorized to deploy Hosting, Functions, and Realtime Database rules. `ALERT_WEBHOOK_URL` is optional.

Firebase scheduled Functions require a billing-enabled project. The deploy workflow checks and builds both packages before deploying the complete system.

Enable Google as an Authentication provider once in the Firebase project. Provision administrators out of band through the Firebase console or Admin SDK by setting `admins/{firebaseAuthUid}` to `true`; database rules deliberately prevent users from granting that role to themselves.

## License

GPLv3.
