#!/usr/bin/env node
/* Generator: produces 6 static product pages.
   Product copy for 5 essences comes from docs/tools/content.js (approved).
   moroccan-mint copy comes from i18n locale data (unchanged).
   All pages follow the moroccan-mint structure exactly.
   Run: node docs/tools/gen-products.js
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = '/home/wal3fo/Desktop/Sukoon';
const DOCS = path.join(ROOT, 'docs', 'tools');

/* ---- Load approved content ---- */
const contentCtx = { window: {} };
vm.createContext(contentCtx);
const contentCode = fs.readFileSync(path.join(DOCS, 'content.js'), 'utf8');
vm.runInContext(contentCode, contentCtx);
const APPROVED = contentCtx.window.SK_APPROVED_COPY;

/* ---- Load locale data via VM ---- */
const ctx = {};
ctx.window = ctx;
ctx.global = ctx;
ctx.localStorage = { getItem: () => null, setItem: () => {} };
vm.createContext(ctx);
['en', 'fr', 'ar'].forEach(lang => {
    const code = fs.readFileSync(path.join(ROOT, 'i18n', lang + '.js'), 'utf8');
    vm.runInContext(code, ctx);
});
const EN = ctx.SK_LOCALES.en;
const FR = ctx.SK_LOCALES.fr;
const AR = ctx.SK_LOCALES.ar;

function t(key, lang) {
    const loc = lang === 'en' ? EN : (lang === 'ar' ? AR : FR);
    if (Object.prototype.hasOwnProperty.call(loc, key)) return loc[key];
    if (Object.prototype.hasOwnProperty.call(FR, key)) return FR[key];
    return key;
}
function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function tOptional(key, lang) {
    const loc = lang === 'en' ? EN : (lang === 'ar' ? AR : FR);
    if (Object.prototype.hasOwnProperty.call(loc, key)) return loc[key];
    if (Object.prototype.hasOwnProperty.call(FR, key)) return FR[key];
    return '';
}

/* ---- Icon SVG definitions ---- */
const ICONS = {
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    flower: '<ellipse cx="12" cy="6.6" rx="2.6" ry="3.4"/><ellipse cx="12" cy="17.4" rx="2.6" ry="3.4"/><ellipse cx="6.6" cy="12" rx="3.4" ry="2.6"/><ellipse cx="17.4" cy="12" rx="3.4" ry="2.6"/><circle cx="12" cy="12" r="1.5"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5"/><path d="M12 19.5V22"/><path d="M2 12h2.5"/><path d="M19.5 12H22"/><path d="M4.9 4.9l1.8 1.8"/><path d="M17.3 17.3l1.8 1.8"/><path d="M19.1 4.9l-1.8 1.8"/><path d="M6.7 17.3l-1.8 1.8"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
    cup: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8.5A4.5 4.5 0 0 1 13.5 21h-3A4.5 4.5 0 0 1 6 16.5V8Z"/><path d="M6.5 2.5V5"/><path d="M10 2.5V5"/><path d="M13.5 2.5V5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
    thermometer: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
    sparkle: '<path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9Z"/><path d="M18.5 17.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/>',
    check: '<path d="M4 12.5l5 5 L20 6.5" />'
};
function iconSvg(name) {
    return '<svg class="sk-es-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
}

/* ---- Photo mapping (lifestyle photos) ---- */
const PHOTO_MAP = {
    'royal-verbena': '5_verveine',
    'noble-chamomile': '4_chamomille',
    'atlas-oregano': '2_origan',
    'ruby-hibiscus': '1_hibiscus',
    'heritage-fennel': '6_fenouil',
    'moroccan-mint': '3_menthe'
};
const SLUGS = ['royal-verbena', 'noble-chamomile', 'atlas-oregano', 'ruby-hibiscus', 'heritage-fennel', 'moroccan-mint'];

/* ---- Resolve a product's display data ---- */
function resolveProduct(id) {
    const copy = APPROVED[id];
    const p = {
        id: id,
        price: 18,
        image: 'img/products/product-' + id + '.png',
        gallery: 'img/products/product_' + PHOTO_MAP[id] + '.png',
        name_fr: copy.name.fr,
        name_en: copy.name.en,
        tagline_fr: copy.tagline.fr,
        tagline_en: copy.tagline.en,
        lead_fr: copy.lead.fr,
        lead_en: copy.lead.en,
        alt_fr: t('product.' + id + '.alt'),
        alt_en: t('product.' + id + '.alt', 'en'),
        eyebrow_fr: t('essence.eyebrow'),
        eyebrow_en: t('essence.eyebrow', 'en'),
        back_fr: t('backToEssences'),
        back_en: t('backToEssences', 'en'),
        cart_fr: t('addToCart'),
        cart_en: t('addToCart', 'en'),
        why_choose_fr: t('whyChoose'),
        why_choose_en: t('whyChoose', 'en'),
        taste_fr: copy.taste.fr,
        taste_en: copy.taste.en,
        taste_label_fr: tOptional('product.' + id + '.why.taste.label') || t('discover.facts.taste.label'),
        taste_label_en: tOptional('product.' + id + '.why.taste.label', 'en') || t('discover.facts.taste.label', 'en'),
        composition_fr: copy.composition.fr,
        composition_en: copy.composition.en,
        composition_label_fr: tOptional('product.' + id + '.why.composition.label') || t('discover.facts.composition.label'),
        composition_label_en: tOptional('product.' + id + '.why.composition.label', 'en') || t('discover.facts.composition.label', 'en'),
        ingredients_label_fr: t('ingredients'),
        ingredients_label_en: t('ingredients', 'en'),
        ingredients_value_fr: copy.ingredients.fr,
        ingredients_value_en: copy.ingredients.en,
        ess_title_fr: copy.essence_title.fr,
        ess_title_en: copy.essence_title.en,
        ess_body_fr: copy.essence_body.fr,
        ess_body_en: copy.essence_body.en,
        ess_facts: copy.pillars.map(function(pillar, i) {
            const icons = ['sun', 'cup', 'heart'];
            return {
                icon: icons[i] || 'sun',
                value_fr: pillar.fr,
                value_en: pillar.en
            };
        }),
        brew_eyebrow_fr: t('ritual.eyebrow'),
        brew_eyebrow_en: t('ritual.eyebrow', 'en'),
        brew_title_fr: copy.ritual_title.fr,
        brew_title_en: copy.ritual_title.en,
        brew_steps_fr: copy.steps.map(s => s.fr),
        brew_steps_en: copy.steps.map(s => s.en),
        brew_badges: [
            { icon: 'thermometer', text_fr: copy.badges.temp.fr, text_en: copy.badges.temp.en },
            { icon: 'clock', text_fr: copy.badges.time.fr, text_en: copy.badges.time.en },
            { icon: 'cup', text_fr: copy.badges.serve.fr, text_en: copy.badges.serve.en }
        ],
        hasIngredientsOrigin: false,
        hasReviews: false
    };
    return p;
}

/* ---- Resolve moroccan-mint (uses i18n locale data, unchanged copy) ---- */
function resolveMint() {
    const p = {
        id: 'moroccan-mint',
        price: 18,
        image: 'img/products/product-moroccan-mint.png',
        gallery: 'img/products/product_3_menthe.png',
        name_fr: t('product.moroccan-mint'),
        name_en: t('product.moroccan-mint', 'en'),
        tagline_fr: t('product.moroccan-mint.tagline'),
        tagline_en: t('product.moroccan-mint.tagline', 'en'),
        lead_fr: t('product.moroccan-mint.lead'),
        lead_en: t('product.moroccan-mint.lead', 'en'),
        alt_fr: t('product.moroccan-mint.alt'),
        alt_en: t('product.moroccan-mint.alt', 'en'),
        eyebrow_fr: t('essence.eyebrow'),
        eyebrow_en: t('essence.eyebrow', 'en'),
        back_fr: t('backToEssences'),
        back_en: t('backToEssences', 'en'),
        cart_fr: t('addToCart'),
        cart_en: t('addToCart', 'en'),
        why_choose_fr: t('whyChoose'),
        why_choose_en: t('whyChoose', 'en'),
        taste_fr: t('product.moroccan-mint.why.taste.value'),
        taste_en: t('product.moroccan-mint.why.taste.value', 'en'),
        taste_label_fr: tOptional('product.moroccan-mint.why.taste.label') || t('discover.facts.taste.label'),
        taste_label_en: tOptional('product.moroccan-mint.why.taste.label', 'en') || t('discover.facts.taste.label', 'en'),
        composition_fr: t('product.moroccan-mint.why.composition.value'),
        composition_en: t('product.moroccan-mint.why.composition.value', 'en'),
        composition_label_fr: tOptional('product.moroccan-mint.why.composition.label') || t('discover.facts.composition.label'),
        composition_label_en: tOptional('product.moroccan-mint.why.composition.label', 'en') || t('discover.facts.composition.label', 'en'),
        ingredients_label_fr: t('ingredients'),
        ingredients_label_en: t('ingredients', 'en'),
        ingredients_value_fr: t('product.moroccan-mint.ingredients.html'),
        ingredients_value_en: t('product.moroccan-mint.ingredients.html', 'en'),
        ess_title_fr: t('product.moroccan-mint.essence.title'),
        ess_title_en: t('product.moroccan-mint.essence.title', 'en'),
        ess_paras_fr: [
            t('product.moroccan-mint.description.para.1'),
            t('product.moroccan-mint.description.para.2'),
            t('product.moroccan-mint.description.para.3')
        ],
        ess_paras_en: [
            t('product.moroccan-mint.description.para.1', 'en'),
            t('product.moroccan-mint.description.para.2', 'en'),
            t('product.moroccan-mint.description.para.3', 'en')
        ],
        ess_facts: [
            { icon: 'sun', value_fr: t('product.moroccan-mint.description.fact.1.value'), value_en: t('product.moroccan-mint.description.fact.1.value', 'en') },
            { icon: 'cup', value_fr: t('product.moroccan-mint.description.fact.2.value'), value_en: t('product.moroccan-mint.description.fact.2.value', 'en') }
        ],
        brew_eyebrow_fr: t('ritual.eyebrow'),
        brew_eyebrow_en: t('ritual.eyebrow', 'en'),
        brew_title_fr: t('product.moroccan-mint.ritual.title'),
        brew_title_en: t('product.moroccan-mint.ritual.title', 'en'),
        brew_lead_fr: t('product.moroccan-mint.ritual.lead'),
        brew_lead_en: t('product.moroccan-mint.ritual.lead', 'en'),
        brew_type: 'methods',
        ing_eyebrow_fr: t('ingredients.eyebrow'),
        ing_eyebrow_en: t('ingredients.eyebrow', 'en'),
        ing_title_fr: t('ingredients'),
        ing_title_en: t('ingredients', 'en'),
        hasIngredientsOrigin: true,
        hasReviews: false,
        isMint: true
    };

    /* --- Mint brewing methods (unchanged) --- */
    p.brew_methods = [
        {
            title_fr: t('product.moroccan-mint.ritual.method.1.title'),
            title_en: t('product.moroccan-mint.ritual.method.1.title', 'en'),
            steps: [
                { fr: t('product.moroccan-mint.ritual.method.1.step.1.label'), en: t('product.moroccan-mint.ritual.method.1.step.1.label', 'en'), hint_fr: t('product.moroccan-mint.ritual.method.1.step.1.hint'), hint_en: t('product.moroccan-mint.ritual.method.1.step.1.hint', 'en') },
                { fr: t('product.moroccan-mint.ritual.method.1.step.2.label'), en: t('product.moroccan-mint.ritual.method.1.step.2.label', 'en'), hint_fr: t('product.moroccan-mint.ritual.method.1.step.2.hint'), hint_en: t('product.moroccan-mint.ritual.method.1.step.2.hint', 'en') },
                { fr: t('product.moroccan-mint.ritual.method.1.step.3.label'), en: t('product.moroccan-mint.ritual.method.1.step.3.label', 'en'), hint_fr: t('product.moroccan-mint.ritual.method.1.step.3.hint'), hint_en: t('product.moroccan-mint.ritual.method.1.step.3.hint', 'en') }
            ],
            tip_label_fr: t('product.moroccan-mint.ritual.tip.label'),
            tip_label_en: t('product.moroccan-mint.ritual.tip.label', 'en'),
            tip_fr: t('product.moroccan-mint.ritual.method.1.tip'),
            tip_en: t('product.moroccan-mint.ritual.method.1.tip', 'en')
        },
        {
            title_fr: t('product.moroccan-mint.ritual.method.2.title'),
            title_en: t('product.moroccan-mint.ritual.method.2.title', 'en'),
            steps: [
                { fr: t('product.moroccan-mint.ritual.method.2.step.1.label'), en: t('product.moroccan-mint.ritual.method.2.step.1.label', 'en'), hint_fr: t('product.moroccan-mint.ritual.method.2.step.1.hint'), hint_en: t('product.moroccan-mint.ritual.method.2.step.2.hint', 'en') },
                { fr: t('product.moroccan-mint.ritual.method.2.step.2.label'), en: t('product.moroccan-mint.ritual.method.2.step.2.label', 'en'), hint_fr: t('product.moroccan-mint.ritual.method.2.step.2.hint'), hint_en: t('product.moroccan-mint.ritual.method.2.step.2.hint', 'en') },
                { fr: t('product.moroccan-mint.ritual.method.2.step.3.label'), en: t('product.moroccan-mint.ritual.method.2.step.3.label', 'en'), hint_fr: t('product.moroccan-mint.ritual.method.2.step.3.hint'), hint_en: t('product.moroccan-mint.ritual.method.2.step.3.hint', 'en') }
            ]
        },
        {
            title_fr: t('product.moroccan-mint.ritual.method.3.title'),
            title_en: t('product.moroccan-mint.ritual.method.3.title', 'en'),
            list_fr: [t('product.moroccan-mint.ritual.method.3.list.1'), t('product.moroccan-mint.ritual.method.3.list.2'), t('product.moroccan-mint.ritual.method.3.list.3')],
            list_en: [t('product.moroccan-mint.ritual.method.3.list.1', 'en'), t('product.moroccan-mint.ritual.method.3.list.2', 'en'), t('product.moroccan-mint.ritual.method.3.list.3', 'en')]
        }
    ];

    /* --- Mint ingredients (with nutrition + certifications as ONE pill) --- */
    p.ingredients_rows = [
        [
            { label_fr: t('ingredients'), label_en: t('ingredients', 'en'), html_fr: t('product.moroccan-mint.ingredients.html'), html_en: t('product.moroccan-mint.ingredients.html', 'en') },
            { label_fr: t('origin'), label_en: t('origin', 'en'), html_fr: t('product.moroccan-mint.origin.html'), html_en: t('product.moroccan-mint.origin.html', 'en') }
        ],
        [
            { label_fr: t('nutrition'), label_en: t('nutrition', 'en'), table_fr: t('product.moroccan-mint.nutrition.table'), table_en: t('product.moroccan-mint.nutrition.table', 'en') },
            { label_fr: t('certifications'), label_en: t('certifications', 'en'), tags_fr: t('product.moroccan-mint.certifications.tags'), tags_en: t('product.moroccan-mint.certifications.tags', 'en'), tags_single: true }
        ]
    ];

    return p;
}

/* ---- TEMPLATE: HTML head + body open + header ---- */
const TEMPLATE_HEADER = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- DB: title -->Sukoon<!-- /DB --></title>
    <meta content="<!-- DB: meta-description -->Sukoon herbal teas<!-- /DB -->" name="description">
    <link href="img/favicon.ico" rel="icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Playfair+Display:wght@700;900&family=Jost:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet">
    <link href="lib/animate/animate.min.css" rel="stylesheet">
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/styles.css" rel="stylesheet">
</head>
<body class="sk-pd-page">
    <!-- Spinner -->
    <div id="spinner" class="bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
    </div>
    <!-- INCLUDE: header -->
    <header class="sk-header sk-header--solid" id="skHeader">
        <div class="sk-bar">
            <div class="sk-left">
                <div class="sk-lang-pill" id="skLangPill">
                    <button type="button" class="sk-lang-btn" id="skLangBtn" aria-label="Changer de langue" aria-haspopup="listbox" aria-expanded="false" aria-controls="skLangMenu" data-en-aria="Change language">
                        <svg class="sk-icon sk-globe" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
                        </svg>
                        <span class="sk-lang-code" id="skLangCode">FR</span>
                        <svg class="sk-icon sk-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <div class="sk-lang-menu" id="skLangMenu" role="listbox" aria-label="Language" tabindex="-1">
                        <button type="button" class="sk-lang-item" role="option" data-lang="fr" data-name="Français" aria-selected="true">
                            <span class="sk-lang-name">Français</span>
                            <svg class="sk-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12.5l5 5 L20 6.5" /></svg>
                        </button>
                        <button type="button" class="sk-lang-item" role="option" data-lang="en" data-name="English" aria-selected="false">
                            <span class="sk-lang-name">English</span>
                            <svg class="sk-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12.5l5 5 L20 6.5" /></svg>
                        </button>
                        <button type="button" class="sk-lang-item" role="option" data-lang="ar" data-name="\u0627\u0644\u0639\u0631\u0628\u064a\u0629" aria-selected="false">
                            <span class="sk-lang-name">\u0627\u0644\u0639\u0631\u0628\u064a\u0629</span>
                            <svg class="sk-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12.5l5 5 L20 6.5" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="sk-center">
                <a href="index.html" class="sk-logo" id="skLogo" aria-label="Sukoon Home">
                    <span class="sk-wordmark">SUKOON</span>
                    <span class="sk-tagline">LA FORCE DU CALME</span>
                </a>
            </div>
            <div class="sk-right">
                <button type="button" class="sk-icon-btn" id="skCartBtn" aria-label="Ouvrir le panier" data-en-aria="Open cart" aria-controls="skCartDrawer" aria-expanded="false">
                    <svg class="sk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span class="sk-cart-badge" id="skCartBadge" hidden>0</span>
                </button>
                <button type="button" class="sk-icon-btn sk-hamburger-btn" id="skHamburger" aria-label="Ouvrir le menu" data-en-aria="Open menu" aria-controls="skNavPanel" aria-expanded="false">
                    <svg class="sk-icon sk-hamburger-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <line x1="2.5" y1="7" x2="21.5" y2="7" /><line x1="2.5" y1="12" x2="21.5" y2="12" />
                        <line x1="2.5" y1="17" x2="21.5" y2="17" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="sk-scrim" id="skScrim" hidden></div>
    </header>

    <div class="sk-scrim" id="skScrimMobile" hidden></div>

    <nav class="sk-nav-panel" id="skNavPanel" aria-label="Main menu" aria-hidden="true" tabindex="-1">
        <div class="sk-nav-head">
            <span class="sk-nav-head-title" data-en="Menu">Menu</span>
            <button type="button" class="sk-icon-btn" id="skPanelClose" aria-label="Fermer le menu" data-en-aria="Close menu">
                <svg class="sk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
                </svg>
            </button>
        </div>
        <ul class="sk-nav-list" id="skNavList">
            <li><a class="sk-nav-link" href="index.html" data-en="Home">Accueil</a></li>
            <li><a class="sk-nav-link" href="index.html#about" data-en="About">À propos</a></li>
            <li><a class="sk-nav-link" href="index.html#store" data-en="Products">Produits</a></li>
            <li><a class="sk-nav-link" href="index.html#store" data-en="Store">Boutique</a></li>
            <li><a class="sk-nav-link" href="index.html#contact" data-en="Contact">Contact</a></li>
        </ul>
    </nav>

    <aside class="sk-cart-drawer" id="skCartDrawer" role="complementary" aria-label="Shopping cart" aria-hidden="true" tabindex="-1">
        <div class="sk-cart-head">
            <span class="sk-nav-head-title" data-en="Your Cart">Votre Panier</span>
            <button type="button" class="sk-icon-btn" id="skCartClose" aria-label="Fermer le panier" data-en-aria="Close cart">
                <svg class="sk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
        </div>
        <div class="sk-cart-body" id="skCartBody">
            <div class="sk-cart-empty">
                <svg class="sk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <p data-en="Your cart is empty">Votre panier est vide</p>
            </div>
        </div>
        <div class="sk-cart-foot" id="skCartFoot" hidden>
            <div class="sk-cart-total">
                <span data-en="Total">Total</span>
                <span class="sk-cart-amount" id="skCartTotal">$0.00</span>
            </div>
            <button type="button" class="sk-cart-cta" data-en="Checkout">Passer la commande</button>
        </div>
    </aside>
`;

const TEMPLATE_FOOTER = `
    <!-- INCLUDE: footer -->
    <div class="container-fluid copyright py-4">
        <div class="container">
            <div class="row">
                <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
                    &copy; <a class="fw-medium" href="#">Sukoon</a>, All Rights Reserved. Crafted with intention in Morocco.
                </div>
                <div class="col-md-6 text-center text-md-end">
                    Designed By <a class="fw-medium" href="https://maruev.com">Maruev</a>
                </div>
            </div>
        </div>
    </div>
    <a href="#" class="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top"><i class="bi bi-arrow-up"></i></a>
    <!-- /INCLUDE: footer -->
    <!-- INCLUDE: scripts -->
    <script src="i18n/en.js"></script>
    <script src="i18n/fr.js"></script>
    <script src="i18n/ar.js"></script>
    <script src="js/i18n.js"></script>
    <script src="js/main.js"></script>
    <!-- /INCLUDE: scripts -->
</body>
</html>`;

/* ---- HTML section builders ---- */

function buildWhyRows(p) {
    const tasteHtml = '<span class="sk-pd-why-icon">' + iconSvg('leaf') + '</span>' +
        '<div class="sk-pd-why-body"><span class="sk-pd-why-label" data-en="' + esc(p.taste_label_en) + '">' + esc(p.taste_label_fr) + '</span>' +
        '<span class="sk-pd-why-value" data-en="' + esc(p.taste_en) + '">' + esc(p.taste_fr) + '</span></div>';
    const compHtml = '<span class="sk-pd-why-icon">' + iconSvg('flower') + '</span>' +
        '<div class="sk-pd-why-body"><span class="sk-pd-why-label" data-en="' + esc(p.composition_label_en) + '">' + esc(p.composition_label_fr) + '</span>' +
        '<span class="sk-pd-why-value" data-en="' + esc(p.composition_en) + '">' + esc(p.composition_fr) + '</span></div>';
    return '                    <li class="sk-pd-why-item">\n' +
        '                        ' + tasteHtml.replace(/<span class="sk-pd-why-icon">/, '<span class="sk-pd-why-icon">') + '\n' +
        '                    </li>\n' +
        '                    <li class="sk-pd-why-item">\n' +
        '                        ' + compHtml + '\n' +
        '                    </li>';
}

function buildHero(p) {
    const whyItems = p.taste_fr ? buildWhyRows(p) : '';
    const imgW = 427, imgH = 325;

    return '    <!-- DB: hero -->\n' +
        '    <section class="sk-es-section sk-es-section--cream sk-es-section--split sk-pd-hero" id="pdHero" data-bg="cream" aria-label="' + esc(p.name_fr) + '">\n' +
        '        <div class="sk-es-inner sk-es-split">\n' +
        '            <div class="sk-pd-back-wrap">\n' +
        '                <a href="index.html" class="sk-pd-back" id="skPdBack">\n' +
        '                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">\n' +
        '                        <path d="M15 18L9 12l6-6" />\n' +
        '                    </svg>\n' +
        '                    <span data-en="' + esc(p.back_en) + '">' + esc(p.back_fr) + '</span>\n' +
        '                </a>\n' +
        '            </div>\n' +
        '            <figure class="sk-es-discover-media sk-pd-gallery-main" id="skPdGallery">\n' +
        '                <img class="sk-es-img" src="' + p.gallery + '" alt="' + esc(p.alt_fr) + '" data-en-alt="' + esc(p.alt_en) + '" id="skPdMainImg" width="' + imgW + '" height="325" loading="eager" decoding="async">\n' +
        '                <div class="sk-pd-thumbs" id="skPdThumbs" role="group" aria-label="Gallery thumbnails">\n' +
        '                    <button type="button" class="sk-pd-thumb is-active" data-thumb="' + p.image + '" data-en-alt="' + esc(p.alt_en) + '" aria-label="Thumbnail">\n' +
        '                        <img src="' + p.image + '" alt="' + esc(p.alt_fr) + '" loading="lazy" decoding="async" width="426" height="325">\n' +
        '                    </button>\n' +
        '                </div>\n' +
        '            </figure>\n' +
        '            <div class="sk-es-discover-body sk-pd-info">\n' +
        '                <p class="sk-es-eyebrow sk-es-eyebrow--gold sk-reveal" id="skPdEyebrow">\n' +
        '                    <span class="sk-es-eyebrow-text" data-en="' + esc(p.eyebrow_en) + '">' + esc(p.eyebrow_fr) + '</span>\n' +
        '                </p>\n' +
        '                <h1 class="sk-pd-product-title" id="skPdTitle" data-en="' + esc(p.name_en) + '">' + esc(p.name_fr) + '</h1>\n' +
        '                <p class="sk-pd-tagline" id="skPdTagline" data-en="' + esc(p.tagline_en) + '">' + esc(p.tagline_fr) + '</p>\n' +
        '                <p class="sk-es-lead sk-pd-lead" id="skPdLead" data-en="' + esc(p.lead_en) + '">' + esc(p.lead_fr) + '</p>\n' +
        '                <div class="sk-pd-price" id="skPdPrice">\n' +
        '                    <span class="sk-pd-price-amount">$' + p.price + '.00</span>\n' +
        '                    <span class="sk-pd-price-del"></span>\n' +
        '                </div>\n' +
        '                <div class="sk-pd-purchase">\n' +
        '                    <span class="sk-pd-qty-label" data-en="' + esc(t('quantity', 'en')) + '">' + esc(t('quantity', 'fr')) + '</span>\n' +
        '                    <div class="sk-pd-qty" role="group" aria-label="Select quantity">\n' +
        '                        <button type="button" class="sk-pd-qty-btn" id="skPdMinus" aria-label="' + esc(t('decreaseQty', 'en')) + '">&minus;</button>\n' +
        '                        <input type="text" class="sk-pd-qty-val" value="1" id="skPdQty" readonly aria-live="polite">\n' +
        '                        <button type="button" class="sk-pd-qty-btn" id="skPdPlus" aria-label="' + esc(t('increaseQty', 'en')) + '">+</button>\n' +
        '                    </div>\n' +
        '                    <button type="button" class="sk-pd-cart add-to-cart-btn" id="skPdCartBtn"\n' +
        '                        data-product-id="' + p.id + '"\n' +
        '                        data-product-name="' + esc(p.name_fr) + '"\n' +
        '                        data-product-price="' + p.price + '.00"\n' +
        '                        data-product-image="' + p.image + '">\n' +
        '                        <span data-en="' + esc(p.cart_en) + '">' + esc(p.cart_fr) + '</span>\n' +
        '                        <svg class="sk-es-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">\n' +
        '                            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />\n' +
        '                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />\n' +
        '                        </svg>\n' +
        '                    </button>\n' +
        '                </div>\n' +
        (whyItems ? '                <div class="sk-pd-why-wrap" id="skPdWhyWrap">\n' +
            '                    <p class="sk-es-eyebrow sk-es-eyebrow--gold">\n' +
            '                        <span class="sk-es-eyebrow-text" data-en="' + esc(p.why_choose_en) + '">' + esc(p.why_choose_fr) + '</span>\n' +
            '                    </p>\n' +
            '                    <ul class="sk-pd-why" id="skPdWhy" aria-label="' + esc(p.why_choose_en) + '">\n' +
            whyItems + '\n' +
            '                    </ul>\n' +
            '                </div>\n' : '') +
        '                <div class="sk-pd-ingredients-hairline">\n' +
        '                    <p class="sk-pd-ingredients-label" data-en="' + esc(p.ingredients_label_en) + '">' + esc(p.ingredients_label_fr) + '</p>\n' +
        '                    <p class="sk-pd-ingredients-value" data-en="' + esc(p.ingredients_value_en) + '">' + esc(p.ingredients_value_fr) + '</p>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </section>\n' +
        '    <!-- /DB -->';
}

function buildEssence(p) {
    let factsHtml = '';
    if (p.ess_facts && p.ess_facts.length) {
        factsHtml = p.ess_facts.map(function(f) {
            return '                    <li class="sk-pd-fact">\n' +
                '                        <span class="sk-pd-fact-icon" aria-hidden="true">\n' +
                '                            ' + iconSvg(f.icon) + '\n' +
                '                        </span>\n' +
                '                        <span class="sk-pd-fact-body">\n' +
                '                            <span class="sk-pd-fact-value" data-en="' + esc(f.value_en) + '">' + esc(f.value_fr) + '</span>\n' +
                '                        </span>\n' +
                '                    </li>';
        }).join('\n');
    }

    let bodyHtml = '';
    if (p.ess_body_fr) {
        bodyHtml = '                    <p class="sk-es-lead sk-pd-ess-body" data-en="' + esc(p.ess_body_en) + '">' + esc(p.ess_body_fr) + '</p>\n';
    } else if (p.ess_paras_fr && p.ess_paras_fr.length) {
        bodyHtml = p.ess_paras_fr.map(function(para, i) {
            return '                    <p class="sk-es-lead sk-pd-ess-body" data-en="' + esc(p.ess_paras_en[i]) + '">' + esc(para) + '</p>';
        }).join('\n');
    }

    const factsUl = factsHtml ? '                <ul class="sk-pd-facts sk-reveal" data-reveal-delay="90" aria-label="Key benefits">\n' +
        factsHtml + '\n' +
        '                </ul>\n' : '';

    return '    <!-- DB: essence -->\n' +
        '    <section class="sk-es-section sk-es-section--cream sk-pd-section" id="pdEssence" data-bg="cream" aria-labelledby="pd-ess-title">\n' +
        '        <div class="sk-es-inner">\n' +
        '            <!-- DB: ess-head -->\n' +
        '            <div class="sk-pd-head">\n' +
        '                <h2 class="sk-es-title sk-reveal" data-reveal-delay="90" id="pd-ess-title" data-en="' + esc(p.ess_title_en) + '">' + esc(p.ess_title_fr) + '</h2>\n' +
        '            </div>\n' +
        '            <!-- /DB -->\n' +
        '            <div class="sk-pd-desc-split">\n' +
        '                <!-- DB: ess-body -->\n' +
        '                <div class="sk-pd-desc-copy">\n' +
        bodyHtml +
        '                </div>\n' +
        '                <!-- /DB -->\n' +
        '                <!-- DB: ess-facts -->\n' +
        factsUl +
        '                <!-- /DB -->\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </section>\n' +
        '    <!-- /DB -->';
}

function buildRitual(p) {
    let headHtml = '            <!-- DB: brew-head -->\n' +
        '            <div class="sk-pd-head">\n' +
        '                <p class="sk-es-eyebrow sk-es-eyebrow--gold sk-reveal"><span class="sk-es-eyebrow-text" data-en="' + esc(p.brew_eyebrow_en) + '">' + esc(p.brew_eyebrow_fr) + '</span></p>\n' +
        '                <h2 class="sk-es-title sk-reveal" data-reveal-delay="90" id="pd-brew-title" data-en="' + esc(p.brew_title_en) + '">' + esc(p.brew_title_fr) + '</h2>\n';
    if (p.brew_lead_fr) {
        headHtml += '                <p class="sk-es-lead sk-reveal" data-reveal-delay="90" data-en="' + esc(p.brew_lead_en) + '">' + esc(p.brew_lead_fr) + '</p>\n';
    }
    headHtml += '            </div>\n            <!-- /DB -->\n';

    let bodyHtml = '';

    if (p.brew_type === 'methods') {
        /* ---- moroccan-mint: multi-method layout (unchanged) ---- */
        bodyHtml = '            <!-- DB: brew-body -->\n' +
            '            <div class="sk-pd-brew-wrap">\n';
        if (p.brew_methods) {
            p.brew_methods.forEach(function(method, mi) {
                bodyHtml += '                    <div class="sk-pd-brew">\n' +
                    '                        <h3 class="sk-pd-brew-title" data-en="' + esc(method.title_en) + '">' + esc(method.title_fr) + '</h3>\n';
                if (method.steps) {
                    bodyHtml += '                        <ol class="sk-pd-brew-steps">\n';
                    method.steps.forEach(function(step, si) {
                        bodyHtml += '                            <li class="sk-pd-brew-item">\n' +
                            '                                <div class="sk-pd-brew-num">' + String(si + 1).padStart(2, '0') + '</div>\n' +
                            '                                <div class="sk-pd-brew-step">\n' +
                            '                                    <span class="sk-pd-brew-label" data-en="' + esc(step.en) + '">' + esc(step.fr) + '</span>\n';
                        if (step.hint_fr) {
                            bodyHtml += '                                    <span class="sk-pd-brew-hint" data-en="' + esc(step.hint_en) + '">' + esc(step.hint_fr) + '</span>\n';
                        }
                        bodyHtml += '                                </div>\n                            </li>\n';
                    });
                    bodyHtml += '                        </ol>\n';
                }
                if (method.tip_fr) {
                    bodyHtml += '                        <div class="sk-pd-brew-tip">\n' +
                        '                            <strong data-en="' + esc(method.tip_label_en) + '">' + esc(method.tip_label_fr) + '</strong>\n' +
                        '                            <p data-en="' + esc(method.tip_en) + '">' + esc(method.tip_fr) + '</p>\n' +
                        '                        </div>\n';
                }
                if (method.list_fr) {
                    bodyHtml += '                        <ul class="sk-pd-list">\n';
                    method.list_fr.forEach(function(item, li) {
                        bodyHtml += '                            <li data-en="' + esc(method.list_en[li]) + '">' + esc(item) + '</li>\n';
                    });
                    bodyHtml += '                        </ul>\n';
                }
                bodyHtml += '                    </div>\n';
            });
        }
        bodyHtml += '            </div>\n            <!-- /DB -->\n';
    } else {
        /* ---- 4 essences: steps column + badges column ---- */
        const stepsHtml = p.brew_steps_fr.map(function(s, i) {
            return '                    <li class="sk-pd-brew-item">\n' +
                '                        <div class="sk-pd-brew-num">' + String(i + 1).padStart(2, '0') + '</div>\n' +
                '                        <div class="sk-pd-brew-step">\n' +
                '                            <span class="sk-pd-brew-label" data-en="' + esc(p.brew_steps_en[i]) + '">' + esc(s) + '</span>\n' +
                '                        </div>\n' +
                '                    </li>';
        }).join('\n');

        const badgesHtml = p.brew_badges.map(function(b) {
            return '                    <div class="sk-pd-brew-badge">\n' +
                '                        <span class="sk-pd-brew-badge-icon" aria-hidden="true">' + iconSvg(b.icon) + '</span>\n' +
                '                        <span class="sk-pd-brew-badge-text" data-en="' + esc(b.text_en) + '">' + esc(b.text_fr) + '</span>\n' +
                '                    </div>';
        }).join('\n');

        bodyHtml = '            <!-- DB: brew-body -->\n' +
            '            <div class="sk-pd-brew-wrap sk-pd-brew-wrap--2col">\n' +
            '                <div class="sk-pd-brew">\n' +
                            '                    <h3 class="sk-pd-brew-title" data-en="Hot Preparation">' + esc(t('product.moroccan-mint.ritual.method.1.title')) + '</h3>\n' +
            '                    <ol class="sk-pd-brew-steps">\n' +
            stepsHtml + '\n' +
            '                    </ol>\n' +
            '                </div>\n' +
            '                <div class="sk-pd-brew">\n' +
            '                    <ul class="sk-pd-brew-badges">\n' +
            badgesHtml + '\n' +
            '                    </ul>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <!-- /DB -->\n';
    }

    return '    <!-- DB: brewing -->\n' +
        '    <section class="sk-es-section sk-es-section--navy sk-pd-section" id="pdBrewing" data-bg="navy" aria-labelledby="pd-brew-title">\n' +
        '        <div class="sk-es-inner">\n' +
        headHtml +
        bodyHtml +
        '        </div>\n' +
        '    </section>\n' +
        '    <!-- /DB -->';
}

function buildIngredients(p) {
    const rowsHtml = p.ingredients_rows.map(function(row) {
        const cells = row.map(function(cell) {
            let valueHtml = '';
            if (cell.html_en) {
                valueHtml = '<div class="sk-pd-io-value" data-en="' + esc(cell.html_en) + '">' + esc(cell.html_fr) + '</div>';
            } else if (cell.table_en) {
                const frArr = cell.table_fr.split(',');
                const enArr = cell.table_en.split(',');
                valueHtml = '<table class="sk-pd-table"><tbody>';
                for (let i = 0; i < enArr.length; i += 2) {
                    valueHtml += '<tr><td class="sk-pd-table-label" data-en="' + esc(enArr[i]) + '">' + esc(frArr[i]) + '</td><td class="sk-pd-table--end" data-en="' + esc(enArr[i + 1]) + '">' + esc(frArr[i + 1]) + '</td></tr>';
                }
                valueHtml += '</tbody></table>';
            } else if (cell.tags_en && cell.tags_single) {
                valueHtml = '<span class="sk-pd-certifications-pill" data-en="' + esc(cell.tags_en) + '">' + esc(cell.tags_fr) + '</span>';
            } else if (cell.tags_en) {
                const enTags = String(cell.tags_en).split('·').map(function(t) { return t.trim(); });
                const frTags = String(cell.tags_fr).split('·').map(function(t) { return t.trim(); });
                valueHtml = '<ul class="sk-pd-tags">';
                enTags.forEach(function(t, i) {
                    valueHtml += '<li class="sk-pd-tag" data-en="' + esc(t) + '">' + esc(frTags[i]) + '</li>';
                });
                valueHtml += '</ul>';
            } else if (cell.value_en) {
                valueHtml = '<div class="sk-pd-io-value" data-en="' + esc(cell.value_en) + '">' + esc(cell.value_fr) + '</div>';
            } else {
                valueHtml = '<div class="sk-pd-io-value"><span class="sk-pd-origin-dash">&mdash;</span></div>';
            }
            return '                        <div class="sk-pd-io-cell">\n' +
                '                            <span class="sk-pd-io-label" data-en="' + esc(cell.label_en) + '">' + esc(cell.label_fr) + '</span>\n' +
                '                            ' + valueHtml + '\n' +
                '                        </div>';
        });
        return '                    <div class="sk-pd-io-row">' + cells.join('') + '</div>';
    }).join('\n');

    return '    <!-- DB: ingredients -->\n' +
        '    <section class="sk-es-section sk-es-section--cream sk-pd-section" id="pdIngredients" data-bg="cream" aria-labelledby="pd-ing-title">\n' +
        '        <div class="sk-es-inner">\n' +
        '            <!-- DB: ing-head -->\n' +
        '            <div class="sk-pd-head">\n' +
        '                <p class="sk-es-eyebrow sk-es-eyebrow--gold sk-reveal">\n' +
        '                    <span class="sk-es-eyebrow-text" data-en="' + esc(p.ing_eyebrow_en) + '">' + esc(p.ing_eyebrow_fr) + '</span>\n' +
        '                </p>\n' +
        '                <h2 class="sk-es-title sk-reveal" data-reveal-delay="90" id="pd-ing-title" data-en="' + esc(p.ing_title_en) + '">' + esc(p.ing_title_fr) + '</h2>\n' +
        '            </div>\n' +
        '            <!-- /DB -->\n' +
        '            <div class="sk-pd-io">\n' +
        '                <!-- DB: ing-rows -->\n' +
        rowsHtml + '\n' +
        '                <!-- /DB -->\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </section>\n' +
        '    <!-- /DB -->';
}

function buildCarousel(currentId, products) {
    const items = products.filter(function(p) {
        return p.id !== currentId;
    }).map(function(p) {
        return '                    <li class="sk-es-other">\n' +
            '                        <a class="sk-es-other-link" href="product-' + p.id + '.html">\n' +
            '                            <span class="sk-es-other-media">\n' +
            '                                <img class="sk-es-other-img" src="' + p.image + '" alt="' + esc(p.alt_fr) + '" data-en-alt="' + esc(p.alt_en) + '" loading="lazy" decoding="async" width="427" height="325">\n' +
            '                            </span>\n' +
            '                            <span class="sk-es-other-name" data-en="' + esc(p.name_en) + '">' + esc(p.name_fr) + '</span>\n' +
            '                            <span class="sk-es-other-tagline" data-en="' + esc(p.tagline_en) + '">' + esc(p.tagline_fr) + '</span>\n' +
            '                        </a>\n' +
            '                    </li>';
    }).join('\n');

    return '    <!-- DB: carousel -->\n' +
        '    <section class="sk-es-section sk-es-section--cream sk-es-section--others" id="pdCarousel" data-bg="cream" aria-labelledby="autres-essences-title">\n' +
        '        <div class="sk-es-inner">\n' +
        '            <div class="sk-es-others-head sk-reveal">\n' +
        '                <button type="button" class="sk-es-arrow" data-sk-others-prev aria-label="' + esc(t('others.previous', 'en')) + '" data-en="' + esc(t('others.previous', 'en')) + '">\n' +
        '                    <svg class="sk-es-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">\n' +
        '                        <path d="M15 18L9 12l6-6" />\n' +
        '                    </svg>\n' +
        '                </button>\n' +
        '                <h2 class="sk-es-others-title" id="autres-essences-title" data-en="' + esc(t('others.heading', 'en')) + '">' + esc(t('others.heading', 'fr')) + '</h2>\n' +
        '                <button type="button" class="sk-es-arrow" data-sk-others-next aria-label="' + esc(t('others.next', 'en')) + '" data-en="' + esc(t('others.next', 'en')) + '">\n' +
        '                    <svg class="sk-es-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">\n' +
        '                        <path d="M9 18l6-6-6-6" />\n' +
        '                    </svg>\n' +
        '                </button>\n' +
        '            </div>\n' +
        '            <div class="sk-es-others-track sk-reveal" data-reveal-delay="90" data-sk-others-track tabindex="0" role="group" aria-labelledby="autres-essences-title">\n' +
        '                <ul class="sk-es-others-list">\n' +
        items + '\n' +
        '                </ul>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </section>\n' +
        '    <!-- /DB -->';
}

/* ---- Assemble full page ---- */
function buildPage(p, allProducts) {
    let html = TEMPLATE_HEADER;

    html = html.replace(
        '<!-- DB: title -->Sukoon<!-- /DB -->',
        '<!-- DB: title -->' + esc(p.name_fr) + ' | Sukoon<!-- /DB -->'
    );
    html = html.replace(
        '<!-- DB: meta-description -->Sukoon herbal teas<!-- /DB -->',
        '<!-- DB: meta-description -->' + esc(p.lead_fr) + '<!-- /DB -->'
    );

    html += buildHero(p) + '\n';
    html += buildEssence(p) + '\n';
    html += buildRitual(p) + '\n';

    html += '<!-- IF: ingredients_origin -->\n';
    if (p.hasIngredientsOrigin) {
        html += buildIngredients(p) + '\n';
    }
    html += '<!-- /IF: ingredients_origin -->\n';

    html += '<!-- IF: reviews -->\n';
    html += '<!-- /IF: reviews -->\n';

    html += buildCarousel(p.id, allProducts) + '\n';
    html += TEMPLATE_FOOTER;

    return html;
}

/* ---- Generate ---- */
const products = SLUGS.map(function(s) {
    return s === 'moroccan-mint' ? resolveMint() : resolveProduct(s);
});

products.forEach(function(p) {
    const html = buildPage(p, products);
    const outPath = path.join(ROOT, 'product-' + p.id + '.html');
    fs.writeFileSync(outPath, html);
    console.log('Generated: ' + outPath);
});
console.log('Total: ' + products.length + ' files generated.');
