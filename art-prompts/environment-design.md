# PawBloom Environment Design Prompts

## Art Direction
Side-scrolling 2D parallax, Japanese cozy illustration style, soft colors, hand-drawn feel, layered composition, seamless tiling, warm atmospheric lighting

## Layer Structure (Back to Front)
1. **Sky** (0.1x parallax) — Gradient, clouds, sun/moon
2. **Far Background** (0.3x) — Distant elements, mountains, skyline
3. **Mid Background** (0.6x) — Trees, buildings, main scenery
4. **Ground/Path** (1.0x) — Walking surface
5. **Foreground** (1.2x) — Close grass, flowers, decorative elements

## Environment Prompts

### Sunny Park
```
Cozy park scene, Japanese illustration style, side-scrolling game background,
soft pastel colors, warm daylight atmosphere, grass green (#A8D08D), 
cream path (#E8D5BC), light blue sky (#B8D4E8), gentle trees, park benches,
lamp posts, flowers, butterflies, peaceful mood, layered parallax composition,
seamless tile-ready, game asset
```

**Color Palette:**
- Sky: #B8D4E8 → #D4E8F5
- Trees: #6B8F4E, #7CB369, #8CB369
- Grass: #A8D08D
- Path: #E8D5BC
- Flowers: #FFB7C5, #F4A261

### Cozy Town
```
Charming neighborhood street, Japanese illustration style, side-scrolling,
colorful shops and cafes, warm cream buildings (#D4C5B8), cute awnings,
flower pots, crosswalks, street lamps, soft blue sky (#C5D5E8),
cozy urban atmosphere, layered parallax, seamless tile, game asset
```

**Color Palette:**
- Sky: #C5D5E8 → #E8EEF5
- Buildings: #D4C5B8, #C9B8A8, #E8D5BC
- Street: #9B9B9B
- Accents: #F4A261, #8CB369

### Gentle River
```
Serene riverside scene, Japanese illustration style, side-scrolling,
willow trees (#7CB369), gentle blue water (#89B8D4), wooden bridge,
ducks swimming, reeds, stepping stones, peaceful atmosphere,
soft blue sky (#A8C8E8), layered parallax, seamless tile, game asset
```

**Color Palette:**
- Sky: #A8C8E8 → #D4E8F5
- Water: #89B8D4, #6BA8C9
- Willows: #7CB369, #6B8F4E
- Bank: #E8D5BC, #A8D08D

### Sunset Beach
```
Warm beach scene at sunset, Japanese illustration style, side-scrolling,
golden sand (#F5E6D3), gentle ocean waves (#89B8D4), palm trees,
beach umbrellas, shells, wooden pier, warm pink-orange sky (#F5D4C5),
peaceful summer atmosphere, layered parallax, seamless tile, game asset
```

**Color Palette:**
- Sky: #F5D4C5 → #F5E6D3
- Sand: #F5E6D3, #E8D5BC
- Water: #89B8D4, #6BA8C9
- Palms: #6B8F4E, #8CB369
- Accents: #F4A261, #E8C87D

## Decorative Elements by Environment

### Park
- Trees (rounded, friendly shapes)
- Benches (wooden, curved)
- Lamp posts (vintage style)
- Flower beds
- Butterflies
- Birds

### City
- Shop fronts (colorful awnings)
- Cafe tables
- Potted plants
- Street lamps (modern)
- Crosswalk stripes
- Window displays

### Riverside
- Willow trees (drooping branches)
- Wooden bridge
- Ducks
- Reeds and cattails
- Stepping stones
- Dragonflies

### Beach
- Palm trees
- Beach umbrellas
- Shells
- Wooden pier
- Seagulls
- Beach grass

## Export Specifications
- Full width tiles (1600-2000px wide)
- Height based on viewport (600-800px)
- PNG format, optimized
- Seamless horizontal tiling
- Each layer separate file
