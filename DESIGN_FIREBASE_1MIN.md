# Design: 1-Minute Firebase Monitor

This document details the design for a robust uptime monitor that checks services every **1 minute**, utilizing the Firebase Free Tier. This offers a high-frequency check (compared to the original hourly goal) while remaining safely within "Spark Plan" limits.

## Core Constraint Checklist

| Constraint | Limit | Usage Strategy | Status |
| :--- | :--- | :--- | :--- |
| **Invocations** | 2,000,000 / month | 1 trigger/min = 43,200/mo | ✅ **Ultra Safe** (2% of limit) |
| **Compute Time** | 400,000 GB-seconds | 128MB RAM, ~2s duration | ✅ **Ultra Safe** (< 1% of limit) |
| **Database Writes** | Firestore: 50k/day | **Use Realtime Database (RTDB)** for efficiency | ✅ Safe |

## Architecture

1.  **Trigger**: Cloud Scheduler fires **every 1 minute**.
2.  **Execution (Cloud Function)**:
    -   The function starts.
    -   It performs HTTP checks on all defined services *in parallel*.
    -   It writes the results to Realtime Database.
    -   It terminates immediately (expected runtime < 2 seconds).
3.  **Storage (Realtime Database)**:
    -   Stores current status in `status/<service_id>` for the dashboard.
    -   Appends to `history/<service_id>` (optional, with rotation policy).
    -   Using RTDB avoids the "50k daily writes" limit of Firestore, allowing us to scale to tracking hundreds of services if needed without cost.

## Cost Analysis

### 1. Cloud Functions (Compute)
*   **Invocations**: $60 \times 24 \times 30 = 43,200$ invocations/month.
    *   Limit: 2,000,000.
    *   **Usage**: ~2.1%.

*   **GB-Seconds**:
    *   Assumed duration: 2 seconds (network I/O bound, but fast).
    *   Memory: 128 MB.
    *   $43,200 \times 2 \times 0.125 = 10,800 \text{ GB-seconds}$.
    *   Limit: 400,000.
    *   **Usage**: ~2.7%.

*   **CPU-Seconds (Gen 1)**:
    *   $43,200 \times 2 \times 0.2 \text{ GHz} = 17,280 \text{ GHz-seconds}$.
    *   Limit: 200,000.
    *   **Usage**: ~8.6%.

**Verdict**: This architecture is **extremely safe** within the free tier. You could practically run this for free forever.

### 2. Realtime Database
*   **Storage**: 1 GB Free.
    *   Data per check: ~100 bytes.
    *   Growth: $43,200 \times 100 \text{ bytes} \approx 4.3 \text{ MB/month}$ per service.
    *   Action: Implement a retention policy (e.g., keep history for 30 days) to stay well under 1GB.

## Comparison to 5s Loop
The previous 5s design required keeping the function "warm" and looping, eating up CPU time and risking costs. This 1-minute design is standard event-driven architecture and incurs minimal risk.
