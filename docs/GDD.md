# PawBloom — Game Design Document

## Overview

**PawBloom** — *Walk. Meet. Collect. Bond.*

**Genre:** Cozy Walking × Pet Collection Game

**Platform:** Mobile-first PWA (iOS Safari, Android Chrome), Desktop (max-width 430px)

**Core Fantasy:** Players walk in the real world to encounter adorable cats and dogs in the game world. Each pet has unique breeds, personalities, and decorations.

---

## Core Game Loop

```
Walk → Progress → Mystery Encounter → Pet Reveal → Collect → Bond → Decor → Collection Completion → Walk More
```

**Player Psychology:** "If I walk a bit more, maybe I'll meet a new cat or dog."

---

## Game Systems

### 1. Walking System

- **Step Counter:** SimulationStepProvider (dev mode) with interface for future HealthKit/HealthConnect
- **Progress:** Steps contribute to encounter chances and bond XP
- **Environment Transitions:** Park → City → Riverside → Beach based on cumulative steps

### 2. Encounter System

**Trigger Mechanics:**
- Base distance: 500-1200 steps (weighted random)
- Modifiers: Rarity, environment, active event, collection progress
- Pity system: Guaranteed encounter after max threshold

**Rarity Distribution:**
| Rarity | Chance | Color |
|--------|--------|-------|
| Common | 55% | #8B9A6B (sage green) |
| Uncommon | 25% | #6B8E8E (teal) |
| Rare | 12% | #9B8EC2 (lavender) |
| Epic | 6% | #D4A5C9 (pink-purple) |
| Legendary | 2% | #E8C87D (warm gold) |

**Encounter Sequence:**
1. Footprints appear on path
2. Team pets notice (ears perk up)
3. Camera/scroll slows
4. Bush/grass rustles
5. Silhouette emerges
6. Player taps to reveal
7. Rarity effect plays (sparkles, glow based on tier)
8. Pet reaction animation
9. Collection card appears

### 3. Pet System

**PetInstance Model:**
```typescript
interface PetInstance {
  instanceId: string;
  petId: string;           // Base pet type
  nickname?: string;
  personality: Personality;
  rarity: Rarity;
  bondLevel: number;       // 1-10 (v1: 1-5)
  bondXp: number;
  totalStepsTogether: number;
  equippedDecor: string[];
  memories: Memory[];
  discoveredAt: Date;
}
```

**Personalities:**
- Shy, Playful, Sleepy, Foodie, Curious, Brave, Clingy, Tsundere, Explorer, Mischievous

### 4. Bond System

**Levels 1-5 (Vertical Slice):**
| Level | XP Required | Unlocks |
|-------|-------------|---------|
| 1 | 0 | Basic reactions |
| 2 | 100 | Happy animation |
| 3 | 300 | Special reaction |
| 4 | 600 | Exclusive decor slot |
| 5 | 1000 | Memory unlocked |

**XP Sources:**
- Walking together: 1 XP per 10 steps
- Feeding: 20 XP per treat
- Petting/Interaction: 5 XP per tap (cooldown)

### 5. Decor System

**First Version Items:**
- Normal (default)
- Explorer (backpack, bandana)
- Raincoat (yellow coat, boots)
- Sakura (flower crown, petals)

### 6. Collection System

- Adventure Journal / Sticker Book aesthetic
- Undiscovered pets show as silhouettes with "???"
- Collection progress affects encounter bonuses
- Breed info, personality types discovered, memories

---

## Content

### Character Roster (12 pets)

**Dogs (6):**
1. **Shiba Inu** — Signature fox-like face, curled tail, confident stance
2. **Corgi** — Short legs, long body, big ears, fluffy butt
3. **Golden Retriever** — Fluffy, friendly, gentle expression
4. **French Bulldog** — Bat ears, compact, muscular
5. **Samoyed** — Pure white, fluffy, "Sammy smile"
6. **Pomeranian** — Tiny, fluffy, fox-like face

**Cats (6):**
1. **Orange Tabby** — Classic orange stripes, round face
2. **Tuxedo Cat** — Black & white, sophisticated markings
3. **British Shorthair** — Round face, dense coat, copper eyes
4. **Ragdoll** — Blue eyes, pointed coloring, fluffy
5. **Calico** — Tri-color patches (white, orange, black)
6. **Black Cat** — Sleek, golden/green eyes, elegant

### Environments (4)

1. **Park** — Starter area, grass, trees, benches, lamp posts
2. **City** — Urban setting, shops, crosswalks, street elements
3. **Riverside** — Water, bridges, ducks, willow trees
4. **Beach** — Sand, waves, shells, umbrellas, pier

---

## Screens & UI

### Home Screen
- Living scene with up to 3 team pets
- Today's Steps display
- Adventure Progress bar
- Next Discovery hint
- Primary CTA: **Start Walk** button

### Walk Screen
- 2D side-scrolling parallax scene
- 3 active pets walking
- Step counter and progress bar
- Environment name indicator

### Encounter Screen
- Full mystery reveal sequence
- Rarity-based effects
- Collection card presentation

### Collection Screen
- Grid/book view of all pets
- Silhouettes for undiscovered
- Filter by species, rarity

### Pet Detail Screen
- Pet character ≥40% of screen
- Tap for reaction
- Feed, Rename, Decor options
- Stats: Breed, Personality, Bond Level, Steps Together

---

## Onboarding Flow

1. **Logo Screen** — PawBloom logo fade in
2. **Welcome** — "Welcome to PawBloom! Let's find your first friend."
3. **Starter Selection** — Choose: Shiba Inu / Corgi / Orange Tabby
4. **Reveal Sequence** — First encounter experience
5. **Naming** — Give your new friend a nickname
6. **Home** — Tutorial hints, start first walk

---

## Events

### Sakura Walk Festival (Demo Event)
- Limited time sakura-themed decor
- Special sakura environment overlay
- Bonus encounter rates
- Event-exclusive memories

---

## Adventure System (60s Demo)

- Send pets on expeditions
- Timer-based rewards
- Returns: Treats, Friendship Paws, Materials, Postcards, Memories

---

## Technical Requirements

- 60fps animation target
- Mobile-first responsive
- Offline-capable (PWA)
- IndexedDB persistence
- Original audio (no copyrighted content)
- Haptic feedback on interactions

---

## Success Metrics

Players should feel this is a polished Japanese mobile game ready for App Store, not a web demo.

Core test: After completing Starter → Walk → Encounter → Reveal, player thinks "I want to walk more to see what's next."
