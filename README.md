# gameland-app

## Mock Auth Session (Tressette Lobby)

La lobby Tressette usa una sessione utente mock (nessun login reale).

- Utenti disponibili: `Luca`, `Marta`, `Sofia`, `Paolo`
- Utente attivo visibile in UI: `Utente attivo: <username>`
- Cambio rapido utente (solo ambiente non-prod) dal pannello dev in lobby
- Persistenza utente attivo su `localStorage` con chiave:
  `gameland.mockAuthSession.userId`

### Toggle dati mock lobby

- `?mock=1` attiva dati mock
- `?mock=0` disattiva dati mock (usa backend reale)

Esempio:
`http://localhost:4400/tressette-lobby?mock=1`

## License

This project is licensed under a proprietary license. See the [LICENSE](./LICENSE) file for more details.
