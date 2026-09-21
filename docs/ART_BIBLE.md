# PawBloom — Art Bible

## Art Direction

**Style:** Japanese 2D Kawaii Anime × Cozy Illustration

**Keywords:** Japanese mobile game, cute, cozy, charming, hand-drawn feel, anime-inspired, soft colors, clean line art, expressive, collectible, high readability, polished mobile game

**Avoid:** Neon, Cyberpunk, dark fantasy, hard gradients, photorealistic, western cartoon exaggeration, hyper-detailed backgrounds, emoji art, generic SVG, stock images

---

## Color System — Design Tokens

### Primary Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-primary` | Soft Grass Green | #8CB369 | Main brand color, CTAs, highlights |
| `--color-primary-light` | Light Grass | #A8D08D | Hover states, backgrounds |
| `--color-primary-dark` | Deep Grass | #6B8F4E | Text on light, pressed states |

### Secondary Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-secondary` | Warm Cream | #F5E6D3 | Backgrounds, cards |
| `--color-secondary-light` | Soft Ivory | #FBF4EC | Light backgrounds |
| `--color-secondary-dark` | Toasted Cream | #E8D5BC | Borders, dividers |

### Accent Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-accent` | Peach Coral | #F4A261 | Buttons, notifications |
| `--color-accent-light` | Soft Peach | #F7C09E | Highlights |
| `--color-accent-dark` | Deep Coral | #E07B3B | Emphasis |

### Atmospheric Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-sky` | Light Sky Blue | #B8D4E8 | Sky layers, calm UI |
| `--color-sky-light` | Pale Sky | #D4E8F5 | Gradients |
| `--color-water` | Soft Blue | #89B8D4 | Water elements |

### Surface & Text

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-surface` | White | #FFFFFF | Cards, panels |
| `--color-surface-elevated` | Soft White | #FAFAFA | Elevated elements |
| `--color-background` | Warm Background | #FDF8F3 | App background |
| `--color-text` | Charcoal | #3D3D3D | Primary text |
| `--color-text-secondary` | Warm Gray | #6B6B6B | Secondary text |
| `--color-text-muted` | Light Gray | #9B9B9B | Muted, hints |

### Rarity Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-common` | Sage Green | #8B9A6B | Common rarity |
| `--color-uncommon` | Soft Teal | #6B8E8E | Uncommon rarity |
| `--color-rare` | Lavender | #9B8EC2 | Rare rarity |
| `--color-epic` | Rose Pink | #D4A5C9 | Epic rarity |
| `--color-legendary` | Warm Gold | #E8C87D | Legendary rarity |

### Feedback Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-success` | Fresh Green | #7CB342 | Success states |
| `--color-warning` | Soft Amber | #FFB74D | Warnings |
| `--color-error` | Soft Rose | #E57373 | Errors |

---

## Typography

### Font Stack

```css
--font-display: 'Nunito', 'Rounded Mplus 1c', sans-serif;
--font-body: 'Nunito', system-ui, sans-serif;
--font-accent: 'Quicksand', sans-serif;
```

### Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-display` | 32px | 700 | Logo, titles |
| `--text-heading` | 24px | 700 | Screen headers |
| `--text-subheading` | 18px | 600 | Section titles |
| `--text-body` | 16px | 400 | Body text |
| `--text-caption` | 14px | 400 | Captions, labels |
| `--text-small` | 12px | 400 | Small text, badges |

---

## Character Design Guidelines

### Proportions

- **Head-to-Body Ratio:** 45-55% head
- **Eyes:** Large, anime-style but maintaining animal essence
- **Expression:** Readable at small sizes

### Dogs Base Traits

| Breed | Key Features |
|-------|--------------|
| Shiba Inu | Fox-like face, curled tail, pointed ears, confident stance |
| Corgi | Short legs, long body, large ears, fluffy rear |
| Golden Retriever | Fluffy coat, friendly face, floppy ears |
| French Bulldog | Bat ears, compact body, wrinkled face |
| Samoyed | White fluffy, "Sammy smile", thick coat |
| Pomeranian | Tiny body, fox face, puffy coat |

### Cats Base Traits

| Breed | Key Features |
|-------|--------------|
| Orange Tabby | Orange stripes, round face, classic cat |
| Tuxedo | Black & white, sophisticated, white chest |
| British Shorthair | Round face, dense coat, copper eyes |
| Ragdoll | Blue eyes, pointed colors, fluffy |
| Calico | Tri-color patches, unique patterns |
| Black Cat | Sleek, golden eyes, elegant silhouette |

### Animation States

Each pet requires:
1. **Idle** — Subtle breathing, occasional blink
2. **Walk** — Bounce cycle, breed-specific gait
3. **Happy** — Tail wag/swish, ears up, sparkle eyes
4. **Surprised** — Ears perk, eyes wide, slight jump
5. **Sleepy** — Droopy eyes, yawn, curl up
6. **Silhouette** — Pure black shape, recognizable breed

---

## Environment Design

### Layer Structure (Back to Front)

1. **Sky** — Gradient, clouds, sun/moon
2. **Far Background** — Mountains, distant buildings
3. **Midground** — Trees, structures, large elements
4. **Ground/Path** — Walking surface
5. **Foreground** — Grass, flowers, close elements
6. **UI Layer** — Interface elements

### Parallax Speeds

| Layer | Speed Multiplier |
|-------|------------------|
| Sky | 0.1x |
| Far BG | 0.3x |
| Midground | 0.6x |
| Ground | 1.0x |
| Foreground | 1.2x |

### Environment Palettes

**Park:**
- Sky: #B8D4E8 → #D4E8F5
- Trees: #6B8F4E, #8CB369
- Grass: #A8D08D
- Path: #E8D5BC

**City:**
- Sky: #C5D5E8 → #E8EEF5
- Buildings: #D4C5B8, #C9B8A8
- Street: #9B9B9B
- Accents: #F4A261

**Riverside:**
- Sky: #A8C8E8 → #D4E8F5
- Water: #89B8D4
- Willows: #7CB369
- Bank: #E8D5BC

**Beach:**
- Sky: #B8D4E8 → #F5E6D3
- Sand: #F5E6D3
- Water: #89B8D4 → #6BA8C9
- Shells: #F4A261, #E8C87D

---

## UI Design

### Panel Style

- Rounded corners: 16-24px
- Soft shadows: 0 4px 12px rgba(0,0,0,0.08)
- Border: 2px solid warm cream
- Background: Semi-transparent white

### Button Style

- Primary: Rounded pill, grass green, white text
- Secondary: Rounded pill, outlined, grass green border
- Accent: Rounded pill, peach coral, white text

### Icon Style

- Line weight: 2-3px
- Rounded ends
- Consistent 24x24 or 32x32 grid
- Filled variants for selected states

### Motifs

- Paw prints
- Leaves
- Stars/sparkles
- Hearts
- Flowers (sakura for events)

---

## Asset Specifications

### Master Files

- Resolution: ≥1024×1024 (2048 preferred)
- Format: PNG with transparency
- Location: `art/source/`

### Runtime Assets

- Pets: 512×512 or 256×256
- UI Icons: 64×64, 128×128
- Environment layers: Full width tiles
- Format: PNG, WebP
- Location: `public/assets/`

### Naming Convention

```
pets/
  shiba-inu/
    idle.png
    walk.png
    happy.png
    surprised.png
    sleepy.png
    silhouette.png
    portrait.png
    thumb.png
  
environments/
  park/
    sky.png
    bg-far.png
    bg-mid.png
    ground.png
    fg.png

ui/
  btn-primary.png
  btn-secondary.png
  panel-main.png
  icon-paw.png
  icon-heart.png

decor/
  explorer/
    backpack.png
    bandana.png
  raincoat/
    coat.png
    boots.png
```

---

## Visual QA Checklist

- [ ] All pets have consistent line width
- [ ] All pets have matching proportions
- [ ] Colors match design tokens
- [ ] Silhouettes are recognizable
- [ ] UI elements have consistent radius
- [ ] Environment layers align properly
- [ ] Animations are smooth (60fps capable)
- [ ] Assets are sharp at target resolution
- [ ] No leftover AI artifacts
- [ ] Consistent lighting direction (top-left)
