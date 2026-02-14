# Cleanup and Standardize on 1-Minute Firebase Design

## Goal
To clean up the repository by removing obsolete design alternatives and consolidating documentation into a single relevant design document (`MVP_DESIGN.md`) that reflects the chosen 1-Minute Firebase Monitor architecture.

## Changes
- **Deleted**: `DESIGN_ALTERNATIVES.md` (Obsolete options).
- **Deleted**: `DESIGN_FIREBASE_1MIN.md` (Content migrated to `MVP_DESIGN.md`).
- **Created**: `MVP_DESIGN.md` as the single source of truth for the design and implementation steps.
- **Updated**: `README.md` to point to the new design document and remove confusing alternatives.

## Original User Prompt
> OK we have a basic project scaffold and a design where we will update the metrics every minute using the free tier of firebase. Examine the implementation here and all the design files, with an eye towards cleaning up any construction dust/cruft — we considered multiple design alternatives, but now that we've settled on an approach I want everything in the repository to reflect only the approach we are on. *Delete* old ideas and documents, make the current documentation into a coherent description of what we're building. Create an MVP_DESIGN.md that outlines the steps required to go from teh current scaffold to a fully working basic implementation of the 1MIN design. Follow WORKFLOW.md to put up these changse as a new PR for review.
