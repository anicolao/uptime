# Cloud Uptime Monitor

A lightweight, cost-effective cloud monitoring tool designed to check the uptime of networks and services.

## Overview

This project provides a serverless monitoring solution that checks your defined services at regular intervals (e.g., every 15 minutes) and alerts you within the hour if a service goes down.

It is designed to stay within the free tiers of modern cloud providers, utilizing:
*   **Firebase Cloud Functions** (or GitHub Actions) for periodic checking.
*   **Cloud Firestore** for storing uptime history.
*   **GitHub Pages** (or Firebase Hosting) for a public status dashboard.

## Features

-   **Periodic Monitoring**: Checks HTTP/HTTPS endpoints on a schedule.
-   **Alerting**: Sends notifications (Email, Slack, Discord) upon failure.
-   **Dashboard**: Displays current status and historical uptime data.
-   **Cost-Efficient**: Architected to run within free usage limits.

## Getting Started

### Prerequisites

-   A Firebase Project (if using the Firebase architecture).
-   Node.js installed locally for deployment.
-   GitHub account for hosting the dashboard.

### Installation

*Note: Detailed installation instructions will be added as the implementation is finalized.*

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/uptime.git
    cd uptime
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure your services list in `config.json` (to be created).

## Architecture

See [MVP_DESIGN.md](MVP_DESIGN.md) for the detailed design and implementation steps.

## License

This project is licensed under the GPLv3 License.
