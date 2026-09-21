# PawBloom Critical FAIL Fix — HARD ACCEPTANCE GATES

## Problem (user live report)
1. Home pet images NOT transparent (cream/white box behind pets)
2. Pets do not animate (static stickers)
3. No walk/happy/surprised/sleepy animations
4. Overall look too crude ("陽春")

## Assets attached
`uploads/pawbloom-transparent-pets.tar.gz` → extract to `public/pets/`:
- `transparent/idle/*.png` — 512×512 RGBA, corners alpha=0 (rembg + crop)
- `transparent/silhouette/*.png` — dark silhouettes from same mattes
- IDs: black-cat, british-shorthair, calico, corgi, french-bulldog, golden-retriever, orange-tabby, pomeranian, ragdoll, samoyed, shiba-inu, tuxedo (+ tuxedo-cat alias)

Replace ALL current `public/pets/idle/` and `public/pets/silhouette/` with these. Delete any non-transparent sources.

## Required code changes

### A. Transparent display
- PetRenderer must use `<img>` with these PNGs; `background: transparent`; never wrap in solid cream card that looks like image bg.
- Home Team Pets sit ON grass/scene art — image itself has no fill.

### B. Real animations (NON-NEGOTIABLE)
Create `PetSprite` / `AnimatedPet` component (Framer Motion + CSS):

| anim | behavior | where |
|------|----------|-------|
| idle | breathe (scaleY 1↔1.04), soft sway ±3°, micro bob Y 0↔-4px, loop forever; occasional ear tilt | Home team (all 3), Pet Detail |
| walk | walk cycle: Y bob 0↔-8px @ ~6fps feel, rotate ±6°, slight squashX, shadow oval pulse; sync with walk progress | Walk scene team |
| happy | jump Y -24px + rotate wiggle 600ms, then settle to idle | Feed / Bond / Reveal success |
| surprised | scale 1→1.15 punch + shakeX 400ms | Encounter discovery |
| sleepy | slow droop rotate 8°, Y +4, opacity pulse, slower breathe | idle too long OR sleepy personality |

- Home: THREE team pets MUST visibly animate on load — not static. Stagger start delays.
- Walk: all three use `walk` while moving / simulating steps.
- Wire Encounter → surprised; Reveal/Feed → happy; long idle → sleepy.
- Optional: soft ground shadow ellipse under each pet (CSS, not baked into PNG).

### C. Visual polish (陽春 = FAIL)
- Home: layered cozy park scene (sky gradient, clouds drift, grass, soft trees), not flat color + pet stickers.
- UI: soft rounded cards, cream surfaces, grass-green primary, peach accents — Japanese cozy mobile game, not SaaS dashboard.
- Walk: parallax layers + team pets with walk anim + progress bar polish.
- Encounter: silhouette → sparkle → reveal with rarity VFX.
- Bump SW cache bust (`skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches`) so live users get new assets.

### D. Deploy & verify
1. Commit + push to main (or merge PR) so GitHub Pages updates
2. Hard-verify live URL with cache-bust: open `#/home`, screenshot — pets transparent ON scene, visibly bobbing
3. Walk through `#/walk` — walk cycle visible
4. E2E smoke still passes
5. Report playable URL + change summary

## Success criteria
- Corner pixels of runtime pet PNGs alpha=0
- Home screenshot: no white/cream rectangle behind pets; pets moving
- Walk screenshot: bobbing walk cycle
- Looks like polished Japanese cozy mobile game
