#!/bin/bash
# Scripts to set GitHub Secrets from local .env values
# Usage: ./scripts/set-secrets.sh

if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    exit 1
fi

if [ -f .env ]; then
    echo "Loading secrets from .env..."
    export $(cat .env | xargs)
else
    echo "Warning: .env file not found. Assuming variables are exported in shell."
fi

echo "Setting secrets for repo..."

# Set secrets explicitly to avoid leaking everything in .env
gh secret set VITE_FIREBASE_API_KEY --body "$VITE_FIREBASE_API_KEY"
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "$VITE_FIREBASE_AUTH_DOMAIN"
gh secret set VITE_FIREBASE_PROJECT_ID --body "$VITE_FIREBASE_PROJECT_ID"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "$VITE_FIREBASE_STORAGE_BUCKET"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "$VITE_FIREBASE_MESSAGING_SENDER_ID"
gh secret set VITE_FIREBASE_APP_ID --body "$VITE_FIREBASE_APP_ID"
gh secret set VITE_FIREBASE_DATABASE_URL --body "$VITE_FIREBASE_DATABASE_URL"

echo "Done! Secrets updated."
