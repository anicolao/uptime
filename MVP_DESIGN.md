# MVP Design: 1-Minute Firebase Monitor

## Goal
Build a robust, cost-effective uptime monitor that checks services every **1 minute** using the **Firebase Free Tier** (Spark Plan).

## Architecture

1.  **Trigger**: Google Cloud Scheduler fires a Pub/Sub event every 1 minute.
2.  **Execution**: A Firebase Cloud Function (Gen 2 or Gen 1) receives the event.
    -   It fetches the list of services to monitor (from config or RTDB).
    -   It performs HTTP/HTTPS checks on all services in parallel.
    -   It writes the results (status, latency, timestamp) to Firebase Realtime Database (RTDB).
    -   It terminates immediately to minimize compute time.
3.  **Storage**: Firebase Realtime Database (RTDB).
    -   Used instead of Firestore to avoid daily write limits (50k/day).
    -   Stores current status for the dashboard.
    -   Stores historical data with a retention policy (e.g., maintain last 24h detailed, then aggregate).
4.  **Frontend**: SvelteKit App hosted on Firebase Hosting.
    -   Subscribes to RTDB for real-time status updates.
    -   Displays a dashboard of service health.

## Cost Analysis (Free Tier Limits)

| Resource | Limit (Spark) | Estimated Usage | Status |
| :--- | :--- | :--- | :--- |
| **Cloud Functions** | 2M invocations/mo | ~43.2k/mo (1/min) | ✅ **Safe** (~2%) |
| **Compute Time** | 400k GB-seconds/mo | ~10.8k GB-seconds | ✅ **Safe** (~2.7%) |
| **RTDB Storage** | 1 GB | ~5 MB/mo (with retention) | ✅ **Safe** |
| **RTDB Downloads** | 10 GB/mo | Approaches limit if many concurrent users | ⚠️ Monitor |

## Implementation Roadmap

### Phase 1: Project Setup (Current State)
- [x] Initialize SvelteKit app.
- [x] Configure Firebase project.
- [ ] Set up local emulators for Functions, RTDB, and Hosting.

### Phase 2: Backend (Cloud Functions)
- [ ] Initialize Cloud Functions: `firebase init functions`.
- [ ] Implement `checkServices` function:
    -   Trigger: `onSchedule("every 1 minutes")`.
    -   Logic: Parallel `fetch()` requests.
    -   Output: write to `status/{serviceId}` and `history/{serviceId}/{timestamp}`.
- [ ] Define service configuration (JSON or RTDB path).

### Phase 3: Database (RTDB)
- [ ] define Data Structure:
    ```json
    {
      "services": {
        "google": { "url": "https://google.com", "name": "Google" }
      },
      "status": {
        "google": { "up": true, "latency": 120, "lastChecked": 1670000000000 }
      },
      "history": {
        "google": {
          "1670000000000": { "up": true, "latency": 120 }
        }
      }
    }
    ```
- [ ] Set up Security Rules (Read: Public/Auth, Write: Admin only).

### Phase 4: Frontend (Dashboard)
- [ ] Create `Monitor` component.
- [ ] Connect to RTDB using `firebase/database`.
- [ ] Visualize real-time status.

### Phase 5: Deployment & Verification
- [ ] Deploy to Firebase: `firebase deploy`.
- [ ] Verify 1-minute execution interval in GCP Console.
- [ ] Verify free tier usage quotas.
