# gameland-app

## Flow Login Mock (FE)

Nuovo flusso di navigazione applicato:

`LOGIN -> SCELTA GIOCO -> TRESSETTE LOBBY`

Dettagli:

- Landing `/` redireziona a `/login`.
- Login mock richiede `username` (obbligatorio) e include campo password solo UI.
- Pulsanti social `Gmail`, `Facebook`, `Twitter` sono mock UI (nessuna OAuth reale).
- Submit login valido salva sessione mock locale e naviga a `/game-select`.
- Da `Scelta Gioco`, click su `Tressette` apre `/tressette-lobby`.

Protezione route minima (mock auth):

- Rotte protette: `/game-select`, `/tressette-lobby`, `/table3s74i/:tableId`, `/tressette4-inc`.
- Se non autenticato -> redirect a `/login`.

Storage sessione mock:

- Legacy key: `gameland.mockAuthSession.userId`
- Session key JSON: `gameland.mockAuthSession.session`

## Mock Auth Session (Tressette Lobby)

La lobby Tressette usa una sessione utente mock (nessun login reale server).

- Utenti disponibili: `Luca`, `Marta`, `Sofia`, `Paolo`
- Utente attivo visibile in UI: `Utente attivo: <username>`
- Cambio rapido utente (solo ambiente non-prod) dal pannello dev in lobby
- Persistenza utente attivo su localStorage (chiavi sopra)

## Data Mode globale (Demo | Live)

Lobby e Gameplay condividono un unico toggle dati globale:

- `Demo` (default al primo avvio)
- `Live`

Dettagli tecnici:

- Persistenza su `localStorage` chiave `gameland.dataMode`
- Ogni chiamata HTTP Tressette invia query param `mode=demo|live`
- La connessione socket invia il `mode` in query/auth e viene riconnessa al cambio mode
- Nessun uso di `/assets/mocks/...` per dati lobby/gameplay

## License

This project is licensed under a proprietary license. See the [LICENSE](./LICENSE) file for more details.

## Default player avatars

Per i giocatori umani senza avatar personale, il FE assegna un avatar placeholder deterministico usando lo username (hash % 20).

- Asset pack: src/assets/avatars/players/player-01.svg ... player-20.svg
- Manifest: src/assets/avatars/players/manifest.json
- Regola: stesso username -> stesso avatar default
- I bot continuano a usare solo assets/avatar-bot.svg con varianti colore esistenti (invariato)
