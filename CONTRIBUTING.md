# Contributing - Gameland App

## Branch strategy
- `main`: production branch. No direct commits.
- `dev`: continuous integration branch.
- Task branches MUST start from `dev` and use format `dev-<task-slug>`.
  - Example: `dev-add-icon-player`

## Daily flow
1. Update local `dev`.
2. Create task branch from `dev`.
3. Implement task + tests.
4. Open PR from task branch to `dev`.
5. Merge to `dev` only after checks pass.

## Pull request rules (to `dev`)
- Tests related to the change are green.
- Contract/docs updated when integration changes.
- No direct push to `main`.
- PR checklist must be completed.

## Release flow (`dev` -> `main`)
1. Freeze `dev` for release candidate.
2. Validate smoke/regression suite.
3. Open PR `dev` -> `main`.
4. Merge and create tag `vX.Y.Z`.
5. Update changelog/release notes.
