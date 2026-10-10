# PHP Migration Guide

## Overview

The static product pages (`product-{slug}.html`) are generated with PHP migration markers that indicate where dynamic PHP code should be spliced in during migration to a PHP-based backend. Two types of markers are used:

- **DB markers**: `<!-- DB: marker-name -->...content...<!-- /DB -->` — content that comes from the database (product names, descriptions, prices, etc.)
- **IF markers**: `<!-- IF: block-name -->` ... `<!-- /IF: block-name -->` — optional sections that only appear when data exists

**Core principle**: All 6 pages are identical outside DB and IF markers. The stripping regex removes everything inside these markers, and the remaining HTML must match across all pages.

## Key Principles

1. **Flat markers**: Never nest `<!-- DB: -->` inside another `<!-- DB: -->` or `<!-- IF: -->` block.
2. **No `hidden` attributes**: Sections with no data are omitted entirely. Use IF markers for optional blocks.
3. **Single source of truth**: All figures (prices, counts, ratings) come from `data/products.js` catalog.
4. **Forbidden words**: Replace marketing claims that are unverified.

## DB Marker Reference

### Header Markers (in `TEMPLATE_HEADER`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: title -->` | `<title>` tag content (product name + brand) |
| `<!-- DB: meta-description -->` | `<meta>` description content (product lead) |

### Hero Section (`buildHero`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: hero -->` | Wraps entire hero section (single block) |

### Essence Section (`buildEssence`, formerly `buildDescription`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: essence -->` | Wraps entire essence section |
| `<!-- DB: ess-head -->` | Eyebrow + title heading |
| `<!-- DB: ess-body -->` | Body paragraphs |
| `<!-- DB: ess-facts -->` | Truth pillars (sun, cup, heart icons) |

### Ritual Section (`buildBrewing`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: brewing -->` | Wraps entire ritual section |
| `<!-- DB: brew-head -->` | Eyebrow + title + optional lead text |
| `<!-- DB: brew-body -->` | Brewing content (methods or steps) |

### Ingredients & Origin Section (`buildIngredients`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: ingredients -->` | Wraps entire section |
| `<!-- DB: ing-head -->` | Eyebrow + title heading |
| `<!-- DB: ing-rows -->` | Ingredient/origin/nutrition rows |

### Carousel Section (`buildCarousel`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: carousel -->` | Wraps entire carousel (5 cards, excludes current product) |

## IF Marker Reference

| Marker | Purpose | Present in |
|--------|---------|------------|
| `<!-- IF: ingredients_origin -->` | Wraps Ingredients & Origin section | ruby-hibiscus, moroccan-mint only |
| `<!-- IF: reviews -->` | Wraps Reviews section | No pages currently (reserved for future) |

**Note**: IF markers are always present at the same structural position in all 6 files — between the Ritual section and the Carousel section. When the optional content is absent, the IF block is empty. After stripping both DB and IF markers, all files produce identical HTML.

### Reviews IF block structure (template for when reviews are added):

```html
<!-- IF: reviews -->
<!-- DB: reviews -->
<section class="sk-es-section sk-es-section--cream sk-pd-section" id="pdReviews" data-bg="cream" aria-labelledby="pd-rev-title">
    <div class="sk-es-inner">
        <!-- DB: rev-head -->
        <div class="sk-pd-head">...</div>
        <!-- /DB -->
        <!-- DB: rev-body -->
        <div class="sk-pd-reviews-wrap">...</div>
        <!-- /DB -->
    </div>
</section>
<!-- /DB -->
<!-- /IF: reviews -->
```

## Migration Notes

1. **Reviews removed**: Sample reviews, rating row, and review summary removed from all pages. The `<!-- IF: reviews -->` block is present but empty for all 6 products.

2. **UNVERIFIED, confirm with owner** (all claims below are present in generated HTML — unverified):

   | Product | Claim | Value | Status |
   |---------|-------|-------|--------|
   | moroccan-mint | Ingredients | "100% Menthe poivrée" (FR) / "100% Peppermint." (EN) | UNVERIFIED |
   | moroccan-mint | Nutrition table | 0 kcal, 0g fat, 0g carbs, 0g protein (per 2g sachet) | UNVERIFIED |
   | moroccan-mint | Certifications | "Naturel · Végétal" (FR) / "Natural · Herbal" (EN) | UNVERIFIED |
   | moroccan-mint | Brewing temp | 90°C | UNVERIFIED |
   | moroccan-mint | Brewing time | 3-4 minutes | UNVERIFIED |
   | ruby-hibiscus | Sachet count | 20 sachets individuels / 20 individual sachets | UNVERIFIED |
   | ruby-hibiscus | Brewing time | 8 minutes | UNVERIFIED |

   **Missing fields per slug** (in `data/products.js`):

   | Product | Nutrition table | Certifications | Origin value | Eyebrow (hero) |
   |---------|----------------|----------------|-------------|----------------|
   | royal-verbena | No | No | `null` | `essence.eyebrow` |
   | noble-chamomile | No | No | `null` | `essence.eyebrow` |
   | atlas-oregano | No | No | `null` | `essence.eyebrow` |
   | ruby-hibiscus | No | No | `discover.facts.origin.value` | `discover.eyebrow` |
   | heritage-fennel | No | No | `null` | `essence.eyebrow` |
   | moroccan-mint | Yes | Yes | `product.moroccan-mint.origin.html` | `essence.eyebrow` |

3. **Forbidden word replacements**: `fixForbidden` is now a NO-OP (reverted). The following forbidden words remain in the locale data and appear unsubstituted in the generated HTML:

   | Locale | Key | Forbidden word | Page |
   |--------|-----|-----------------|------|
   | FR | `product.royal-verbena.essence.pillar.1.body` | "Apaise l'esprit" | royal-verbena |
   | FR | `product.noble-chamomile.essence.pillar.3.body` | "Apaise le corps et l'esprit" | noble-chamomile |
   | FR | `product.noble-chamomile.lead` | "moments apaisants" | noble-chamomile |
   | EN | `product.noble-chamomile.essence.pillar.3.body` | "Calms" | noble-chamomile (EN) |

   Approved replacement copy was not provided. These lines MUST NOT be auto-substituted — STOP and obtain owner approval before changing.

4. **Carousel**: Shows 5 cards (excludes current product). Each card now uses per-essence tint class:
   - `sk-es-other-media--green` (royal-verbena, moroccan-mint)
   - `sk-es-other-media--sand` (noble-chamomile)
   - `sk-es-other-media--clay` (atlas-oregano)
   - `sk-es-other-media--hibiscus` (ruby-hibiscus)
   - `sk-es-other-media--gold` (heritage-fennel)

5. **Eyebrows**: Hero uses product data `eyebrowKey` (ruby-hibiscus uses `discover.eyebrow`; all others use `essence.eyebrow`). Description section uses `essence.eyebrow`. For ruby-hibiscus, hero and description eyebrows differ. For the other 5 products, both use `essence.eyebow` — a duplicate that mirrors the original `essence.html` template design.

6. **Facts/pillars**: Uses `sk-pd-fact` CSS classes (matching `product-detail.css`). Hairlines span full column width (`align-items: stretch` on `.sk-pd-facts`). List top-aligned with first line of paragraph (`align-items: start` on `.sk-pd-desc-split`).

7. **Spinner**: Hidden by default (no `show` class in static HTML). JS also hides via `setProperty('display', 'none', 'important')`.

8. **Language switching**: `applyInlineLang()` now uses `[data-en]:not([data-en-aria])` selector to skip container buttons. ARIA labels are swapped via `data-en-aria` attribute on container elements (buttons with child SVGs/spans).
