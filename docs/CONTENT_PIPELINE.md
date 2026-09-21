# PawBloom — Content Pipeline

## Overview

This document outlines the asset generation and integration pipeline for PawBloom.

---

## Art Production Workflow

### Phase 1: Foundation

1. **Art Bible Complete** → Color tokens, typography, style guide
2. **Master Character Design** → Base proportions, rig structure
3. **Environment Style Guide** → Layer structure, parallax rules

### Phase 2: Character Production

```
1. Base Silhouette Design
   ↓
2. Breed-Specific Features
   ↓
3. Pose Sheet (idle, walk, happy, surprised, sleepy)
   ↓
4. Expression Variations
   ↓
5. Animation Frames
   ↓
6. Decor Compatibility Check
   ↓
7. Export & Optimize
```

### Phase 3: Environment Production

```
1. Environment Concept
   ↓
2. Layer Breakdown (5 layers)
   ↓
3. Individual Layer Creation
   ↓
4. Tile/Seamless Check
   ↓
5. Parallax Integration Test
   ↓
6. Export & Optimize
```

### Phase 4: UI Production

```
1. Component Design
   ↓
2. State Variations (normal, hover, pressed, disabled)
   ↓
3. Responsive Scaling Test
   ↓
4. Export & Slice
```

---

## Asset Generation Strategy

### For Characters (Procedural SVG + Canvas)

Since we're building a consistent art style without external image generation:

1. **SVG Base Shapes** — Mathematically defined curves for each breed
2. **Layered Composition** — Body, head, ears, eyes, nose, tail as separate elements
3. **Color Application** — CSS variables for easy theming
4. **Animation via Transforms** — Scale, rotate, translate for poses

### Character SVG Structure

```svg
<svg class="pet pet--shiba">
  <g class="pet__body">
    <ellipse class="body-main" />
    <ellipse class="body-chest" />
  </g>
  <g class="pet__legs">
    <path class="leg leg--front-left" />
    <path class="leg leg--front-right" />
    <path class="leg leg--back-left" />
    <path class="leg leg--back-right" />
  </g>
  <g class="pet__tail" />
  <g class="pet__head">
    <ellipse class="head-main" />
    <g class="pet__ears">
      <path class="ear ear--left" />
      <path class="ear ear--right" />
    </g>
    <g class="pet__face">
      <ellipse class="eye eye--left" />
      <ellipse class="eye eye--right" />
      <path class="nose" />
      <path class="mouth" />
    </g>
  </g>
</svg>
```

### Breed Differentiation Parameters

| Breed | Body Ratio | Head Size | Ear Type | Tail Type | Leg Length |
|-------|------------|-----------|----------|-----------|------------|
| Shiba | 1.2:1 | 0.55 | Pointed Up | Curled | Medium |
| Corgi | 1.8:1 | 0.5 | Large Pointed | Short | Short |
| Golden | 1.3:1 | 0.45 | Floppy | Long Wavy | Medium |
| Frenchie | 1:1 | 0.55 | Bat | Short | Short |
| Samoyed | 1.2:1 | 0.5 | Pointed | Fluffy Curl | Medium |
| Pom | 0.8:1 | 0.6 | Small Pointed | Plume | Short |
| Orange Tabby | 1.3:1 | 0.5 | Triangle | Long | Medium |
| Tuxedo | 1.2:1 | 0.48 | Triangle | Long | Medium |
| British SH | 1.1:1 | 0.55 | Round | Medium | Short |
| Ragdoll | 1.4:1 | 0.48 | Fluffy | Fluffy Long | Medium |
| Calico | 1.2:1 | 0.5 | Triangle | Long | Medium |
| Black Cat | 1.3:1 | 0.48 | Pointed | Long Slim | Long |

---

## Environment Layer System

### Canvas-based Parallax Layers

```typescript
interface EnvironmentLayer {
  id: string;
  type: 'sky' | 'far-bg' | 'mid-bg' | 'ground' | 'foreground';
  parallaxSpeed: number;
  elements: LayerElement[];
  gradient?: GradientDef;
}

interface LayerElement {
  type: 'shape' | 'sprite' | 'pattern';
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
  path?: string;
  repeat?: boolean;
}
```

### Park Environment Layers

1. **Sky** — Gradient #B8D4E8 → #D4E8F5, soft clouds
2. **Far BG** — Distant trees silhouette #6B8F4E
3. **Mid BG** — Trees, lamp posts, benches
4. **Ground** — Grass path #A8D08D, dirt path #E8D5BC
5. **Foreground** — Grass tufts, flowers

---

## Animation System

### Frame-based Animation Data

```typescript
interface AnimationDef {
  name: string;
  frames: number;
  duration: number; // ms per frame
  loop: boolean;
  transforms: FrameTransform[];
}

interface FrameTransform {
  part: string; // 'head', 'body', 'tail', etc.
  translate?: { x: number; y: number };
  rotate?: number;
  scale?: { x: number; y: number };
}
```

### Standard Animations

| Animation | Frames | Duration | Loop |
|-----------|--------|----------|------|
| Idle | 4 | 500ms | Yes |
| Walk | 8 | 100ms | Yes |
| Happy | 6 | 150ms | No |
| Surprised | 4 | 200ms | No |
| Sleepy | 6 | 400ms | Yes |

---

## File Organization

```
/art-prompts/
  character-base.md
  shiba-inu.md
  corgi.md
  ...
  environment-park.md
  ui-components.md

/art/source/
  characters/
    base-dog-rig.svg
    base-cat-rig.svg
    shiba-inu-master.svg
    ...
  environments/
    park-layers.svg
    city-layers.svg
    ...
  ui/
    components.svg
    icons.svg

/public/assets/
  pets/
    shiba-inu/
      sprite.png
      portrait.png
      silhouette.png
    ...
  environments/
    park/
      sky.png
      bg-far.png
      ...
  ui/
    buttons/
    panels/
    icons/
  audio/
    bgm/
    sfx/
```

---

## Integration Checklist

### Per Character

- [ ] SVG master created
- [ ] All poses defined
- [ ] Animation transforms set
- [ ] Silhouette exported
- [ ] Portrait exported
- [ ] Thumbnail exported
- [ ] Runtime sprites exported
- [ ] Decor attachment points defined

### Per Environment

- [ ] All 5 layers created
- [ ] Parallax speeds configured
- [ ] Seamless tiling verified
- [ ] Day/night variants (future)
- [ ] Event overlays prepared

### Per UI Component

- [ ] All states designed
- [ ] Touch targets ≥44px
- [ ] Responsive behavior defined
- [ ] Assets exported

---

## Quality Gates

### Visual Consistency

1. All characters use same line weight (2-3px at master size)
2. All colors from approved palette
3. All shadows consistent direction (top-left light)
4. All UI corners same radius family (8, 12, 16, 24px)

### Technical Quality

1. No pixelation at target display size
2. Transparent backgrounds where needed
3. Optimized file sizes (≤100KB per sprite, ≤500KB per env layer)
4. Proper naming convention followed

### Animation Quality

1. Smooth 60fps capable
2. Natural easing curves
3. Breed-appropriate movement
4. Personality-appropriate timing
