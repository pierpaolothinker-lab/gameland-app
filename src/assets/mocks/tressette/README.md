# Tressette UI mocks

Mock data for frontend visual pages and flows.

## Files
- `tables.list.json`: response for `GET /api/tressette/tables`.
- `table.waiting.json`: table detail for waiting state.
- `table.in_game.json`: table detail for in-game state.
- `table.ended.json`: table detail for ended state.
- `api-errors.json`: HTTP error payload examples.
- `socket-events.json`: Socket.IO event payload examples.

## Suggested page mapping
- Lobby list page: `tables.list.json`
- Table waiting room page: `table.waiting.json`
- Match page: `table.in_game.json`
- Match summary/history page: `table.ended.json`
- Error banners/modals: `api-errors.json`
- Realtime UI updates: `socket-events.json`

## Quick usage example (TypeScript)
```ts
import tables from './docs/mocks/tressette/tables.list.json';
import tableInGame from './docs/mocks/tressette/table.in_game.json';

const lobbyTables = tables;
const currentTable = tableInGame;
```
