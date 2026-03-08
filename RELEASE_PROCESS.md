# Release Process

## Goal
Update `main` only for production-ready increments.

## Steps
1. Ensure `dev` is stable and all mandatory checks pass.
2. Open PR from `dev` to `main`.
3. Perform final review (scope, tests, contract/docs).
4. Merge PR.
5. Tag release (`vX.Y.Z`) and publish release notes.

## Rules
- No direct commits/pushes to `main`.
- Hotfixes follow the same PR flow.
