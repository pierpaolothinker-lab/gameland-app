# Gameland Logo Design System

## Objective

Create a cleaner and more scalable identity for Gameland than the current illustrative crest. The new system is meant for app surfaces first: login, splash, headers, profile/app icon contexts and future store or promo exports.

## Current baseline analysis

The current visual baseline uses two different logo behaviors:

- src/assets/logoGL.png: rich crest-style emblem with cards, horses and many decorative details.
- src/assets/icon/favicon.png: generic circular favicon, not recognizable as Gameland.

That combination is expressive but not strong enough in small mobile contexts. The new system simplifies the brand around one compact symbol and one consistent wordmark.

## Concept

The new Gameland mark combines three ideas in one compact shape:

- G ring: immediate brand initial and motion cue.
- central diamond with play cut: table/card token + action.
- four nodes: social play around the table.

This keeps the logo game-related without relying on obvious card-suit clipart.

## Asset inventory

Core files live in src/assets/branding/:

- gameland-mark-dark.svg
- gameland-mark-light.svg
- gameland-mark-mono.svg
- gameland-wordmark-dark.svg
- gameland-wordmark-light.svg
- gameland-wordmark-mono.svg
- gameland-logo-primary-dark.svg
- gameland-logo-primary-light.svg
- gameland-logo-primary-mono.svg
- gameland-logo-horizontal-dark.svg
- gameland-logo-horizontal-light.svg
- gameland-logo-horizontal-mono.svg
- gameland-preview-board.svg
- manifest.json

## Usage guidance

### Preferred use

- Use logo-horizontal-* for app headers, marketing strips and navigation areas.
- Use logo-primary-* for splash, onboarding, auth hero and promotional covers.
- Use mark-* for launcher/app icon studies, profile placeholders, compact badges and tight mobile UI.
- Use wordmark-* only when the symbol is already present nearby or when a narrow horizontal surface needs text only.

### Clear space

Define x as the diameter of one player node in the mark.

- Mark clear space: minimum 1x on all sides.
- Horizontal lockup clear space: minimum 1.5x around the full lockup.
- Primary stacked logo clear space: minimum 1.5x around the full lockup.

### Minimum digital size

- Mark: 24 px minimum, 32 px preferred in app UI.
- Horizontal logo: 160 px minimum width.
- Primary stacked logo: 120 px minimum width.
- Wordmark-only: 132 px minimum width.

### Surface rules

- dark assets: for white, cream, pale neutral or lightly textured surfaces.
- light assets: for dark blue, night, navy or photo/video surfaces.
- mono assets: for emboss, print, watermark or single-ink situations.

### Color system

- Night navy: #081827
- Deep slate blue: #12324C
- Brand cyan: #7DE2FF
- Soft cyan: #DDF5FF
- Accent gold: #FFBF5E
- Light surface white: #F5FAFF
- Night support blue: #10293E

## Pairing rules

- Keep the mark to the left of the wordmark in horizontal lockups.
- Do not shrink the mark below the cap height of the wordmark when used in lockup.
- Do not separate the mark and wordmark with extra decorative shapes.
- If the symbol is already present in a nearby UI element, prefer the wordmark-only asset instead of duplicating the symbol.

## What to avoid

- No heavy drop shadows.
- No old-style bevel or metallic effects.
- No use of card suits as standalone brand icon.
- Do not stretch the mark into a rectangle.
- Do not place the dark asset over night blue surfaces.

## FE handoff notes

- The new system is isolated and app-safe under src/assets/branding/.
- manifest.json can be used later for a brand picker/debug board if needed.
- The existing logoGL.png can remain as legacy reference, but it should not be treated as the core logo anymore.
- For browser/app metadata, the svg mark can already be used as favicon.
- If future marketing exports require outline-safe typography, convert the wordmark text to outlined vectors before print delivery.

## QA checklist

- Check the mark at 24, 32, 40, 64, 96 px.
- Verify the light assets on dark blue/night surfaces.
- Verify the dark assets on white and pale neutral surfaces.
- Verify the mono assets in a single flat color.
- Confirm recognizability without relying on the wordmark.