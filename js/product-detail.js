/********** SUKOON — Product detail behaviour (page-local) **********
 * Reads ?essence=, validates it, then drives:
 *  - the <body data-essence> accent
 *  - the gallery (main image + thumbnails) from the per-essence asset manifest
 *  - all section content from the per-essence CONTENT data object
 *  - the product title / <title> / meta via the shared i18n product keys
 *  - the "Découvrir les autres essences" carousel active state
 *  - the quantity stepper
 *  - the review star rating
 *  - the write-a-review disclosure toggle
 *
 * Only references images that already exist in the repo. Essences without an
 * img/essences/<slug>/ folder fall back to their product packshot + lifestyle
 * photo (img/products/product-*.png) — nothing is invented or downloaded.
 * Sections with no content data for an essence are hidden entirely.
 */
(function (global) {
    "use strict";

    var SUPPORTED_SLUG = [
        'royal-verbena', 'moroccan-mint', 'noble-chamomile',
        'atlas-oregano', 'ruby-hibiscus', 'heritage-fennel'
    ];
    var DEFAULT_SLUG = 'moroccan-mint';

    /* Existing repo assets per essence. ruby-hibiscus is the only essence with a
       dedicated img/essences/<slug>/ folder; the other five reuse their existing
       product packshots (mix-blend friendly) and lifestyle photos (cover). */
    var GALLERY = {
        'royal-verbena': { photos: ['img/products/product_5_verveine.png'], packshots: ['img/products/product-royal-verbena.png'] },
        'moroccan-mint': { photos: ['img/products/product_3_menthe.png'], packshots: ['img/products/product-moroccan-mint.png'] },
        'noble-chamomile': { photos: ['img/products/product_4_chamomille.png'], packshots: ['img/products/product-noble-chamomile.png'] },
        'atlas-oregano': { photos: ['img/products/product_2_origan.png'], packshots: ['img/products/product-atlas-oregano.png'] },
        'ruby-hibiscus': { photos: ['img/products/product_1_hibiscus.png'], packshots: ['img/products/product-ruby-hibiscus.png'] },
        'heritage-fennel': { photos: ['img/products/product_6_fenouil.png'], packshots: ['img/products/product-heritage-fennel.png'] }
    };

    /* Intrinsic dimensions for width/height attrs (prevents layout shift) */
    var DIMS = {
        'img/products/product_1_hibiscus.png': [427, 330],
        'img/products/product_2_origan.png': [427, 330],
        'img/products/product_3_menthe.png': [427, 330],
        'img/products/product_4_chamomille.png': [427, 329],
        'img/products/product_5_verveine.png': [427, 329],
        'img/products/product_6_fenouil.png': [427, 329],
        'img/products/product-atlas-oregano.png': [426, 325],
        'img/products/product-heritage-fennel.png': [427, 324],
        'img/products/product-moroccan-mint.png': [427, 325],
        'img/products/product-noble-chamomile.png': [426, 324],
        'img/products/product-royal-verbena.png': [427, 325],
        'img/products/product-ruby-hibiscus.png': [427, 324],
        'img/essences/ruby-hibiscus/flower.jpg': [1200, 1500],
        'img/essences/ruby-hibiscus/ritual-cup.jpg': [1200, 900],
        'img/essences/ruby-hibiscus/step-1.jpg': [600, 600],
        'img/essences/ruby-hibiscus/step-2.jpg': [600, 600],
        'img/essences/ruby-hibiscus/step-3.jpg': [600, 600],
        'img/essences/ruby-hibiscus/step-4.jpg': [600, 600]
    };

    var HIBISCUS_ALT_KEYS = {
        'img/essences/ruby-hibiscus/flower.jpg': 'discover.imageAlt',
        'img/essences/ruby-hibiscus/ritual-cup.jpg': 'ritual.imageAlt',
        'img/essences/ruby-hibiscus/step-1.jpg': 'ritual.steps.01.alt',
        'img/essences/ruby-hibiscus/step-2.jpg': 'ritual.steps.02.alt',
        'img/essences/ruby-hibiscus/step-3.jpg': 'ritual.steps.03.alt',
        'img/essences/ruby-hibiscus/step-4.jpg': 'ritual.steps.04.alt'
    };

    /* Icon SVG inner markup (paths match the landing page exactly) */
    var ICONS = {
        globe: '<circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />',
        leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" /><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />',
        flower: '<ellipse cx="12" cy="6.6" rx="2.6" ry="3.4" /><ellipse cx="12" cy="17.4" rx="2.6" ry="3.4" /><ellipse cx="6.6" cy="12" rx="3.4" ry="2.6" /><ellipse cx="17.4" cy="12" rx="3.4" ry="2.6" /><circle cx="12" cy="12" r="1.5" />',
        package: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" />',
        sun: '<circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5" /><path d="M12 19.5V22" /><path d="M2 12h2.5" /><path d="M19.5 12H22" /><path d="M4.9 4.9l1.8 1.8" /><path d="M17.3 17.3l1.8 1.8" /><path d="M19.1 4.9l-1.8 1.8" /><path d="M6.7 17.3l-1.8 1.8" />',
        sparkle: '<path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9Z" /><path d="M18.5 17.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />',
        heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />',
        cup: '<path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v8.5A4.5 4.5 0 0 1 13.5 21h-3A4.5 4.5 0 0 1 6 16.5V8Z" /><path d="M6.5 2.5V5" /><path d="M10 2.5V5" /><path d="M13.5 2.5V5" />',
        clock: '<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />',
        thermometer: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />'
    };

    /* ===================================================================
       PER-ESSENCE CONTENT — single source of truth for section copy.
       Text fields use { key } for i18n-resolved strings, { text } for
       verbatim copy, { html } for trusted authored markup. Sections absent
       from an essence's entry are hidden entirely.
       =================================================================== */
    var CONTENT = {
        'moroccan-mint': {
            eyebrowKey: 'essence.eyebrow',
            taglineKey: 'product.moroccan-mint.tagline',
            lead: { text: 'Crisp, awakening, sharp as clarity itself. Our premium organic Moroccan mint is hand-harvested from the sun-drenched fields of Meknes. Each leaf carries the essence of tradition — cool, clean, and utterly refreshing. Your moment to think straight and find focus.' },
            rating: { stars: 5, count: 48 },
            why: [
                { icon: 'leaf', labelKey: 'why.organic', value: { text: '100% Organic Certified Moroccan Mint' } },
                { icon: 'cup', labelKey: 'why.caffeine', value: { text: 'Caffeine-free — perfect any time of day' } },
                { icon: 'sun', labelKey: 'why.clarity', value: { text: 'Supports mental clarity and digestion' } },
                { icon: 'sparkle', labelKey: 'why.sustainable', value: { text: 'Sustainably sourced from Meknes region' } },
                { icon: 'package', labelKey: 'why.packaging', value: { text: 'Biodegradable pyramid sachets' } }
            ],
            description: {
                eyebrowKey: 'essence.eyebrow',
                titleKey: 'description.title',
                paragraphs: [
                    { text: 'In the medina of Meknes, where the air carries the scent of spice and earth, mint grows wild and proud. Generations of farmers have tended these fields, knowing exactly when to harvest — just before the sun reaches its peak, when the essential oils are at their most potent.' },
                    { text: 'Menthe Marocaine captures that moment. Each pyramid sachet contains whole, unbroken leaves that unfurl slowly in hot water, releasing a vivid green liquor and an aroma that instantly transports you to a Moroccan courtyard at noon.' },
                    { text: 'This isn\'t just tea. It\'s a ritual of pause. The menthol opens your airways. The brightness clears your mind. In a world of noise, this is your signal to focus.' }
                ],
                facts: [
                    { icon: 'leaf', label: { text: 'Whole Leaf' }, value: { text: 'Unbroken leaves for pure flavor' } },
                    { icon: 'sun', label: { text: 'Sun-Dried' }, value: { text: 'Traditional processing preserves oils' } }
                ]
            },
            brewing: {
                type: 'methods',
                eyebrowKey: 'ritual.eyebrow',
                title: { text: 'Unlock the full potential of your Menthe Marocaine' },
                lead: { text: 'Traditional Moroccan preparation methods for the perfect cup.' },
                methods: [
                    {
                        title: { text: 'Hot Brew' },
                        steps: [
                            { num: '1', label: { text: 'Heat Water' }, hint: { text: '95°C / 203°F' } },
                            { num: '2', label: { text: 'Steep' }, hint: { text: '3-5 minutes' } },
                            { num: '3', label: { text: 'Savor' }, hint: { text: 'Remove sachet & enjoy' } }
                        ],
                        tip: { text: 'For a traditional Moroccan touch, add a pinch of fresh mint leaves and a touch of honey. Serve in small glasses poured from height to create foam.' }
                    },
                    {
                        title: { text: 'Cold Brew (Summer Method)' },
                        steps: [
                            { num: '1', label: { text: 'Combine' }, hint: { text: '1 sachet + 500ml cold water' } },
                            { num: '2', label: { text: 'Refrigerate' }, hint: { text: '4-8 hours or overnight' } },
                            { num: '3', label: { text: 'Serve' }, hint: { text: 'Over ice with lemon' } }
                        ]
                    },
                    {
                        title: { text: 'Storage' },
                        list: [
                            { text: 'Store in a cool, dry place away from sunlight' },
                            { text: 'Keep sachets in original airtight pouch' },
                            { text: 'Best within 18 months of harvest date' }
                        ]
                    }
                ]
            },
            ingredients: {
                eyebrowKey: 'ingredients.eyebrow',
                titleKey: 'ingredients',
                rows: [
                    [
                        { labelKey: 'ingredients', html: { html: '100% Organic Mentha spicata (Spearmint). No additives, flavors, or preservatives. Naturally caffeine-free.' } },
                        { labelKey: 'origin', html: { html: 'Sourced from family farms in the <strong>Meknes-Tafilalet region</strong> of Morocco, where the unique microclimate produces mint with exceptionally high menthol content and a naturally sweet finish.' } }
                    ],
                    [
                        { labelKey: 'nutrition', table: [
                            ['Calories', '0'], ['Total Fat', '0g'], ['Sodium', '0mg'],
                            ['Total Carbohydrate', '0g'], ['Vitamin A', '2% DV'], ['Iron', '1% DV']
                        ]},
                        { labelKey: 'certifications', tags: ['USDA Organic', 'ECOCERT', 'Non-GMO Project Verified', 'Fair Trade Certified'] }
                    ]
                ]
            },
            reviews: {
                eyebrowKey: 'reviews.eyebrow',
                headingKey: 'reviews.heading',
                score: '5.0',
                stars: 5,
                count: 48,
                distribution: [85, 10, 3, 1, 1],
                entries: [
                    { author: 'Sarah M.', stars: 5, meta: 'Verified Purchase · 2 weeks ago', text: '"This mint tea has completely replaced my morning coffee. The clarity it brings is incredible — no jitters, just pure focus. The flavor is bright and clean without any bitterness."' },
                    { author: 'Ahmed K.', stars: 5, meta: 'Verified Purchase · 1 month ago', text: '"Reminds me of my grandmother\'s kitchen in Fez. Authentic, potent, and soothing. I drink it before evening meditation and it\'s become an essential part of my ritual."' },
                    { author: 'Emily R.', stars: 4, meta: 'Verified Purchase · 3 weeks ago', text: '"Excellent quality mint. Strong but not overwhelming. I love that the sachets are biodegradable. Only reason for 4 stars is the price point, but you truly get what you pay for."' }
                ]
            }
        },
        'ruby-hibiscus': {
            eyebrowKey: 'discover.eyebrow',
            taglineKey: 'product.ruby-hibiscus.tagline',
            lead: { key: 'discover.body' },
            price: { amount: '$18.00' },
            rating: null,
            why: global.SK_ESSENCE.page.discover.facts.map(function (f) {
                return { icon: f.icon, labelKey: f.labelKey, value: { key: f.valueKey } };
            }),
            description: {
                eyebrowKey: 'essence.eyebrow',
                titleKey: 'essence.heading',
                paragraphs: [{ key: 'essence.body' }],
                facts: global.SK_ESSENCE.page.essence.pillars.map(function (p) {
                    return { icon: p.icon, labelKey: p.labelKey, value: { key: p.bodyKey } };
                })
            },
            brewing: {
                type: 'ritual',
                eyebrowKey: 'ritual.eyebrow',
                title: { key: 'ritual.heading' },
                lead: { key: 'ritual.body' },
                steps: global.SK_ESSENCE.page.ritual.steps,
                badges: global.SK_ESSENCE.page.ritual.badges,
                stepImages: false
            },
            ingredients: {
                eyebrowKey: 'ingredients.eyebrow',
                titleKey: 'ingredients',
                rows: [
                    [
                        { labelKey: 'ingredients', value: { key: 'discover.facts.composition.value' } },
                        { labelKey: 'origin', value: { key: 'discover.facts.origin.value' } }
                    ]
                ]
            },
            reviews: null
        }
    };

    /* Price map matching PRODUCTS in js/main.js (all $18.00) */
    var PRICES = {
        'moroccan-mint': { amount: '$18.00' },
        'royal-verbena': { amount: '$18.00' },
        'noble-chamomile': { amount: '$18.00' },
        'atlas-oregano': { amount: '$18.00' },
        'ruby-hibiscus': { amount: '$18.00' },
        'heritage-fennel': { amount: '$18.00' }
    };

    /* ===================================================================
       Helpers
       =================================================================== */
    function readEssence() {
        var params = new URLSearchParams(global.location.search);
        var raw = params.get('essence');
        if (raw && SUPPORTED_SLUG.indexOf(raw) !== -1) return raw;
        return DEFAULT_SLUG;
    }

    function esc(value) {
        return String(value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function t(key, fallback) {
        if (global.SKI18N && global.SKI18N.t) {
            var v = global.SKI18N.t(key);
            if (v && v !== key) return v;
        }
        return fallback || key;
    }

    function productName(slug) {
        var key = 'product.' + slug;
        return t(key, key);
    }

    function starString(n) {
        var s = '';
        for (var i = 0; i < 5; i++) {
            s += (i < n ? '★' : '☆') + (i < 4 ? ' ' : '');
        }
        return s;
    }

    /* Resolve a text field: { key } → i18n, { text } → verbatim, { html } → markup */
    function resolve(field, fallback) {
        if (!field) return fallback || '';
        if (field.key) return t(field.key, fallback || '');
        if (field.html) return field.html;
        return field.text || fallback || '';
    }

    function iconSvg(name) {
        return '<svg class="sk-es-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
    }

    function dimsFor(src) {
        return DIMS[src] || null;
    }

    /* ===================================================================
       Gallery
       =================================================================== */
    function buildImages(slug) {
        var def = GALLERY[slug] || GALLERY[DEFAULT_SLUG];
        var list = [];
        def.photos.forEach(function (src) { list.push({ src: src, kind: 'photo' }); });
        def.packshots.forEach(function (src) { list.push({ src: src, kind: 'packshot' }); });
        return list;
    }

    function mainImgAlt(slug, src) {
        if (slug === 'ruby-hibiscus' && HIBISCUS_ALT_KEYS[src]) {
            return t(HIBISCUS_ALT_KEYS[src], productName(slug));
        }
        if (/product-.*\.png$/.test(src)) {
            return t('product.' + slug + '.alt', productName(slug));
        }
        return productName(slug);
    }

    function renderGallery(slug) {
        var main = document.getElementById('skPdMainImg');
        var thumbs = document.getElementById('skPdThumbs');
        var name = productName(slug);
        if (!main || !thumbs) return;

        var images = buildImages(slug);
        var first = images[0] || { src: GALLERY[DEFAULT_SLUG].packshots[0], kind: 'packshot' };

        main.src = first.src;
        main.alt = mainImgAlt(slug, first.src);
        main.className = first.kind === 'photo' ? 'sk-es-img' : 'sk-es-other-img';
        main.setAttribute('loading', 'eager');
        main.setAttribute('decoding', 'async');
        var d = dimsFor(first.src);
        if (d) {
            main.setAttribute('width', d[0]);
            main.setAttribute('height', d[1]);
        }

        thumbs.innerHTML = '';
        images.forEach(function (img, i) {
            var figure = document.createElement('figure');
            figure.className = 'sk-pd-thumb' + (i === 0 ? ' is-active' : '') + (img.kind === 'photo' ? ' sk-pd-thumb--photo' : '');
            figure.setAttribute('data-sk-pd-img', img.src);
            figure.setAttribute('data-sk-pd-kind', img.kind);
            figure.setAttribute('data-sk-pd-alt', mainImgAlt(slug, img.src));
            figure.setAttribute('aria-label', name + ' — ' + (i + 1));
            figure.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
            figure.setAttribute('tabindex', '0');
            figure.setAttribute('role', 'button');
            var thumbImg = document.createElement('img');
            thumbImg.src = img.src;
            thumbImg.alt = '';
            thumbImg.className = img.kind === 'photo' ? 'sk-es-img' : 'sk-es-other-img';
            thumbImg.setAttribute('loading', 'lazy');
            thumbImg.setAttribute('decoding', 'async');
            thumbImg.setAttribute('width', '72');
            thumbImg.setAttribute('height', '72');
            figure.appendChild(thumbImg);
            thumbs.appendChild(figure);
        });
    }

    /* ===================================================================
       Hero renderer
       =================================================================== */
    function renderHero(slug, c) {
        var eyebrowText = document.querySelector('#skPdEyebrow .sk-es-eyebrow-text');
        if (eyebrowText) {
            var eyebrowKey = c.eyebrowKey || 'essence.eyebrow';
            eyebrowText.setAttribute('data-i18n', eyebrowKey);
            eyebrowText.textContent = t(eyebrowKey);
        }

        var title = document.getElementById('skPdTitle');
        if (title) {
            title.setAttribute('data-i18n', 'product.' + slug);
            title.textContent = productName(slug);
        }

        var tagline = document.getElementById('skPdTagline');
        if (tagline) {
            var taglineKey = c.taglineKey || ('product.' + slug + '.tagline');
            tagline.setAttribute('data-i18n', taglineKey);
            tagline.textContent = t(taglineKey);
            tagline.hidden = false;
        }

        var rating = document.getElementById('skPdRating');
        if (rating) {
            if (c.rating) {
                rating.hidden = false;
                var stars = rating.querySelector('.sk-pd-stars');
                stars.textContent = starString(c.rating.stars);
                stars.setAttribute('aria-label', c.rating.stars + ' out of 5 stars');
                rating.querySelector('.sk-pd-rating-count').textContent = '(' + c.rating.count + ' Reviews)';
            } else {
                rating.hidden = true;
            }
        }

        var lead = document.getElementById('skPdLead');
        if (lead) {
            if (c.lead) {
                lead.textContent = resolve(c.lead);
                lead.hidden = false;
            } else {
                lead.hidden = true;
            }
        }

        var price = document.getElementById('skPdPrice');
        if (price) {
            var priceData = c.price || PRICES[slug];
            if (priceData) {
                price.hidden = false;
                price.querySelector('.sk-pd-price-amount').textContent = priceData.amount;
                var del = price.querySelector('.sk-pd-price-del');
                if (priceData.del) {
                    del.textContent = priceData.del;
                    del.style.display = '';
                } else {
                    del.style.display = 'none';
                }
            } else {
                price.hidden = true;
            }
        }

        var whyWrap = document.getElementById('skPdWhyWrap');
        if (whyWrap) {
            if (c.why && c.why.length) {
                whyWrap.hidden = false;
                var whyList = document.getElementById('skPdWhy');
                whyList.innerHTML = '';
                c.why.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'sk-pd-why-item';
                    li.innerHTML = '<span class="sk-pd-why-icon" aria-hidden="true">' + iconSvg(item.icon) + '</span>' +
                        '<span class="sk-pd-why-body">' +
                        '<span class="sk-pd-why-label">' + esc(resolve(item.labelKey ? { key: item.labelKey } : null)) + '</span>' +
                        '<span class="sk-pd-why-value">' + esc(resolve(item.value)) + '</span>' +
                        '</span>';
                    whyList.appendChild(li);
                });
            } else {
                whyWrap.hidden = true;
            }
        }
    }

    /* ===================================================================
       Section renderers
       =================================================================== */
    function renderDescription(c) {
        var section = document.getElementById('pdDescription');
        if (!c.description) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        var eyebrowText = section.querySelector('.sk-pd-head .sk-es-eyebrow-text');
        eyebrowText.setAttribute('data-i18n', c.description.eyebrowKey);
        eyebrowText.textContent = t(c.description.eyebrowKey);

        var title = section.querySelector('.sk-pd-head .sk-es-title');
        title.setAttribute('data-i18n', c.description.titleKey);
        title.textContent = t(c.description.titleKey);

        var copy = section.querySelector('.sk-pd-desc-copy');
        copy.innerHTML = '';
        (c.description.paragraphs || []).forEach(function (p) {
            var el = document.createElement('p');
            el.className = 'sk-es-lead';
            el.textContent = resolve(p);
            copy.appendChild(el);
        });

        var facts = section.querySelector('.sk-pd-facts');
        facts.innerHTML = '';
        (c.description.facts || []).forEach(function (f) {
            var li = document.createElement('li');
            li.className = 'sk-pd-fact';
            li.innerHTML = '<span class="sk-pd-fact-icon" aria-hidden="true">' + iconSvg(f.icon) + '</span>' +
                '<span class="sk-pd-fact-body">' +
                '<span class="sk-pd-fact-label">' + esc(resolve(f.label)) + '</span>' +
                '<span class="sk-pd-fact-value">' + esc(resolve(f.value)) + '</span>' +
                '</span>';
            facts.appendChild(li);
        });
    }

    function renderBrewing(c) {
        var section = document.getElementById('pdBrewing');
        if (!c.brewing) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        var eyebrowText = section.querySelector('.sk-pd-head .sk-es-eyebrow-text');
        eyebrowText.setAttribute('data-i18n', c.brewing.eyebrowKey);
        eyebrowText.textContent = t(c.brewing.eyebrowKey);

        var title = section.querySelector('.sk-pd-head .sk-es-title');
        if (c.brewing.title && c.brewing.title.key) {
            title.setAttribute('data-i18n', c.brewing.title.key);
            title.textContent = t(c.brewing.title.key);
        } else {
            title.removeAttribute('data-i18n');
            title.textContent = resolve(c.brewing.title);
        }

        var lead = section.querySelector('.sk-pd-head .sk-es-lead');
        if (c.brewing.lead) {
            if (c.brewing.lead.key) {
                lead.setAttribute('data-i18n', c.brewing.lead.key);
                lead.textContent = t(c.brewing.lead.key);
            } else {
                lead.removeAttribute('data-i18n');
                lead.textContent = resolve(c.brewing.lead);
            }
            lead.hidden = false;
        } else {
            lead.hidden = true;
        }

        var body = section.querySelector('.sk-pd-brew-body');
        body.innerHTML = '';

        if (c.brewing.type === 'methods') {
            var wrap = document.createElement('div');
            wrap.className = 'sk-pd-brew-wrap';
            c.brewing.methods.forEach(function (m) {
                var col = document.createElement('div');
                col.className = 'sk-pd-brew';
                var h = '<h6 class="sk-pd-brew-title">' + esc(resolve(m.title)) + '</h6>';
                if (m.steps) {
                    h += '<div class="sk-pd-brew-steps">';
                    m.steps.forEach(function (s) {
                        h += '<div class="sk-pd-brew-item">' +
                            '<div class="sk-pd-brew-num">' + esc(resolve(s.num)) + '</div>' +
                            '<p class="sk-pd-brew-label">' + esc(resolve(s.label)) + '</p>' +
                            '<small class="sk-pd-brew-hint">' + esc(resolve(s.hint)) + '</small>' +
                            '</div>';
                    });
                    h += '</div>';
                }
                if (m.tip) {
                    h += '<div class="sk-pd-brew-tip"><small class="sk-pd-brew-hint"><strong>Pro Tip:</strong> ' + esc(resolve(m.tip)) + '</small></div>';
                }
                if (m.list) {
                    h += '<ul class="sk-pd-list">';
                    m.list.forEach(function (item) {
                        h += '<li><small class="sk-pd-bullet">✓</small> ' + esc(resolve(item)) + '</li>';
                    });
                    h += '</ul>';
                }
                col.innerHTML = h;
                wrap.appendChild(col);
            });
            body.appendChild(wrap);
        } else if (c.brewing.type === 'ritual') {
            var rb = document.createElement('div');
            rb.className = 'sk-es-ritual-bottom';
            var steps = document.createElement('ul');
            steps.className = 'sk-es-steps';
            var showImages = c.brewing.stepImages !== false;
            c.brewing.steps.forEach(function (s, i) {
                var li = document.createElement('li');
                li.className = 'sk-es-step';
                var capKey = 'ritual.steps.0' + (i + 1);
                var h = '';
                if (showImages) {
                    h += '<div class="sk-es-step-media">' +
                        '<img class="sk-es-img" src="' + esc(s.image) + '" alt="' + esc(t(s.altKey)) + '" loading="lazy" decoding="async" width="600" height="600">' +
                        '</div>';
                }
                h += '<p class="sk-es-step-num">' + (i + 1) + '</p>' +
                    '<p class="sk-es-step-caption" data-i18n="' + capKey + '">' + esc(t(capKey)) + '</p>';
                li.innerHTML = h;
                steps.appendChild(li);
            });
            rb.appendChild(steps);
            var badges = document.createElement('div');
            badges.className = 'sk-es-badges';
            c.brewing.badges.forEach(function (b) {
                var d = document.createElement('div');
                d.className = 'sk-es-badge';
                d.innerHTML = '<span class="sk-es-icon-badge">' + iconSvg(b.icon) + '</span>' +
                    '<span class="sk-es-badge-text" data-i18n="' + esc(b.textKey) + '">' + esc(t(b.textKey)) + '</span>';
                badges.appendChild(d);
            });
            rb.appendChild(badges);
            body.appendChild(rb);
        }
    }

    function renderIngredients(c) {
        var section = document.getElementById('pdIngredients');
        if (!c.ingredients) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        var eyebrowText = section.querySelector('.sk-pd-head .sk-es-eyebrow-text');
        eyebrowText.setAttribute('data-i18n', c.ingredients.eyebrowKey);
        eyebrowText.textContent = t(c.ingredients.eyebrowKey);

        var title = section.querySelector('.sk-pd-head .sk-es-title');
        title.setAttribute('data-i18n', c.ingredients.titleKey);
        title.textContent = t(c.ingredients.titleKey);

        var io = section.querySelector('.sk-pd-io');
        io.innerHTML = '';
        c.ingredients.rows.forEach(function (row) {
            var rowEl = document.createElement('div');
            rowEl.className = 'sk-pd-io-row';
            row.forEach(function (cell) {
                var cellEl = document.createElement('div');
                cellEl.className = 'sk-pd-io-cell';
                var label = document.createElement('p');
                label.className = 'sk-pd-io-label';
                label.setAttribute('data-i18n', cell.labelKey);
                label.textContent = t(cell.labelKey);
                cellEl.appendChild(label);
                var value = document.createElement('div');
                value.className = 'sk-pd-io-value';
                if (cell.html) {
                    value.innerHTML = resolve(cell.html);
                } else if (cell.value) {
                    value.textContent = resolve(cell.value);
                } else if (cell.table) {
                    var table = document.createElement('table');
                    table.className = 'sk-pd-table';
                    var tbody = document.createElement('tbody');
                    cell.table.forEach(function (r) {
                        var tr = document.createElement('tr');
                        tr.innerHTML = '<td>' + esc(r[0]) + '</td><td class="sk-pd-table--end">' + esc(r[1]) + '</td>';
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    value.appendChild(table);
                } else if (cell.tags) {
                    var tags = document.createElement('div');
                    tags.className = 'sk-pd-tags';
                    cell.tags.forEach(function (tag) {
                        var span = document.createElement('span');
                        span.className = 'sk-pd-tag';
                        span.textContent = tag;
                        tags.appendChild(span);
                    });
                    value.appendChild(tags);
                }
                cellEl.appendChild(value);
                rowEl.appendChild(cellEl);
            });
            io.appendChild(rowEl);
        });
    }

    function renderReviews(c) {
        var section = document.getElementById('pdReviews');
        if (!c.reviews) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        var eyebrowText = section.querySelector('.sk-pd-head .sk-es-eyebrow-text');
        eyebrowText.setAttribute('data-i18n', c.reviews.eyebrowKey);
        eyebrowText.textContent = t(c.reviews.eyebrowKey);

        var title = section.querySelector('.sk-pd-head .sk-es-title');
        title.setAttribute('data-i18n', c.reviews.headingKey);
        title.textContent = t(c.reviews.headingKey);

        section.querySelector('.sk-pd-score-num').textContent = c.reviews.score;
        var summaryStars = section.querySelector('.sk-pd-score .sk-pd-stars');
        summaryStars.textContent = starString(c.reviews.stars);
        summaryStars.setAttribute('aria-label', c.reviews.stars + ' out of 5 stars');
        section.querySelector('.sk-pd-score .sk-pd-brew-hint').textContent = 'Based on ' + c.reviews.count + ' reviews';

        var bars = section.querySelector('.sk-pd-review-bars');
        bars.innerHTML = '';
        c.reviews.distribution.forEach(function (pct, i) {
            var stars = 5 - i;
            var bar = document.createElement('div');
            bar.className = 'sk-pd-bar';
            var label = document.createElement('span');
            label.className = 'sk-pd-bar-label';
            label.textContent = stars + '★';
            var track = document.createElement('div');
            track.className = 'sk-pd-bar-track';
            var fill = document.createElement('div');
            fill.className = 'sk-pd-bar-fill' + (i === 0 ? '' : ' sk-pd-bar-fill--muted');
            fill.style.width = pct + '%';
            track.appendChild(fill);
            bar.appendChild(label);
            bar.appendChild(track);
            bars.appendChild(bar);
        });

        var list = section.querySelector('.sk-pd-review-list');
        list.innerHTML = '';
        c.reviews.entries.forEach(function (e) {
            var article = document.createElement('article');
            article.className = 'sk-pd-review-entry';
            article.innerHTML = '<div class="sk-pd-review-head">' +
                '<strong class="sk-pd-review-author">' + esc(e.author) + '</strong>' +
                '<span class="sk-pd-stars" aria-label="' + e.stars + ' out of 5 stars">' + starString(e.stars) + '</span>' +
                '</div>' +
                '<p class="sk-pd-review-meta"><small>' + esc(e.meta) + '</small></p>' +
                '<p class="sk-pd-desc">' + esc(e.text) + '</p>';
            list.appendChild(article);
        });
    }

    /* ===================================================================
       Carousel active state
       =================================================================== */
    function setActiveCarousel(slug) {
        var track = document.getElementById('skPdOthersTrack');
        if (!track) return;
        var links = track.querySelectorAll('.sk-es-other-link');
        links.forEach(function (link) {
            var href = link.getAttribute('href') || '';
            var isActive = href.indexOf('essence=' + slug) !== -1 || link.getAttribute('href') === 'product-detail.html?essence=' + slug;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /* ===================================================================
       Title / meta
       =================================================================== */
    function applyTitle(slug) {
        var titleText = productName(slug);
        if (global.document.title && titleText) {
            global.document.title = titleText + ' — Sukoon';
        }
        var meta = global.document.querySelector('meta[name="description"]');
        if (meta && titleText) {
            var tagline = t('product.' + slug + '.tagline');
            meta.setAttribute('content', titleText + ' — ' + tagline + ' | Sukoon');
        }
        var btn = document.getElementById('skPdCartBtn');
        if (btn) {
            btn.setAttribute('data-product', slug);
        }
    }

    /* ===================================================================
       Quantity stepper
       =================================================================== */
    function initQty() {
        var input = document.getElementById('skPdQty');
        var minus = document.getElementById('skPdMinus');
        var plus = document.getElementById('skPdPlus');
        if (!input || !minus || !plus) return;
        function set(v) {
            input.value = v;
            if (window.dispatchEvent) {
                input.dispatchEvent(new global.Event('input', { bubbles: true }));
            }
        }
        plus.addEventListener('click', function () { set(parseInt(input.value, 10) + 1); });
        minus.addEventListener('click', function () {
            var v = parseInt(input.value, 10);
            if (v > 1) set(v - 1);
        });
    }

    /* ---- Gallery thumb click -> swap main image ---- */
    function initGallerySwap() {
        var thumbs = document.getElementById('skPdThumbs');
        var main = document.getElementById('skPdMainImg');
        if (!thumbs || !main) return;
        thumbs.addEventListener('click', function (e) {
            var fig = e.target.closest('.sk-pd-thumb');
            if (!fig) return;
            var src = fig.getAttribute('data-sk-pd-img');
            if (!src) return;

            main.src = src;
            main.alt = fig.getAttribute('data-sk-pd-alt') || '';
            main.className = fig.classList.contains('sk-pd-thumb--photo') ? 'sk-es-img' : 'sk-es-other-img';
            var d = dimsFor(src);
            if (d) {
                main.setAttribute('width', d[0]);
                main.setAttribute('height', d[1]);
            }
            thumbs.querySelectorAll('.sk-pd-thumb').forEach(function (t) {
                var on = t === fig;
                t.classList.toggle('is-active', on);
                t.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
        });
    }

    /* ---- Review star rating (display only; form is not submitted) ---- */
    function initReviewStars() {
        var container = document.getElementById('skPdReviewStars');
        if (!container) return;
        var stars = container.querySelectorAll('.sk-pd-star');
        stars.forEach(function (star, index) {
            star.addEventListener('click', function () {
                var rating = index + 1;
                var hidden = container.parentNode.querySelector('#sk-pd-review-rating');
                if (!hidden) {
                    hidden = global.document.createElement('input');
                    hidden.setAttribute('type', 'hidden');
                    hidden.setAttribute('id', 'sk-pd-review-rating');
                    hidden.setAttribute('name', 'rating');
                    container.parentNode.appendChild(hidden);
                }
                hidden.value = rating;
                stars.forEach(function (s, i) {
                    s.classList.toggle('is-selected', i < rating);
                });
            });
        });
    }

    /* ---- Review form toggle (disclosure) ---- */
    function initReviewToggle() {
        var toggle = document.getElementById('skPdReviewToggle');
        var form = document.getElementById('skPdReviewForm');
        if (!toggle || !form) return;
        toggle.addEventListener('click', function () {
            var open = form.hidden;
            form.hidden = !open;
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                var firstInput = form.querySelector('input, textarea');
                if (firstInput) setTimeout(function () { firstInput.focus(); }, 50);
            }
        });
    }

    function initReviewForm() {
        var form = document.getElementById('skPdReviewFormEl');
        if (!form) return;
        form.addEventListener('submit', function (e) { e.preventDefault(); });
    }

    /* ===================================================================
       Init
       =================================================================== */
    function renderAll(slug) {
        var c = CONTENT[slug] || {};
        renderHero(slug, c);
        renderDescription(c);
        renderBrewing(c);
        renderIngredients(c);
        renderReviews(c);
    }

    function init() {
        var slug = readEssence();
        global.document.documentElement.setAttribute('data-essence', slug);
        global.document.body.setAttribute('data-essence', slug);

        applyTitle(slug);
        renderAll(slug);
        renderGallery(slug);
        setActiveCarousel(slug);
        initGallerySwap();
        initQty();
        initReviewStars();
        initReviewToggle();
        initReviewForm();

        /* Keep title / gallery alts in sync if the header language menu changes
           locale. Section copy with data-i18n is handled by the i18n layer. */
        if (global.SKI18N && global.SKI18N.onChange) {
            global.SKI18N.onChange(function () {
                applyTitle(slug);
                renderGallery(slug);
            });
        }
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
