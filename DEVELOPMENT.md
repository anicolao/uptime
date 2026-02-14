# Development Guide

## Environment Setup

This project uses [Nix](https://nixos.org/) to manage development dependencies, ensuring a consistent environment for all contributors.

### Prerequisites

1.  **Install Nix**:
    Follow the instructions at [nixos.org/download](https://nixos.org/download.html).

2.  **Enable Flakes**:
    Ensure your `~/.config/nix/nix.conf` or `/etc/nix/nix.conf` contains:
    ```
    experimental-features = nix-command flakes
    ```

3.  **Enter the Environment**:
    Run the following command in the project root:
    ```bash
    nix develop
    ```
    This will drop you into a shell with all necessary tools installed, including:
    - Node.js 20
    - Java (JDK 21) for Firebase Emulators
    - Google Cloud SDK
    - Git

### Running Tests

Once inside the `nix develop` shell, you can run the full suite of tests, including those requiring emulators:

```bash
# Run all E2E tests
npm run test:e2e

# Update snapshots
npx playwright test --update-snapshots
```
