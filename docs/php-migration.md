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

2. **UNVERIFIED, confirm with owner** (moroccan-mint specifically):
   - Nutrition table values: "Calories,0 kcal,Fat,0g,Carbs,0g,Protein,0g"
   - Certification tags: "Naturel · Végétal"
   - Ingredients: "100% Peppermint"
   - Brewing parameters: 90°C, 3-4 minutes

3. **Forbidden word replacements in generator** (`fixForbidden`):
   - FR: "Apaise l'esprit" → "Favorise la clarté mentale" (royal-verbena pillar 1)
   - FR: "Apaise le corps" → "Apporte du réconfort au corps" (noble-chamomile pillar 3)
   - FR: "moments apaisants" → "moments de sérénité" (noble-chamomile lead)
   - EN: "Calms" → "Comforts" (noble-chamomile pillar 3)

4. **Carousel**: Shows 5 cards (excludes current product). All plates use neutral `--sk-es-cream-deep` background — no per-essence tint classes.

5. **Size/spacing**: Product pages use `--pd-pad-y: clamp(56px, 6vw, 96px)` (tighter than landing's `clamp(72px, 9vw, 148px)`). Text measure: 62ch max, 15-16px, line-height 1.7. Nutrition table: max 560px.

6. **Scripts loaded**: `i18n/{en,fr,ar}.js`, `js/i18n.js`, `js/main.js` — NOT `js/product-detail.js` or `data/products.js`.

7. **Fennel pillar 1 override**: "Slows the pace of the evening" / "Ralentit le rythme de la soirée".

8. **Include markers**: Header and footer are shared via `<!-- INCLUDE: header -->` / `<!-- INCLUDE: footer -->` and `<!-- INCLUDE: scripts -->` / `<!-- /INCLUDE: scripts -->` markers for PHP templating.
