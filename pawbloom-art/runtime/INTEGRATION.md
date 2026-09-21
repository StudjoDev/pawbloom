# PawBloom HARD GATE FIX — Runtime Asset Pack

## Package
`pawbloom-runtime-assets.tar.gz` → extract `runtime/` into `public/pets/` (or `public/assets/pets/`).

Structure:
```
pets/idle/{id}.png          # RGBA transparent (real PNG magic 89 50 4E 47)
pets/walk/{id}-1..4.png     # 4-frame walk cycle, RGBA
pets/happy/{id}.png
pets/surprised/{id}.png
pets/sleepy/{id}.png
pets/silhouette/{id}.png
```

IDs: black-cat, british-shorthair, calico, corgi, french-bulldog, golden-retriever, orange-tabby, pomeranian, ragdoll, samoyed, shiba-inu, tuxedo-cat (+ tuxedo alias)

## CRITICAL — Gate A
- DELETE every existing pets/idle file that is JPEG-in-.png disguise (magic FFD8).
- Serve only these RGBA PNGs. Verify with `file` / first bytes `89504e47`.
- CSS: img must have transparent bg; never cream card behind that looks like image bg.
- SW: skipWaiting + clientsClaim + cleanupOutdatedCaches + bump cache version.

## CRITICAL — Gate B (Framer translate DOES NOT COUNT)
Implement `PetSprite` that swaps **image frames**:

```tsx
// Idle on Home: loop subtle frame OR CSS breathe ON TOP OF transparent idle PNG is OK for idle only,
// BUT Walk MUST flip walk-1 → walk-2 → walk-3 → walk-4 at ~8–10 fps.
// happy/surprised/sleepy: set pose image for 1.2s then return to idle.

type Pose = 'idle' | 'walk' | 'happy' | 'surprised' | 'sleepy';
src = pose==='walk' ? `/pets/walk/${id}-${frame}.png` : `/pets/${pose}/${id}.png`
```

Wiring:
- Home team of 3: idle (breathe OK) + occasionally happy
- Walk scene: pose=walk, frame cycles while progressing
- Encounter found: surprised
- Bond/feed/reveal: happy
- Long idle / night: sleepy

## CRITICAL — Gate C
Polish Home as Japanese cozy mobile game:
- Layered park: sky gradient, drifting clouds, grass hills, soft trees, soft ground shadow under pets
- Rounded cream UI cards, grass-green primary, peach accents
- Encounter: silhouette → sparkle → reveal rarity VFX
- No emoji pets, no SaaS dashboard look

## Deploy
1. Commit assets + PetSprite + Home/Walk polish
2. Merge/push so https://studjodev.github.io/pawbloom/ updates
3. Hard-verify LIVE:
   - `curl` idle PNG magic is 89504e47, mode RGBA, corner alpha 0
   - `/pets/walk/corgi-1.png` returns 200
   - Screenshot Home: no cream box, pets bobbing
   - Screenshot Walk: visible frame-changing walk cycle
4. Report URL + proof

Do NOT claim done without live proof of A+B+C.
