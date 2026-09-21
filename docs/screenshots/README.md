# PawBloom Screenshots

This directory contains screenshots of the PawBloom game for documentation and marketing purposes.

## Required Screenshots (12+)

### Onboarding Flow
1. `01-splash.png` - Splash screen with logo animation
2. `02-welcome.png` - Welcome screen with pet illustration
3. `03-starter-select.png` - Starter pet selection (Shiba/Corgi/Orange Tabby)
4. `04-reveal-silhouette.png` - Mystery silhouette before reveal
5. `05-reveal-sparkle.png` - Reveal animation with sparkles
6. `06-naming.png` - Pet naming screen

### Main Game
7. `07-home.png` - Home screen with team pets and stats
8. `08-walk.png` - Walking screen with parallax environment
9. `09-encounter-hint.png` - Encounter hint (footprints/rustling)
10. `10-encounter-reveal.png` - New pet reveal card

### Collection & Pet
11. `11-collection.png` - Collection journal with discovered/silhouettes
12. `12-pet-detail.png` - Pet detail screen with bond progress

### Bonus
13. `13-park-env.png` - Park environment full view
14. `14-city-env.png` - City environment
15. `15-rarity-epic.png` - Epic rarity reveal effect

## Screenshot Guidelines

- Resolution: 390×844 (iPhone 14 Pro) or 430×932 (iPhone 15 Pro Max)
- Format: PNG
- No browser chrome
- Capture key moments and transitions
- Show variety of pets and environments

## How to Capture

1. Run `npm run dev`
2. Open Chrome DevTools
3. Set device to iPhone 14 Pro
4. Navigate to desired screen
5. Use "Capture screenshot" from DevTools menu

Or use Playwright:
```bash
npm run test:e2e -- --project="Mobile Chrome" --update-snapshots
```
