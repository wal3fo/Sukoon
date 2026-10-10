# PHP Migration Guide

## Overview

The static product pages (`product-{slug}.html`) are generated with PHP migration markers that indicate where dynamic PHP code should be spliced in during migration to a PHP-based backend. Each marker follows the format:

```html
<!-- DB: marker-name -->...content...<!-- /DB -->
```

## Key Principle: Identical Structure

All 6 product pages are **identical outside DB markers**. The stripping regex `/<!-- DB:[^]*?\/DB -->/g` removes all DB marker content, and the remaining HTML must match across all pages. This means:

- The `<section>` tags and their class names are identical
- The `<div>` wrappers and structural elements are identical
- Only the content inside DB markers varies per product

## DB Marker Reference

### Header Markers (in `TEMPLATE_HEADER`)

| Marker | Purpose | Location |
|--------|---------|----------|
| `<!-- DB: title -->` | Product page `<title>` tag content | `<head>` |
| `<!-- DB: meta-description -->` | Product meta description in `<head>` | `<head>` |

### Section Markers

#### Hero Section (`buildHero`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: hero -->` | Wraps entire hero section (single block) |

#### Description Section (`buildDescription`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: desc-head -->` | Eyebrow + title heading |
| `<!-- DB: desc-body -->` | Description paragraphs |
| `<!-- DB: desc-facts -->` | Key benefits pillars (sun, cup, heart icons) |

#### Brewing Section (`buildBrewing`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: brew-head -->` | Eyebrow + title + optional lead text |
| `<!-- DB: brew-body -->` | Brewing steps, badges, and media image |

#### Ingredients Section (`buildIngredients`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: ing-head -->` | Eyebrow + title heading |
| `<!-- DB: ing-rows -->` | Ingredient rows (composition, origin, nutrition, certifications) |

#### Reviews Section (`buildReviews`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: rev-head -->` | Eyebrow + title heading (includes `hidden` attribute for non-review products) |
| `<!-- DB: rev-body -->` | Review content (empty/hidden for non-review products, full for review products) |

**Reviews variation**: The `hidden` attribute is placed inside DB markers to keep pages identical:
- Non-review products: `<div class="sk-pd-head" hidden>` and `<div class="sk-pd-reviews-wrap" hidden>`
- Review products (moroccan-mint): `<div class="sk-pd-head">` and `<div class="sk-pd-reviews-wrap">` with full content

#### Carousel Section (`buildCarousel`)

| Marker | Purpose |
|--------|---------|
| `<!-- DB: carousel -->` | Wraps entire carousel section (single block) |

## Migration Notes

1. **No nested DB markers**: All markers are flat. Never nest `<!-- DB: -->` inside another `<!-- DB: -->` block.

2. **Forbidden word replacements**: The generator replaces certain marketing terms:
   - FR: "Apaise" → "Favorise la clarté mentale"
   - FR: "apaisants" → "de sérénité"
   - EN: "Calms" → "Soothes"

3. **Reviews data**: Only `moroccan-mint` has reviews. Other 5 products have `reviews: null`, rendering a hidden empty section.

4. **Price**: All products use price `18` (single source from product catalog).

5. **Scripts loaded**: `i18n/{en,fr,ar}.js`, `js/i18n.js`, `js/main.js` — NOT `js/product-detail.js` or `data/products.js`.
