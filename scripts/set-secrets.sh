#!/bin/bash
# Scripts to set GitHub Secrets from local .env values
# Usage: ./scripts/set-secrets.sh

if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    exit 1
fi

if [ -f .env ]; then
    echo "Loading secrets from .env..."
    # Export variables from .env
    set -a
    source .env
    set +a
else
    echo "Warning: .env file not found. Assuming variables are exported in shell."
fi

echo "Setting secrets for repo..."

# Helper function to set secret and warn if empty
set_secret() {
    local key="$1"
    local value="${!1}"
    
    if [ -z "$value" ]; then
        echo "Error: Secret $key is empty! Skipping."
    else
        echo "Setting $key..."
        gh secret set "$key" --body "$value"
    fi
}

set_secret "VITE_FIREBASE_API_KEY"
set_secret "VITE_FIREBASE_AUTH_DOMAIN"
set_secret "VITE_FIREBASE_PROJECT_ID"
set_secret "VITE_FIREBASE_STORAGE_BUCKET"
set_secret "VITE_FIREBASE_MESSAGING_SENDER_ID"
set_secret "VITE_FIREBASE_APP_ID"
set_secret "VITE_FIREBASE_DATABASE_URL"

echo "Done! Secrets updated."
