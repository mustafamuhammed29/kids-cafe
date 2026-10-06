# Haven Kids Café — Brand Visual Identity & Design System
**Version:** 1.0.0 (Design Quality Reset)  
**Target:** Premium European Family Hospitality & Play Café  
**Audience:** Conscious, design-minded parents (28–45) seeking serene, mindful spaces for their young children (0–8 years) without sacrificing aesthetic calm, culinary quality, or personal comfort.

---

## 1. Brand Personality & Emotional Tone

Haven Kids Café rejects the chaotic, plastic-heavy, overstimulated trope of generic children’s play centers. It is designed as a sanctuary where children engage in thoughtful, analog play and parents enjoy an artisanal hospitality environment.

| Personality Trait | What it Means for the Experience | What it Means for the UI |
| :--- | :--- | :--- |
| **1. Refined** | Understated European elegance; nothing loud, gimmicky, or cheap. | Generous whitespace, editorial typography, restrained color accents. |
| **2. Mindful** | Screen-free, natural materials, calming rhythm, intentional atmosphere. | Gentle transitions, zero frantic animations, clear focal hierarchy. |
| **3. Serene** | An exhale for tired parents; low auditory and visual clutter. | Warm neutral canvas (linen/cream), muted herbal greens, no harsh neon. |
| **4. Tactile** | Real Baltic birch wood, linen textiles, coarse sea salt crystals. | Subtle grain textures, soft border definitions, authentic organic photography. |
| **5. Nurturing** | Safe, loving, hygienic, medically grounded (salt room halotherapy). | Reassuring clarity, transparent pricing, transparent session capacities. |
| **6. Sophisticatedly Playful** | Whimsical enough to delight children, but mature enough for parents. | Poetic editorial micro-accents, organic arches, tasteful warmth. |

---

## 2. Color System & Design Tokens

The palette is derived from natural materials: Scandinavian light birch, Bavarian forest pines, Alpine mineral salt, and sunlit terracotta.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HAVEN COLOR PALETTE                             │
│                                                                        │
│   #243E36       #567568       #FAF7F2       #E8927C       #D4E4E7     │
│  Deep Pine     Soft Sage     Warm Alabaster  Warm Terracotta Salt Mineral│
│  (Primary)    (Secondary)     (Canvas)      (Warm Accent)  (Halotherapy)│
└────────────────────────────────────────────────────────────────────────┘
```

### Color Tokens Specification

| Token Name | Hex Code | HSL | Semantic Role | WCAG Contrast Ratio on `#FAF7F2` |
| :--- | :--- | :--- | :--- | :--- |
| `--color-forest-deep` | `#243E36` | `164°, 27%, 19%` | Primary brand tone, high-emphasis headers, dark buttons | **10.8:1** (Passes AAA) |
| `--color-forest-pine` | `#2D4F44` | `161°, 27%, 24%` | Primary interactive hover states, emphasized accents | **8.4:1** (Passes AAA) |
| `--color-sage-soft` | `#567568` | `156°, 15%, 40%` | Secondary brand tone, subtitles, active filter tabs | **4.7:1** (Passes AA) |
| `--color-sage-mist` | `#D9E4DF` | `156°, 18%, 87%` | Subtle container background, secondary button surfaces | Decorative / Surface |
| `--color-cream-canvas` | `#FAF7F2` | `38°, 38%, 96%` | Core background tone for all pages (warm oat linen) | Base Surface |
| `--color-cream-card` | `#FFFFFF` | `0°, 0%, 100%` | Elevated surface tone for structured booking modules | Base Card |
| `--color-cream-warm` | `#F3EEE5` | `38°, 28%, 93%` | Subtle contrasting section strip, borders, input backgrounds | Base Contrast |
| `--color-apricot-accent` | `#E8927C` | `13°, 70%, 70%` | Warm child-centered accent, booking highlight, notification | **3.2:1** (Paired with dark text) |
| `--color-salt-blue` | `#D4E4E7` | `189°, 28%, 87%` | Salt room ambient highlights, wellness badges, serene tint | Decorative / Badges |
| `--color-salt-deep` | `#3A6872` | `190°, 32%, 34%` | Salt room text badges, halotherapy feature callouts | **5.9:1** (Passes AA) |
| `--color-text-main` | `#1D2623` | `156°, 14%, 13%` | Primary body text, high contrast headlines | **12.5:1** (Passes AAA) |
| `--color-text-muted` | `#606D67` | `154°, 6%, 40%` | Body copy, secondary descriptions, metadata | **4.9:1** (Passes AA) |
| `--color-text-faint` | `#93A09A` | `154°, 6%, 60%` | Placeholder text, subtle captions, disabled indicators | Non-critical / Helper |
| `--color-success` | `#2E684C` | `150°, 39%, 29%` | Booking confirmed, available slots, verified items | **6.6:1** (Passes AA) |
| `--color-warning` | `#B46B23` | `30°, 68%, 42%` | Low capacity warning (e.g. 2 slots left) | **5.1:1** (Passes AA) |
| `--color-error` | `#A63B34` | `4°, 52%, 43%` | Form validation errors, fully booked slots | **6.4:1** (Passes AA) |

---

## 3. Typography Pairing & Modular Scale

Typography communicates the café’s boutique nature. We pair an **architectural, warm-humanist serif** with an **uncluttered, legible sans-serif**.

- **Display Headline Font:** `Fraunces` or `Playfair Display` (Warm, organic serif with soft terminals and character)
- **Body & Interface Font:** `Plus Jakarta Sans` (Clean, geometric yet humanist proportions, exceptionally legible on mobile)

### Typography Scale (Mobile vs. Desktop)

| Level | Desktop Size / Leading | Mobile Size / Leading | Font Family & Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `56px (3.5rem)` / `1.1` | `36px (2.25rem)` / `1.15` | Display Serif, SemiBold (`600`) | Main Homepage Hero headline |
| **Headline 1 (H1)** | `40px (2.5rem)` / `1.15` | `28px (1.75rem)` / `1.2` | Display Serif, SemiBold (`600`) | Section titles, Page titles |
| **Headline 2 (H2)** | `28px (1.75rem)` / `1.25` | `22px (1.375rem)` / `1.3` | Display Serif, Medium (`500`) | Card titles, Feature clusters |
| **Headline 3 (H3)** | `20px (1.25rem)` / `1.35` | `18px (1.125rem)` / `1.35` | Plus Jakarta Sans, SemiBold (`600`) | Service headers, Sub-sections |
| **Subtitle / Lede** | `18px (1.125rem)` / `1.6` | `16px (1.0rem)` / `1.55` | Plus Jakarta Sans, Light/Regular (`300`/`400`) | Introductory paragraphs |
| **Body Standard** | `15px (0.9375rem)` / `1.65` | `15px (0.9375rem)` / `1.6` | Plus Jakarta Sans, Regular (`400`) | Editorial paragraphs, descriptions |
| **Body Small** | `13px (0.8125rem)` / `1.5` | `13px (0.8125rem)` / `1.5` | Plus Jakarta Sans, Regular (`400`) | Metadata, helper notes, terms |
| **Overline / Badge** | `11px (0.6875rem)` / `1.0` | `11px (0.6875rem)` / `1.0` | Plus Jakarta Sans, Bold (`700`), `tracking-widest` | Category pills, uppercase badges |

---

## 4. Spacing System (8pt Modular Grid)

All layout margins, paddings, and grid gaps adhere to an 8-point base rhythm with generous breathing room:

- `--space-1`: `4px` (tight micro-gaps, badge icons)
- `--space-2`: `8px` (component internal spacing, tags)
- `--space-3`: `12px` (form label to input, micro-elements)
- `--space-4`: `16px` (button padding, mobile card padding)
- `--space-6`: `24px` (desktop card padding, item gutters)
- `--space-8`: `32px` (section inner groupings, modal padding)
- `--space-12`: `48px` (sub-section division on mobile)
- `--space-16`: `64px` (section vertical spacing on tablet)
- `--space-24`: `96px` (generous editorial section margins on desktop)
- `--space-32`: `128px` (hero breathing room on desktop)

---

## 5. Border Radius & Shape System

Avoid generic "pill-everything" or aggressive tech squares. Use soft, organic architectural geometry inspired by rounded wood furniture.

- **Micro (`rounded-md`):** `6px` — Status chips, small badge tags
- **Input (`rounded-xl`):** `12px` — Form inputs, select dropdowns
- **Button (`rounded-full`):** `9999px` — High-action CTAs (only for buttons to emphasize tactile clickability)
- **Card Standard (`rounded-2xl`):** `16px` — Standard content cards, pricing panels
- **Architectural Arch (`rounded-t-[32px]` or `rounded-[28px]`):** `28px–32px` — Featured image frames, hero photo cutouts

---

## 6. Shadow & Surface System

**Strict Rule:** No heavy multi-color drop shadows or glassmorphic blur glows. Surfaces rely on **tone-on-tone contrast, 1px warm borders, and soft diffuse contact shadows**.

- **Surface Flat:** `background: #FAF7F2; border: 1px solid #EBE5DA;` (zero shadow)
- **Surface Card:** `background: #FFFFFF; border: 1px solid #EFEAE1; box-shadow: 0 2px 8px rgba(36, 62, 54, 0.03);`
- **Surface Float (Hover/Modal):** `box-shadow: 0 12px 32px -4px rgba(36, 62, 54, 0.08);`
- **No Glassmorphism:** We completely eliminate `backdrop-blur-md bg-white/20` layers in favor of solid, opaque, tactile warm linen backgrounds.

---

## 7. Button System

| Button Variant | Styling | States | Usage |
| :--- | :--- | :--- | :--- |
| **Primary CTA** | Solid Forest Pine (`#243E36`), Text Warm Alabaster (`#FAF7F2`), `px-7 py-3.5 rounded-full font-semibold` | Hover: `#1D332C`, Scale: subtle `1.01`, Tap: `0.99` | Main booking trigger, final form submit |
| **Secondary Brand** | Soft Sage Tint (`#EAEFEA`), Text Deep Pine (`#243E36`), `px-6 py-3.5 rounded-full font-medium` | Hover: `#DFE7DF` | Secondary exploratory action ("Unsere Räume") |
| **Warm Accent** | Warm Terracotta (`#E8927C`), Text Dark (`#1D2623`), `px-6 py-3.5 rounded-full font-semibold` | Hover: `#E2836C` | Limited high-conversion callouts |
| **Editorial Ghost** | Transparent background, 1px border (`#D8D1C4`), Text Deep Pine (`#243E36`) | Hover: `#F3EEE5` | Low-emphasis secondary links |
| **Text Action** | Underline with generous gap, arrow indicator (`→`), no background | Hover: Arrow slides 3px right | In-text navigation, deep links |

---

## 8. Form & Input System

- **Input Canvas:** Pure white or ultra-soft linen (`#FFFFFF` or `#F7F4EE`)
- **Default Border:** 1px solid `#DDD6C8` (warm sandstone border, never cold `#E2E8F0` gray)
- **Focus State:** 2px ring `#243E36` with 0px offset. Clear, high-contrast, non-glitzy.
- **Labeling:** 13px font, medium weight, placed strictly above the input (never disappearing floating labels).
- **Error State:** Border `#A63B34`, inline friendly explanation below input with a small status dot.

---

## 9. Card Usage Rules

1. **Card Restraint:** Do not place every piece of text inside a floating white card. The page should breathe with editorial whitespace and typography before grouping items.
2. **When to use Cards:** Only when grouping distinct, comparable choices (e.g. 3 booking packages) or interactive wizard steps.
3. **Card Composition:** Cards must feature generous internal padding (`p-6` mobile, `p-8` desktop), clean typography, and avoid visual clutter like 5 different icon badges.

---

## 10. Photography & Visual Asset Treatment

- **Subject Matter:**
  - Real, warm family moments: toddlers interacting with solid beechwood motor toys, parents holding handmade ceramic coffee mugs with latte art, salt room children playing with Himalayan salt granules.
  - Architectural photography of the café: natural light streaming through linen curtains, warm oak seating, tidy minimalist play zones.
- **Color Grading & Treatment:**
  - Warm, slightly muted highlights, soft analog film grain, low contrast in shadows (no crushed blacks, no cold HDR saturation).
- **Anti-Stock Mandate:**
  - Zero generic 3D illustrations.
  - Zero stock models with artificial smiles.
  - Every image must directly communicate Haven Kids Café’s physical space, activities, and ethos.

---

## 11. Motion & Animation Principles

- **Philosophy:** Calm, dignified, responsive. Like turning the page of a high-end architectural monograph.
- **Timing:** Quick entry (`240ms`), gentle ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Prohibited:** Bouncing springs, rotating 3D cards, strobe neon pulses, perpetual floating elements.

---

## 12. Accessibility & Contrast Verification

- **Body Copy:** `#1D2623` on `#FAF7F2` achieves **12.5:1** contrast ratio (surpasses WCAG AAA).
- **Interactive Links:** `#243E36` on `#FAF7F2` achieves **10.8:1** (surpasses WCAG AAA).
- **Touch Targets:** All clickable links, buttons, and navigation controls maintain a minimum touch bounding box of **44 × 44px**.
- **Keyboard Focus:** High-contrast `outline: 2px solid #243E36; outline-offset: 2px;` visible on keyboard tab navigation.

---

## 13. Mobile-First Ergonomics

- Hero height on mobile capped at `75vh` to ensure immediate preview of value proposition without getting trapped in endless vertical hero scroll.
- Bottom-thumb ergonomics: Primary actions positioned within natural thumb reach.
- Typography size on mobile floor at `15px` for body copy, preventing iOS automatic input zoom (which triggers at `<16px`).
- No horizontal scrolling tables or clipped pricing cards.
