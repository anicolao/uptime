# Design: High-Frequency Firebase Monitor

This document details the design for a "Real-Time" uptime monitor that checks services every **5 seconds**, utilizing the Firebase Free Tier.

## Core Constraint Checklist

| Constraint | Limit | Usage Strategy | Status |
| :--- | :--- | :--- | :--- |
| **Invocations** | 2,000,000 / month | Use "batch" execution (1 invoke = 1 minute of checks) | ✅ Safe (43k/mo) |
| **Compute Time** | 400,000 GB-seconds | Use 128MB RAM instance running continuously | ⚠️ Tight |
| **Database Writes** | Firestore: 50k/day | **Switch to Realtime Database (RTDB)** (unlimited writes, limited bandwidth) | ✅ Safe |

## Architecture

1.  **Trigger**: Cloud Scheduler fires **every 1 minute**.
2.  **Execution (Cloud Function)**:
    -   The function starts and enters a loop.
    -   It performs a check immediately.
    -   It schedules the next check in 5 seconds (`setTimeout`).
    -   It repeats this ~12 times (covering the 60-second window).
    -   **Crucial**: The function must finish before the next scheduler trigger (or handle overlap gracefully) and strictly respect the 60s timeout (default) or set slightly higher (e.g., 540s) but manage exit carefully.
3.  **Storage (Realtime Database)**:
    -   Each check writes the status to specific paths in RTDB (e.g., `status/<service_id>`).
    -   Historical data can be pushed to a list or aggregated.
    -   RTDB is chosen because Firestore would cost $(17k \times N_{services})$ writes/day, which exceeds the 50k free limit if you monitor >2 services. RTDB allows massive write frequency within the 1GB storage/10GB bandwidth limits.

## Cost Analysis (The Math)

### 1. Cloud Functions (Compute)
We invoke 1 function every minute to cover the whole month.
*   **Total Minutes/Month**: $30 \times 24 \times 60 = 43,200$ minutes.
*   **Invocations**: 43,200 (limit 2,000,000). **Safe**.

**Resource Consumption**:
*   **Duration**: 60 seconds per invocation (to keep checking every 5s).
*   **Memory**: 128 MB ($0.125$ GB).
*   **GB-Seconds**: $43,200 \text{ inv} \times 60 \text{ sec} \times 0.125 \text{ GB} = 324,000 \text{ GB-seconds}$.
*   **Free Tier Limit**: 400,000 GB-seconds.
*   **Usage**: $81\%$ of Free Tier. **Safe**.

**CPU-Seconds**:
*   *Note: Gen 1 Cloud Functions meter GHz-seconds. Gen 2 (Cloud Run) meters vCPU-seconds.*
*   If we use **Gen 1** at 128MB:
    *   Historically billed at 200MHz ($0.2$ GHz).
    *   $43,200 \times 60 \times 0.2 = 518,400 \text{ GHz-seconds}$.
    *   **Free Limit**: 200,000 GHz-seconds.
    *   ❌ **Exceeds Free Tier** (by 2.5x).

**Mitigation Strategy for Free Tier**:
To stay essentially free, we must reduce the "Active Wall Clock" usage or the frequency.
1.  **Reduce Frequency**: Check every **15 seconds** (4 checks/min).
    *   Function sleeps most of the time? No, Gen 1 bills for elapsed wall time.
    *   We cannot "sleep for free".
2.  **External Cron Strategy**:
    *   If we rely purely on invocations (no checking loop), we need an external trigger every 5s. Cloud Scheduler is 1-min min.
    *   We could use an external free cron service to hit an HTTP function every 5s? Risk of reliability.
3.  **Acceptable "Almost" Free**:
    *   The overage is ~300k GHz-seconds.
    *   Cost: ~$0.0000025/GHz-sec (approx). 300,000 * 2.5e-6 = $0.75 / month.
    *   **Verdict**: Technically not $0.00, but < $1.00.

### 2. Realtime Database
*   **Writes**: Unlimited count.
*   **Storage**: 1 GB. If we store `timestamp, status, latency` (approx 50 bytes) every 5s:
    *   $50 \text{ bytes} \times 12/min \times 60 \times 24 = 864 \text{ KB/day}$.
    *   $26 \text{ MB/month}$ per service.
    *   Limit: 1 GB.
    *   **Safe** for ~30 services with retention rotation (deleting old data).
*   **Bandwidth**: 10 GB/month. Reading/Writing tiny JSON packets is negligible.

## Configuration Proposed

To ensure we are strictly $0.00 if possible, or very low cost:
*   **Database**: Firebase Realtime Database.
*   **Function**: Node.js Gen 1, 128MB RAM.
*   **Frequency**: **10-15 seconds** (compromise) OR **5 seconds** (accepting ~$1/mo cost).

*Draft Note*: I will proceed assuming the user wants the 5s design documented as the "High Performance" option, with the cost warning clearly stated.

## Implementation Steps
1.  Set up Firebase Project.
2.  Enable Realtime Database.
3.  Deploy `checkUptime` function (Gen 1) with `schedule('every 1 minutes')`.
4.  Function logic: `async` loop with `await new Promise(r => setTimeout(r, 5000))` inside.
