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

## Checkout Page (`checkout.html`)

### Overview

The checkout page is a static HTML page with PHP-ready markers (`<!-- DB: -->`). It reuses the same header, nav panel, cart drawer, and footer markup as the product pages (wrapped in `<!-- INCLUDE: header -->`, `<!-- INCLUDE: footer -->`, `<!-- INCLUDE: scripts -->` markers). Page-specific logic lives in `js/checkout.js`.

### Shared Markup

| Marker | Contents |
|--------|----------|
| `<!-- INCLUDE: header -->` | Fixed header (`sk-header--solid`), language pill, lang menu, logo, cart button, hamburger, nav panel, cart drawer, scrim |
| `<!-- INCLUDE: footer -->` | Copyright bar + back-to-top button |
| `<!-- INCLUDE: scripts -->` | i18n locale files + `js/i18n.js` + `js/main.js` + `js/checkout.js` |

The header/nav/cart-drawer markup on `checkout.html` must be **byte-identical** to `product-noble-chamomile.html`. Do **not** alter the shared markup — only insert `<!-- DB: -->` markers for checkout-specific dynamic content.

### Layout

- `<body class="sk-pd-page">` — same spacing variables as product pages.
- Single `<section class="sk-es-section sk-es-section--cream sk-checkout">` wraps all checkout content.
- Desktop (≥ 992 px): grid with form column (left, `minmax(0, 1fr)`) and summary column (right, `minmax(0, 380px)`), summary is `position: sticky` at `top: calc(var(--sk-pd-header-height) + 24px)`.
- Mobile (< 992 px): flex column, summary **first** (collapsed behind "Show order summary" disclosure, `aria-expanded` + `aria-controls`), then form.
- Back link under the header: `index.html#autres-essences-title`, styled as `sk-pd-back`.

### Order Summary (right column)

Cart data is read from `localStorage` key `sukoonCart` via `global.getCart()` and `global.saveCart()`. Each line item renders:

- 72×88 packshot thumbnail (neutral plate, `mix-blend-mode: multiply`)
- Name — 12 px uppercase Jost (translated from `product.{id}` i18n key)
- Tagline — italic Cormorant (translated from `product.{id}.tagline` i18n key, or `item.tagline` fallback)
- Quantity stepper (pill, 32 px) and remove button (trash SVG, `aria-label="Remove"`)
- Line total — right-aligned, formatted via `CURRENCY.format()`

Quantity and remove actions call `global.saveCart()` which persists to localStorage, updates the header badge, and re-renders the drawer instantly.

Totals row:
- `<!-- DB: order.totals -->`
  - Subtotal (sum of `price × qty` across all lines)
  - Shipping = static text "Calculated after confirmation" / "Calculée après confirmation"
  - Total = subtotal

### Form (left column)

Real `<form>`, `novalidate`, each field has `<label>` above the `<input>`, 48 px height, 1 px `--sk-es-line-strong` border, gold focus ring. Error text under each field in readable colour, with `aria-describedby` + `aria-invalid="true"`.

#### a. Contact

| Field | Key | Required | Validation |
|-------|-----|----------|------------|
| Full name | `checkout.fullName` | Yes | Non-empty after trim |
| Phone | `checkout.phone` | Yes | Moroccan mobile: `06/07 XX XX XX XX` or `+212 6/7 XX XX XX XX` (normalise spaces) |
| Email | `checkout.email` | No | Valid email format if filled |

`inputmode="tel"` on phone, `autocomplete="name"`, `autocomplete="tel"`, `autocomplete="email"`.

#### b. Delivery address

| Field | Key | Required |
|-------|-----|----------|
| Street address | `checkout.street` | Yes |
| City | `checkout.city` | Yes (`<datalist>` of main Moroccan cities) |
| Postal code | `checkout.postalCode` | No (`inputmode="numeric"`) |
| Country | `checkout.country` | No (read-only, fixed to Morocco / Maroc) |
| Notes | `checkout.notes` | No (textarea, `maxlength="300"`, live counter) |

`autocomplete="street-address"`, `"address-level2"`, `"postal-code"`.

#### c. Payment

`<!-- DB: payment.methods -->` — radio group (`role="radiogroup"`). Backed by `PAYMENT_METHODS` constant in `js/checkout.js`:

| ID | Label key | State |
|----|-----------|-------|
| `cod` | `checkout.payment.cod` | Selected by default |
| `card` | `checkout.payment.card` | `disabled`, with note `checkout.payment.comingSoon` |

To enable a new method, add an entry to the `PAYMENT_METHODS` array. **No payment provider is integrated.**

#### d. Consent

Required checkbox (`checkout.consent`): "J'ai lu et j'accepte les conditions de vente" / "I accept the terms of sale", with a link to `#` (`checkout.termsOfSale`). No marketing opt-in.

#### e. Submit

Navy pill button, 48 px, full-width on mobile. Text key `checkout.submit` ("Confirmer la commande" / "Place order"). While submitting, the button is disabled and shows a spinner with `checkout.submitting` ("Traitement…" / "Processing…"). Double-click produces exactly one order (guarded by `state.submitting` flag).

Validation: on submit, all errors listed in a top error summary (`role="alert"`); focus is placed on the first invalid field. Blur-based validation on each field thereafter. No browser-native popups (`form.noValidate`).

### Submission Flow

1. Build order object:
   ```js
   {
     orderRef: "SK-YYYYMMDD-XXXX",  // temporary, server assigns real ref
     createdAt: "ISO-8601",
     lang: "fr",
     currency: "USD",
     items: [{ id, name, qty, unitPrice, lineTotal }],
     subtotal: <number>,
     shippingNote: t('checkout.shippingNote'),
     customer: { name, phone, email },          // <!-- DB: customer.fields -->
     address: { street, city, postalCode, country, notes },
     paymentMethod: "cod",
     consent: true
   }
   ```
2. `submitOrder(order)`:
   - Saves to `localStorage['sukoonLastOrder']`
   - Removes `localStorage['sukoonCart']`
   - Calls `global.saveCart({})` (updates header badge → 0, drawer → empty)
   - Clears `sessionStorage['sukoonCheckoutDraft']`
   - Shows confirmation state (hides form + summary)
3. Confirmation is **transient in-memory only** — a page reload with an empty cart shows the empty state, not the confirmation.

### Confirmation State

Shown only immediately after `submitOrder()`. Replaces form + summary. Uses **only** this approved copy:

| Element | FR | EN |
|---------|----|----|
| Eyebrow | `COMMANDE CONFIRMÉE` (`checkout.confirmed`) | `ORDER CONFIRMED` |
| Title | `Merci pour votre commande.` (`checkout.thankYou`) | `Thank you for your order.` |
| Ref label | `Référence de commande` (`checkout.orderRef`) | `Order reference` |
| Recap | Item thumbnails + name + qty | (same) |
| Contact line | `Nous vous contacterons pour confirmer la livraison.` (`checkout.willContact`) | `We will contact you to confirm delivery.` |
| Button 1 | `Retour à la boutique` (`checkout.backToShop`) | `Back to shop` |
| Button 2 | `Continuer ma découverte` (`cartContinue`) | `Continue exploring` |

Buttons 1 and 2 both link to `index.html#autres-essences-title`.

### PHP Migration Contract

`<!-- PHP: replace submitOrder() with POST to /checkout.php, validate server-side, persist, return orderRef -->`

**Endpoint**: `POST /checkout.php` (or `/checkout`) — accepts JSON or form-encoded body matching the order object above. Returns `{ orderRef: "SK-…", status: "ok" }`.

**Server-side validation rules** (mirror client-side):

- **name**: required, 1–100 chars
- **phone**: required, regex `/^(\+212|212)?0?(5|6|7)\d{8}$/` after stripping spaces
- **email**: optional, must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` if provided
- **street**: required, non-empty
- **city**: required, non-empty
- **postalCode**: optional, if provided must be numeric
- **country**: must equal `Morocco` (server-side override, never trust client)
- **paymentMethod**: must be in `PAYMENT_METHODS` list (currently `cod` only)
- **consent**: must be `true`

**Critical**: Prices must be re-read from the database on the server. Never trust `unitPrice` or `subtotal` from the client — recompute from `items[].id` and current product prices.

**Suggested SQL schema** (inline customer columns, single `orders` table):

```sql
CREATE TABLE orders (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_ref     VARCHAR(32)  NOT NULL UNIQUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lang          VARCHAR(8)   NOT NULL DEFAULT 'fr',
    currency      VARCHAR(8)   NOT NULL DEFAULT 'USD',
    subtotal      DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(16) NOT NULL,
    consent       TINYINT(1)   NOT NULL,
    customer_name VARCHAR(100)  NOT NULL,
    customer_phone VARCHAR(20)  NOT NULL,
    customer_email VARCHAR(255),
    address_street TEXT NOT NULL,
    address_city VARCHAR(100)  NOT NULL,
    address_postal VARCHAR(20),
    address_country VARCHAR(50) NOT NULL DEFAULT 'Morocco',
    address_notes TEXT
);

CREATE TABLE order_items (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT UNSIGNED NOT NULL,
    product_id   VARCHAR(64) NOT NULL,
    name         VARCHAR(100) NOT NULL,
    qty          INT NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,
    line_total   DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

**Data flow on migration**:

1. `<!-- DB: title -->` — replace with `"Checkout | Sukoon"` (static)
2. `<!-- DB: meta-description -->` — replace with localized meta description
3. `<!-- DB: order.items -->` (summary + confirmation recap) — loop over order items from the database
4. `<!-- DB: order.totals -->` (subtotal + total) — compute server-side
5. `<!-- DB: customer.fields -->` (contact + delivery inputs) — pre-fill from customer record if returning
6. `<!-- DB: payment.methods -->` — render from `PAYMENT_METHODS` config, not hard-coded HTML
7. `<!-- PHP: replace submitOrder() ... -->` — replace the entire function body with a `fetch('/checkout.php', { method: 'POST', body: JSON.stringify(order) })` call, then handle the response.

### Storage

| Storage | Key | Purpose | Sensitive? |
|---------|-----|---------|------------|
| `sessionStorage` | `sukoonCheckoutDraft` | Form field values (name, phone, email, address, notes, consent, payment) | No |
| `localStorage` | `sukoonLastOrder` | Demo order object (for confirmation on same page load) | No — no payment data |
| `localStorage` | `sukoonCart` | Cart items (cleared on submit) | No — product ids/quantities only |

**Security note**: Never store card data, CVC, or full payment credentials client-side. The `card` payment method is currently disabled. When enabled, integrate a PCI-compliant payment provider iframe or redirect — never collect card fields directly.
