# Design Alternatives

This document outlines two potential architectures for building the uptime monitoring tool. Both approaches prioritize staying within free tiers and meeting the requirement of alerting within the hour.

## Option 1: Firebase Serverless (Recommended by User)

This approach leverages Google's Firebase platform for a scalable, serverless architecture.

### Architecture
1.  **Scheduling**: Google Cloud Scheduler triggers a Firebase Cloud Function every N minutes (e.g., every 15 or 30 minutes).
2.  **Monitoring**: The Cloud Function performs HTTP requests to the target services.
3.  **Storage**: Results (status, response time, timestamp) are stored in Cloud Firestore.
4.  **Dashboard**: A static web app (hosted on GitHub Pages or Firebase Hosting) fetches data from Firestore to display current status and history.
5.  **Notifications**: The Cloud Function analyzes the results. If a service is down (or was down and is now up), it triggers a notification via a service like SendGrid (email), Slack/Discord Webhooks, or Firebase Cloud Messaging (push notifications).

### Pros
-   **Real-time Database**: Firestore allows for real-time updates on the dashboard if needed.
-   **Scalability**: Handles growth well if you add many services.
-   **Separation of Concerns**: Logic, storage, and presentation are clearly separated.

### Cons
-   **Setup Complexity**: Requires setting up a Firebase project, billing account (even for free tier in some cases for Cloud Functions), and configuring multiple services.
-   **Cost Risk**: While generous, the free tier limits (Spark plan) for Cloud Functions have changed (requires Blaze plan usually, though free tier usage is deducted). *Note: Cloud Functions for Firebase requires the Blaze (pay-as-you-go) plan, though the first 2M invocations are free. This might technically require a credit card even if no money is charged.*

## Option 2: GitHub Actions "Flat" Monitor

This approach uses GitHub's infrastructure entirely, treating the repository as both the runner and the database (via "Git scraping" or Flat Data pattern).

### Architecture
1.  **Scheduling**: A GitHub Actions workflow uses a `cron` schedule to run every N minutes (e.g., `*/30 * * * *`).
2.  **Monitoring**: The workflow runs a script (Python/Node.js) that checks the services.
3.  **Storage**: The script saves the results to a JSON or CSV file and commits it back to the repository. Alternatively, it can just generate a static HTML file directly.
4.  **Dashboard**: GitHub Pages serves the static HTML/JSON from the repository. The dashboard reads the committed history file.
5.  **Notifications**: The workflow step checks for failure conditions. If a check fails, the workflow sends a notification (Email via standard URL, Slack/Discord Webhook stored in Repo Secrets).

### Pros
-   **Completely Free**: GitHub Actions and Pages are free for public repositories (and generous limits for private).
-   **No External Cloud Service**: No need to manage AWS/GCP accounts or billing alerts.
-   **Version Controlled History**: Your uptime history is just a git history of a data file.
-   **Simple Maintenance**: Everything lives in one repository.

### Cons
-   **Public Data**: If the repo is public (for Pages), the history is public.
-   **Granularity**: GitHub Actions cron is not guaranteed to creating exactly on the minute (can be delayed), but fits the "within the hour" requirement perfectly.
-   **Repo Growth**: Frequent commits can make the repo large over years (mitigated by squashing or using a separate orphan branch for data).

## Recommendation

For a strictly "free tier" goal with minimal maintenance, **Option 2 (GitHub Actions)** is often superior for personal projects because it avoids the need for a credit card entry or managing cloud quotas.

However, **Option 1 (Firebase)** provides a more robust "application" feel and is better if you plan to expand features significantly (e.g., user authentication, complex historical querying).

The `README.md` in this repository will prioritize the **Option 1 (Firebase)** structure as requested, but the code structure can support swapping the "runner" (Trigger) if needed.
