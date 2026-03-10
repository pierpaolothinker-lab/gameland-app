# gameland-app

## Mock Auth Session (Tressette Lobby)

La lobby Tressette usa una sessione utente mock (nessun login reale).

- Utenti disponibili: `Luca`, `Marta`, `Sofia`, `Paolo`
- Utente attivo visibile in UI: `Utente attivo: <username>`
- Cambio rapido utente (solo ambiente non-prod) dal pannello dev in lobby
- Persistenza utente attivo su `localStorage` con chiave:
  `gameland.mockAuthSession.userId`

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

