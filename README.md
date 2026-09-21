# 🐾 PawBloom

> **Walk. Meet. Collect. Bond.** — A cozy walking pet collection game.

<p align="center">
  <img src="docs/screenshots/logo-preview.png" alt="PawBloom Logo" width="200" />
</p>

## 🎮 Playable Demo

**[Play PawBloom Now →](https://pawbloom.vercel.app)**

A Japanese kawaii-style mobile game where your daily walks lead to adorable encounters with cats and dogs. Each step brings you closer to discovering new furry friends!

## ✨ Features

### Core Gameplay
- **Walking System** — Steps fuel your adventure and trigger encounters
- **Pet Discovery** — Mystery encounters with silhouette reveals and rarity effects
- **Collection Journal** — Sticker-book style collection with undiscovered silhouettes
- **Bond System** — Level up friendship through walks, feeding, and interactions
- **Decor System** — Dress up your pets with themed accessories

### 12 Unique Pets
**Dogs:** Shiba Inu, Corgi, Golden Retriever, French Bulldog, Samoyed, Pomeranian  
**Cats:** Orange Tabby, Tuxedo Cat, British Shorthair, Ragdoll, Calico, Black Cat

Each pet features:
- Unique breed-accurate designs
- 5 animation states (idle, walk, happy, surprised, sleepy)
- Distinct personalities (shy, playful, foodie, curious, etc.)
- Rarity tiers (Common → Legendary)

### 4 Environments
- 🌳 **Sunny Park** — Starting area with trees and flowers
- 🏙️ **Cozy Town** — Charming shops and cafes
- 🌊 **Gentle River** — Serene riverside with willows
- 🏖️ **Sunset Beach** — Warm sand and ocean waves

### Visual Experience
- Procedural SVG pet rendering with consistent kawaii art style
- 5-layer parallax scrolling environments
- Smooth 60fps animations with Framer Motion
- Rarity-based reveal effects with sparkles and glows
- Mobile-first responsive design (430px max-width on desktop)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/StudjoDev/pawbloom.git
cd pawbloom

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 How to Play

1. **Onboarding** — Choose your first friend (Shiba, Corgi, or Orange Tabby)
2. **Home** — See your team pets and daily progress
3. **Walk** — Tap Walk to start moving and encounter new pets
4. **Encounter** — Watch the mystery reveal sequence, tap to discover!
5. **Collect** — Add new friends to your collection
6. **Bond** — Feed and interact to level up friendship
7. **Repeat** — Keep walking to discover all 12 pets!

### Developer Mode
Long-press (3 seconds) on the logo to activate Dev Mode with:
- Add steps instantly (+100, +500, +1000)
- Force encounters
- Change environments
- Reset game data

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | CSS Modules + CSS Variables |
| Animation | Framer Motion |
| State | Zustand |
| Database | Dexie (IndexedDB) |
| PWA | vite-plugin-pwa + Workbox |
| Testing | Vitest + Playwright |
| Routing | React Router 6 |

## 📁 Project Structure

```
pawbloom/
├── docs/                    # Documentation
│   ├── GDD.md              # Game Design Document
│   ├── ART_BIBLE.md        # Art Direction Guide
│   ├── CONTENT_PIPELINE.md # Asset Pipeline
│   └── screenshots/        # Game screenshots
├── public/
│   └── assets/             # Runtime assets
├── src/
│   ├── app/                # App configuration
│   ├── components/
│   │   ├── pets/           # Pet rendering (SVG)
│   │   └── ui/             # UI components
│   ├── data/               # Game data
│   │   ├── pets.ts         # Pet definitions
│   │   ├── environments.ts # Environment data
│   │   └── decor.ts        # Decor items
│   ├── features/
│   │   ├── onboarding/     # Onboarding screens
│   │   ├── home/           # Home screen
│   │   ├── walking/        # Walk & Encounter
│   │   ├── collection/     # Collection journal
│   │   └── pets/           # Pet detail
│   ├── services/
│   │   └── db.ts           # IndexedDB service
│   ├── stores/
│   │   └── gameStore.ts    # Zustand store
│   └── styles/
│       └── global.css      # Design tokens
├── e2e/                    # Playwright tests
└── art-prompts/            # Art generation prompts
```

## 🎨 Design System

### Color Palette

| Token | Color | Usage |
|-------|-------|-------|
| Primary | `#8CB369` | Brand, CTAs |
| Secondary | `#F5E6D3` | Backgrounds |
| Accent | `#F4A261` | Highlights |
| Common | `#8B9A6B` | Common rarity |
| Uncommon | `#6B8E8E` | Uncommon rarity |
| Rare | `#9B8EC2` | Rare rarity |
| Epic | `#D4A5C9` | Epic rarity |
| Legendary | `#E8C87D` | Legendary rarity |

### Typography
- Display: Nunito Bold
- Body: Nunito Regular
- Accent: Quicksand

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests (requires dev server)
npm run test:e2e

# Type checking
npm run typecheck
```

## 📱 PWA Features

- Installable on mobile devices
- Offline support with service worker
- App-like experience with no browser chrome
- Automatic updates

## 📸 Screenshots

See `/docs/screenshots/` for game screenshots including:
- Splash & Welcome screens
- Starter selection
- Pet reveal sequence
- Home screen with team
- Walking parallax
- Encounter mystery reveal
- Collection journal
- Pet detail & bond

## 🔮 Roadmap

### Vertical Slice (Current)
- [x] Core loop: Walk → Encounter → Collect → Bond
- [x] 12 pet roster with unique designs
- [x] 4 parallax environments
- [x] Bond levels 1-5
- [x] Basic decor system
- [x] PWA support

### Future Features
- [ ] Real pedometer integration (HealthKit/HealthConnect)
- [ ] Sakura Walk Festival event
- [ ] Adventure system (send pets on expeditions)
- [ ] Social features (Pack Walk)
- [ ] Bond levels 6-10
- [ ] More pets and environments
- [ ] Audio system (BGM + SFX)
- [ ] Achievement system

## 📄 License

This project is for demonstration purposes.

## 🙏 Acknowledgments

Inspired by:
- Pikmin Bloom's passive walking gameplay
- Neko Atsume's cozy collecting
- Animal Crossing's seasonal charm
- Pokémon's discovery anticipation

---

<p align="center">
  Made with 💚 for pet lovers everywhere
</p>
