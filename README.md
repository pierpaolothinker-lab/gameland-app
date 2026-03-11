# gameland-app

## Flow Login Mock (FE)

Nuovo flusso di navigazione applicato:

`LOGIN -> SCELTA GIOCO -> TRESSETTE LOBBY`

Dettagli:

- Landing `/` redireziona a `/login`.
- Login mock richiede `username` (obbligatorio) e include campo password solo UI.
- Pulsanti social `Gmail`, `Facebook`, `Twitter` sono mock UI (nessuna OAuth reale).
- Submit login valido chiama `authSessionService.login(username, password?)`, salva la sessione mock su localStorage e naviga a `/game-select`.
- Da `Scelta Gioco`, click su `Tressette` apre `/tressette-lobby`.
- Pulsante `Esci` in `Scelta Gioco` chiama sempre `authSessionService.logout()` e forza redirect a `/login`.

Protezione route minima (mock auth):

- Rotte protette: `/game-select`, `/tressette-lobby`, `/table3s74i/:tableId`, `/tressette4-inc`.
- Il guard usa `authSessionService.isAuthenticated()`.
- Se non autenticato -> redirect a `/login`.

Storage sessione mock (source-of-truth):

- Session key JSON corrente: `gameland.mockAuthSession.session`
- Compatibilita legacy lettura/scrittura: `gameland.mockAuthSession.userId`, `gameland.mockAuthSession.username`
- `logout()` rimuove deterministicamente tutte le chiavi sessione mock sopra.

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

Per i giocatori umani senza avatar personale, il FE assegna un avatar placeholder deterministico usando lo username (hash % 40).

- Asset pack: 20 umani (`src/assets/avatars/players/player-01.svg` ... `player-20.svg`) + 20 animali (`src/assets/avatars/players/animals/animal-01.svg` ... `animal-20.svg`)
- Manifest unificato (40 avatar): `src/assets/avatars/players/manifest.json`
- Regola: stesso username -> stesso avatar default
- I bot continuano a usare solo assets/avatar-bot.svg con varianti colore esistenti (invariato)


## Mobile Navigation Shell (FE)

Nuova shell ibrida mobile-first per le schermate non-gameplay.

- Tab bar primaria globale: Lobby, Giochi, Chat, Profilo
- Menu utility in alto a destra con placeholder eleganti per Impostazioni, Notifiche, Regole, Supporto
- Entry Debug avatars disponibile solo in ambiente dev quando coerente col contesto
- Gameplay Tressette fuori dalla shell globale: niente tab bar persistente, ma Chat rapida e menu contestuale tavolo dedicato
- Palette coerente con il visual language attuale: shell blu notte, feltro verde in gameplay, accenti oro per stati attivi e CTA
## Brand Logo System

Nuovo sistema logo Gameland disponibile in `src/assets/branding/`.

- Varianti incluse: `mark`, `wordmark`, `logo-primary`, `logo-horizontal`
- Varianti colore: `dark`, `light`, `mono`
- Guida d'uso e rationale: `docs/BRAND_LOGO_SYSTEM.md`
- Manifest asset: `src/assets/branding/manifest.json`
- Preview board: `src/assets/branding/gameland-preview-board.svg`

Note:

- `src/assets/logoGL.png` resta solo come crest legacy di riferimento
- il nuovo mark SVG e` gia` pronto per metadata/browser icon senza toccare shell o routing