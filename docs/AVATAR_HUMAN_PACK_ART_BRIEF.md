# Avatar Human Pack Art Brief

## Purpose

This brief defines the next human avatar pack for Gameland.

Goal:
- make all 20 human avatars much easier to tell apart at a glance
- preserve a friendly, clean, readable visual language
- optimize first for mobile circular crops and seat-card scale

This is a design brief, not an FE implementation spec.

## Why The Current Pack Feels Too Uniform

The current human set reads as one shared template with mostly color swaps.
What is missing:
- stronger face silhouettes
- more obvious accessory families
- more variation in hair mass and head contour
- more contrast between "who this character is" and "what color the shirt is"

## Creative Direction

Style goals:
- friendly and playful, not realistic
- clean vector shapes
- readable at 32-40 px inside a circle
- inclusive and varied without offensive exaggeration
- visually coherent as one family

Visual tone:
- soft geometry
- simplified anatomy
- confident silhouettes
- low clutter
- strong primary markers

Avoid:
- tiny details that only work at full size
- identity based only on hair color
- overly detailed noses, mouths, eyelashes, jewelry
- jokes, stereotypes, or exaggerated cultural cues

## Design Principles

Each avatar should have:
- 1 primary marker visible in silhouette
- 1 secondary marker visible on the face
- 1 support detail that helps memorability

Primary markers:
- large glasses
- headset or over-ear headphones
- beanie, cap, visor, beret, hood
- afro, twin buns, pompadour, flat top, buzz cut
- strong beard shape

Secondary markers:
- face shape
- eyebrow style
- nose size/shape
- beard or mustache
- hairline/fringe shape

Support details:
- freckles
- beauty mark
- eyebrow slit
- small earring
- hair clip

Readability rules:
- no avatar should rely on more than 3 signals
- every avatar must still read if the support detail disappears
- the primary marker should remain visible in a circular crop
- only use fine details when they sit close to the eyes or hairline

## Mobile Crop Rules

Production assumptions:
- source canvas: 128x128 SVG
- primary usage: circular crop
- critical readability size: 32 px, 40 px, 56 px

Safe composition:
- face occupies more area than in the current pack
- eyes sit slightly above center
- hair/accessory can touch the crop edge
- shoulders and chest should be reduced in visual priority

Line and shape guidance:
- keep silhouette edges broad and clean
- avoid thin outlines under 2 px at source size
- avoid isolated micro-shapes
- favor chunky, closed forms over decorative lines

## Palette Guidance

Skin:
- use 5-6 skin groups across the pack
- distribute tones evenly; do not cluster accessories by skin tone

Eyes:
- use a limited set that still reads: dark brown, hazel, amber, green, blue-gray

Hair:
- use varied shapes first, colors second
- keep colors grounded: black, dark brown, warm brown, auburn, platinum, gray

Backgrounds:
- soft supporting tones only
- do not use medium green as the main identity carrier because of game-table backgrounds
- prefer sand, peach, pale sky, dusty coral, pale lilac, cool cream, muted blue

## Character Matrix

Use this exact matrix to avoid similarity drift while designing.

| ID | Skin / face | Hair silhouette | Accessory / facial detail | Fast read marker |
| --- | --- | --- | --- | --- |
| `player-01` | light neutral, round face | black blunt bob | round coral glasses + freckles | bob + round glasses |
| `player-02` | olive, oval face | compact auburn curls | teal gaming headset | curls + headset |
| `player-03` | deep warm, square face | short curly flat top | thin mustache | flat top + mustache |
| `player-04` | light rose, heart face | long dark fringe | plum hood | hood + fringe |
| `player-05` | amber, rectangular face | short dark crop | mustard beanie + full beard | beanie + beard |
| `player-06` | deep cool, round face | large afro | mint square glasses | afro + square glasses |
| `player-07` | light warm, diamond face | platinum pixie | strong freckles + eyebrow slit | pixie + freckles |
| `player-08` | medium golden, long face | high full ponytail | hoop earrings | ponytail + hoops |
| `player-09` | medium neutral, square face | silver slick-back | beauty mark + straight brows | slick-back + beauty mark |
| `player-10` | light brown, oval face | dark curly mullet | petrol hoodie | hood + mullet |
| `player-11` | light olive, triangular face | side braid | orange backward cap | cap + side braid |
| `player-12` | deep cool, round face | shaved head | lime over-ear headphones | bald + headphones |
| `player-13` | porcelain warm, heart face | twin buns | purple cat-eye glasses | buns + cat-eye glasses |
| `player-14` | warm tan, wide face | short curly fringe | red bandana | bandana + curls |
| `player-15` | light neutral, triangular face | side undercut | short beard | undercut + stubble |
| `player-16` | dark amber, oval face | tied braids | turquoise star clip | braids + star clip |
| `player-17` | medium cool, rectangular face | tall pompadour | heavy brows | pompadour + heavy brows |
| `player-18` | light rose, round face | short bob | dark teal beret + single pearl earring | beret + bob |
| `player-19` | deep neutral, heart face | wide long curls | white sports visor | visor + big curls |
| `player-20` | medium warm, oval face | mid-length copper hair | amber oval glasses | copper hair + oval glasses |

## Distribution Rules Across The 20

To keep the family varied, preserve this balance:
- 4 eyewear-led avatars
- 3 beard or mustache avatars
- 4 clear headwear avatars
- 2 audio-device avatars
- 3 strong hair-mass avatars with no facewear dependency
- 3 subtle-mark avatars using freckles, beauty mark, slit, or earring as support only

Hard rule:
- no two avatars can share the same trio of face shape, top silhouette, and accessory family

## FE / Coder Handoff Notes

Naming:
- keep `player-01.svg` ... `player-20.svg`
- do not rename ids used by the manifest or deterministic mapping

Implementation expectations for the SVG artist/coder:
- build on a shared 128x128 grid
- keep the face vertically aligned across the whole set
- keep marker shapes readable in both square preview and circular crop
- do not overfit one avatar with special detail density

Recommended internal metadata for production tracking:
- `id`
- `primaryMarker`
- `secondaryMarker`
- `supportDetail`
- `faceShape`
- `cropCheck32`
- `cropCheck40`

## QA Checklist

The pack is ready only if all items below are true:
- every avatar is recognizable in a 40 px circular crop
- at least 15 of 20 remain recognizable at 32 px
- no pair feels like "same character with a different hair color"
- identity still works on green table backgrounds and dark blue UI panels
- no accessory creates offensive, mocking, or stereotype-heavy reads
- the full grid feels like one product family, not mixed illustration styles

## Recommendation

Proceed with a full replacement of the current 20 human SVGs, not incremental edits.

Reason:
- the current issue is systemic, not cosmetic
- partial tweaks will keep the same silhouette problem alive
- a matrix-driven redraw will give better long-term consistency and easier QA
