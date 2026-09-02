# Private one-minute uptime monitor

## Summary

- Implements the complete event-sourced monitor with Firebase Functions v2 and Realtime Database.
- Makes the whole web application private and enforces authenticated/admin access in database rules and HTTP endpoints.
- Uses Svelte component-scoped CSS with no Tailwind dependency.
- Deploys Hosting, Functions, and database rules together from one commit.
- Displays web, Functions, and database-rules Git SHAs in the authenticated UI.
- Enforces exact, zero-different-pixel Playwright baselines and tests the real emulator workflow.
- Updates the runtime/toolchain to Node.js 22 and current Firebase/Svelte dependencies.
- Removes obsolete public-status, Firestore, GitHub Pages, and Spark-plan documentation.

## Verification

- `npm run check`
- `npm run build --prefix functions`
- `npm run build`
- Firebase Auth/RTDB/Functions emulator suite, including authorization rules and exact screenshot comparisons

## Original user prompt

> OK we have a basic project scaffold and a design where we will update the metrics every minute using the free tier of firebase. Examine the implementation here and all the design files, with an eye towards cleaning up any construction dust/cruft — we considered multiple design alternatives, but now that we've settled on an approach I want everything in the repository to reflect only the approach we are on. *Delete* old ideas and documents, make the current documentation into a coherent description of what we're building. Create an MVP_DESIGN.md that outlines the steps required to go from teh current scaffold to a fully working basic implementation of the 1MIN design. Follow WORKFLOW.md to put up these changse as a new PR for review.

## Latest user direction

> Let's fix all issues on PR6. ZERO PIXEL TOLERANCE is absolutely REQUIRED. Tailwind is not intended, we should use svelte-scoped CSS and if useful we can use sveltekit. there is no public status page, this is a private uptime tool; every page requries auth. github workflows should deploy the entire system, not portions, and every piece of the system shoudl be able to report the git hash it was built from, and this should be displayed somewhere in the web UI for all components. Let's update the PR to get it into a mergable state.
