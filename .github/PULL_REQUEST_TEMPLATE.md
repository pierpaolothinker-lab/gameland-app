## Summary
- [ ] Scope is clear and limited to one task.
- [ ] Branch name follows `codex/dev-<task-slug>`.
- [ ] Target branch is `dev` (not `main`).
- [ ] No unrelated feature code changes included.

## Validation Evidence
- [ ] Build passes (`npm run build -- --configuration development` for FE, `npm run build` for BE).
- [ ] Relevant tests pass (list exact commands + outcome in PR body).
- [ ] Manual verification completed when UI/API behavior changed.

## Contract & Docs
- [ ] `../gameland-server/docs/api-contract.md` checked/updated if integration behavior changed.
- [ ] If touched, `docs/project-memory/*` and `scripts/project-management/examples/payload.current.json` are committed (or explicitly marked out-of-scope).
- [ ] Risks/residual blockers are documented.

## Governance & Risk Check
- [ ] No direct push/merge to `dev` or `main`.
- [ ] Required GitHub checks are green.
- [ ] Rollback strategy is clear.
- [ ] Post-merge cleanup planned (delete feature branch local + remote).
