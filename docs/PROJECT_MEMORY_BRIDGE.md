# Project Memory Bridge (App -> Server)

This repository uses a centralized project memory hub in:
- `C:\Users\ingpi\Documents\code\gameland-server\docs\project-memory`

## Why this bridge exists
To avoid divergence between FE/BE strategic notes and keep one canonical memory source.

## Read order
1. `journal.md`
2. `implementation-log.md`
3. `decisions.md`
4. `roadmap-status.md`
5. `HIGH_LEVEL_PLAYBOOK.md`
6. `TECHNICAL_MANUAL.md`

## Operational rule
When app implementation changes integration behavior:
- update app PR notes,
- ensure `api-contract.md` is aligned in server repo,
- append relevant memory entries in the central hub.
