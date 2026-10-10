(function (global) {
    "use strict";

    var ICONS = {
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
        leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
        flower: '<ellipse cx="12" cy="6.6" rx="2.6" ry="3.4"/><ellipse cx="12" cy="17.4" rx="2.6" ry="3.4"/><ellipse cx="6.6" cy="12" rx="3.4" ry="2.6"/><ellipse cx="17.4" cy="12" rx="3.4" ry="2.6"/><circle cx="12" cy="12" r="1.5"/>',
        package: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
        sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5"/><path d="M12 19.5V22"/><path d="M2 12h2.5"/><path d="M19.5 12H22"/><path d="M4.9 4.9l1.8 1.8"/><path d="M17.3 17.3l1.8 1.8"/><path d="M19.1 4.9l-1.8 1.8"/><path d="M6.7 17.3l-1.8 1.8"/>',
        sparkle: '<path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9Z"/><path d="M18.5 17.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/>',
        heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
        cup: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8.5A4.5 4.5 0 0 1 13.5 21h-3A4.5 4.5 0 0 1 6 16.5V8Z"/><path d="M6.5 2.5V5"/><path d="M10 2.5V5"/><path d="M13.5 2.5V5"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
        thermometer: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>'
    };

    global.SK_PRODUCTS = {
        catalogue: [
            { id: 'royal-verbena', nameKey: 'product.royal-verbena', taglineKey: 'product.royal-verbena.tagline', altKey: 'product.royal-verbena.alt', image: 'img/products/product-royal-verbena.png', tone: 'green', price: 18 },
            { id: 'moroccan-mint', nameKey: 'product.moroccan-mint', taglineKey: 'product.moroccan-mint.tagline', altKey: 'product.moroccan-mint.alt', image: 'img/products/product-moroccan-mint.png', tone: 'green', price: 18 },
            { id: 'noble-chamomile', nameKey: 'product.noble-chamomile', taglineKey: 'product.noble-chamomile.tagline', altKey: 'product.noble-chamomile.alt', image: 'img/products/product-noble-chamomile.png', tone: 'sand', price: 18 },
            { id: 'atlas-oregano', nameKey: 'product.atlas-oregano', taglineKey: 'product.atlas-oregano.tagline', altKey: 'product.atlas-oregano.alt', image: 'img/products/product-atlas-oregano.png', tone: 'clay', price: 18 },
            { id: 'ruby-hibiscus', nameKey: 'product.ruby-hibiscus', taglineKey: 'product.ruby-hibiscus.tagline', altKey: 'product.ruby-hibiscus.alt', image: 'img/products/product-ruby-hibiscus.png', tone: 'hibiscus', price: 18 },
            { id: 'heritage-fennel', nameKey: 'product.heritage-fennel', taglineKey: 'product.heritage-fennel.tagline', altKey: 'product.heritage-fennel.alt', image: 'img/products/product-heritage-fennel.png', tone: 'gold', price: 18 }
        ],

        gallery: {
            'royal-verbena': { photos: ['img/products/product_5_verveine.png'], packshots: ['img/products/product-royal-verbena.png'] },
            'moroccan-mint': { photos: ['img/products/product_3_menthe.png'], packshots: ['img/products/product-moroccan-mint.png'] },
            'noble-chamomile': { photos: ['img/products/product_4_chamomille.png'], packshots: ['img/products/product-noble-chamomile.png'] },
            'atlas-oregano': { photos: ['img/products/product_2_origan.png'], packshots: ['img/products/product-atlas-oregano.png'] },
            'ruby-hibiscus': { photos: ['img/products/product_1_hibiscus.png'], packshots: ['img/products/product-ruby-hibiscus.png'] },
            'heritage-fennel': { photos: ['img/products/product_6_fenouil.png'], packshots: ['img/products/product-heritage-fennel.png'] }
        },

        dims: {
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
            'img/products/product-ruby-hibiscus.png': [427, 324]
        },

        productUrl: function (id) {
            return 'essence.html?essence=' + encodeURIComponent(id);
        },

        byId: function (id) {
            for (var i = 0; i < this.catalogue.length; i++) {
                if (this.catalogue[i].id === id) return this.catalogue[i];
            }
            return null;
        },

        others: function (currentId) {
            var out = [];
            for (var i = 0; i < this.catalogue.length; i++) {
                if (this.catalogue[i].id !== currentId) out.push(this.catalogue[i]);
            }
            return out;
        },

        /* ------------------------------------------------------------------
           Per-essence rendering content.
           Schema is identical for every product:
             eyebrowKey  — i18n key for the eyebrow label
             leadKey     — i18n key for the short lead paragraph
             why[]       — { icon, labelKey, valueKey }
             description — { titleKey, paraKeys[], factKeys[] }
             brewing     — { type, titleKey, leadKey?, steps[], badges[] } | methods
             ingredients — { rows[] }  | null   (each row: [{ labelKey, valueKey? | htmlKey? | tableKey? | tagsKey? }])
             reviews     — { score, stars, count, distribution[], entries[] } | null
           ------------------------------------------------------------------ */
        details: {
            'royal-verbena': {
                eyebrowKey: 'essence.eyebrow',
                leadKey: 'product.royal-verbena.lead',
                rating: null,
                why: [
                    { icon: 'leaf', labelKey: 'product.royal-verbena.why.taste.label', valueKey: 'product.royal-verbena.why.taste.value' },
                    { icon: 'flower', labelKey: 'product.royal-verbena.why.composition.label', valueKey: 'product.royal-verbena.why.composition.value' }
                ],
                description: {
                    titleKey: 'product.royal-verbena.essence.title',
                    paraKeys: ['product.royal-verbena.essence.body'],
                    factKeys: [
                        { icon: 'sun', labelKey: 'product.royal-verbena.essence.pillar.1.label', valueKey: 'product.royal-verbena.essence.pillar.1.body' },
                        { icon: 'cup', labelKey: 'product.royal-verbena.essence.pillar.2.label', valueKey: 'product.royal-verbena.essence.pillar.2.body' },
                        { icon: 'heart', labelKey: 'product.royal-verbena.essence.pillar.3.label', valueKey: 'product.royal-verbena.essence.pillar.3.body' }
                    ]
                },
                brewing: {
                    type: 'ritual',
                    eyebrowKey: 'ritual.eyebrow',
                    titleKey: 'product.royal-verbena.ritual.title',
                    leadKey: null,
                    steps: [
                        'product.royal-verbena.ritual.step.01',
                        'product.royal-verbena.ritual.step.02',
                        'product.royal-verbena.ritual.step.03',
                        'product.royal-verbena.ritual.step.04'
                    ],
                    badges: [
                        { icon: 'thermometer', textKey: 'product.royal-verbena.badge.temp' },
                        { icon: 'clock', textKey: 'product.royal-verbena.badge.time' },
                        { icon: 'cup', textKey: 'product.royal-verbena.badge.serve' }
                    ]
                },
                ingredients: {
                    eyebrowKey: 'ingredients.eyebrow',
                    titleKey: 'ingredients',
                    rows: [
                        [{ labelKey: 'ingredients', valueKey: 'product.royal-verbena.ingredients' }, { labelKey: 'origin', valueKey: null }]
                    ]
                },
                reviews: null
            },

            'noble-chamomile': {
                eyebrowKey: 'essence.eyebrow',
                leadKey: 'product.noble-chamomile.lead',
                rating: null,
                why: [
                    { icon: 'leaf', labelKey: 'product.noble-chamomile.why.taste.label', valueKey: 'product.noble-chamomile.why.taste.value' },
                    { icon: 'flower', labelKey: 'product.noble-chamomile.why.composition.label', valueKey: 'product.noble-chamomile.why.composition.value' }
                ],
                description: {
                    titleKey: 'product.noble-chamomile.essence.title',
                    paraKeys: ['product.noble-chamomile.essence.body'],
                    factKeys: [
                        { icon: 'sun', labelKey: 'product.noble-chamomile.essence.pillar.1.label', valueKey: 'product.noble-chamomile.essence.pillar.1.body' },
                        { icon: 'cup', labelKey: 'product.noble-chamomile.essence.pillar.2.label', valueKey: 'product.noble-chamomile.essence.pillar.2.body' },
                        { icon: 'heart', labelKey: 'product.noble-chamomile.essence.pillar.3.label', valueKey: 'product.noble-chamomile.essence.pillar.3.body' }
                    ]
                },
                brewing: {
                    type: 'ritual',
                    eyebrowKey: 'ritual.eyebrow',
                    titleKey: 'product.noble-chamomile.ritual.title',
                    leadKey: null,
                    steps: ['product.noble-chamomile.ritual.step.01', 'product.noble-chamomile.ritual.step.02', 'product.noble-chamomile.ritual.step.03', 'product.noble-chamomile.ritual.step.04'],
                    badges: [{ icon: 'thermometer', textKey: 'product.noble-chamomile.badge.temp' }, { icon: 'clock', textKey: 'product.noble-chamomile.badge.time' }, { icon: 'cup', textKey: 'product.noble-chamomile.badge.serve' }]
                },
                ingredients: {
                    eyebrowKey: 'ingredients.eyebrow',
                    titleKey: 'ingredients',
                    rows: [
                        [{ labelKey: 'ingredients', valueKey: 'product.noble-chamomile.ingredients' }, { labelKey: 'origin', valueKey: null }]
                    ]
                },
                reviews: null
            },

            'atlas-oregano': {
                eyebrowKey: 'essence.eyebrow',
                leadKey: 'product.atlas-oregano.lead',
                rating: null,
                why: [
                    { icon: 'leaf', labelKey: 'product.atlas-oregano.why.taste.label', valueKey: 'product.atlas-oregano.why.taste.value' },
                    { icon: 'flower', labelKey: 'product.atlas-oregano.why.composition.label', valueKey: 'product.atlas-oregano.why.composition.value' }
                ],
                description: {
                    titleKey: 'product.atlas-oregano.essence.title',
                    paraKeys: ['product.atlas-oregano.essence.body'],
                    factKeys: [
                        { icon: 'sun', labelKey: 'product.atlas-oregano.essence.pillar.1.label', valueKey: 'product.atlas-oregano.essence.pillar.1.body' },
                        { icon: 'cup', labelKey: 'product.atlas-oregano.essence.pillar.2.label', valueKey: 'product.atlas-oregano.essence.pillar.2.body' },
                        { icon: 'heart', labelKey: 'product.atlas-oregano.essence.pillar.3.label', valueKey: 'product.atlas-oregano.essence.pillar.3.body' }
                    ]
                },
                brewing: {
                    type: 'ritual',
                    eyebrowKey: 'ritual.eyebrow',
                    titleKey: 'product.atlas-oregano.ritual.title',
                    leadKey: null,
                    steps: ['product.atlas-oregano.ritual.step.01', 'product.atlas-oregano.ritual.step.02', 'product.atlas-oregano.ritual.step.03', 'product.atlas-oregano.ritual.step.04'],
                    badges: [{ icon: 'thermometer', textKey: 'product.atlas-oregano.badge.temp' }, { icon: 'clock', textKey: 'product.atlas-oregano.badge.time' }, { icon: 'cup', textKey: 'product.atlas-oregano.badge.serve' }]
                },
                ingredients: {
                    eyebrowKey: 'ingredients.eyebrow',
                    titleKey: 'ingredients',
                    rows: [
                        [{ labelKey: 'ingredients', valueKey: 'product.atlas-oregano.ingredients' }, { labelKey: 'origin', valueKey: null }]
                    ]
                },
                reviews: null
            },

            'heritage-fennel': {
                eyebrowKey: 'essence.eyebrow',
                leadKey: 'product.heritage-fennel.lead',
                rating: null,
                why: [
                    { icon: 'leaf', labelKey: 'product.heritage-fennel.why.taste.label', valueKey: 'product.heritage-fennel.why.taste.value' },
                    { icon: 'flower', labelKey: 'product.heritage-fennel.why.composition.label', valueKey: 'product.heritage-fennel.why.composition.value' }
                ],
                description: {
                    titleKey: 'product.heritage-fennel.essence.title',
                    paraKeys: ['product.heritage-fennel.essence.body'],
                    factKeys: [
                        { icon: 'sun', labelKey: 'product.heritage-fennel.essence.pillar.1.label', valueKey: 'product.heritage-fennel.essence.pillar.1.body' },
                        { icon: 'cup', labelKey: 'product.heritage-fennel.essence.pillar.2.label', valueKey: 'product.heritage-fennel.essence.pillar.2.body' },
                        { icon: 'heart', labelKey: 'product.heritage-fennel.essence.pillar.3.label', valueKey: 'product.heritage-fennel.essence.pillar.3.body' }
                    ]
                },
                brewing: {
                    type: 'ritual',
                    eyebrowKey: 'ritual.eyebrow',
                    titleKey: 'product.heritage-fennel.ritual.title',
                    leadKey: null,
                    steps: ['product.heritage-fennel.ritual.step.01', 'product.heritage-fennel.ritual.step.02', 'product.heritage-fennel.ritual.step.03', 'product.heritage-fennel.ritual.step.04'],
                    badges: [{ icon: 'thermometer', textKey: 'product.heritage-fennel.badge.temp' }, { icon: 'clock', textKey: 'product.heritage-fennel.badge.time' }, { icon: 'cup', textKey: 'product.heritage-fennel.badge.serve' }]
                },
                ingredients: {
                    eyebrowKey: 'ingredients.eyebrow',
                    titleKey: 'ingredients',
                    rows: [
                        [{ labelKey: 'ingredients', valueKey: 'product.heritage-fennel.ingredients' }, { labelKey: 'origin', valueKey: null }]
                    ]
                },
                reviews: null
            },

            'ruby-hibiscus': {
                eyebrowKey: 'discover.eyebrow',
                leadKey: 'product.ruby-hibiscus.lead',
                rating: { stars: 5, count: 48 },
                why: [
                    { icon: 'globe', labelKey: 'discover.facts.origin.label', valueKey: 'discover.facts.origin.value' },
                    { icon: 'leaf', labelKey: 'discover.facts.taste.label', valueKey: 'discover.facts.taste.value' },
                    { icon: 'flower', labelKey: 'discover.facts.composition.label', valueKey: 'discover.facts.composition.value' },
                    { icon: 'package', labelKey: 'discover.facts.sachets.label', valueKey: 'discover.facts.sachets.value' }
                ],
                description: {
                    titleKey: 'essence.heading',
                    paraKeys: ['essence.body'],
                    factKeys: [
                        { icon: 'sun', labelKey: 'essence.pillars.eclat.label', valueKey: 'essence.pillars.eclat.body' },
                        { icon: 'sparkle', labelKey: 'essence.pillars.rayonnement.label', valueKey: 'essence.pillars.rayonnement.body' },
                        { icon: 'heart', labelKey: 'essence.pillars.vitalite.label', valueKey: 'essence.pillars.vitalite.body' }
                    ]
                },
                brewing: {
                    type: 'ritual',
                    eyebrowKey: 'ritual.eyebrow',
                    titleKey: 'ritual.heading',
                    leadKey: 'ritual.body',
                    steps: ['ritual.steps.01', 'ritual.steps.02', 'ritual.steps.03', 'ritual.steps.04'],
                    badges: [{ icon: 'thermometer', textKey: 'ritual.badges.90c' }, { icon: 'clock', textKey: 'ritual.badges.8min' }, { icon: 'cup', textKey: 'ritual.badges.serve' }]
                },
                ingredients: {
                    eyebrowKey: 'ingredients.eyebrow',
                    titleKey: 'ingredients',
                    rows: [
                        [{ labelKey: 'ingredients', valueKey: 'discover.facts.composition.value' }, { labelKey: 'origin', valueKey: 'discover.facts.origin.value' }]
                    ]
                },
                reviews: null
            },

            'moroccan-mint': {
                eyebrowKey: 'essence.eyebrow',
                leadKey: 'product.moroccan-mint.lead',
                rating: { stars: 5, count: 40 },
                why: [
                    { icon: 'leaf', labelKey: 'product.moroccan-mint.why.taste.label', valueKey: 'product.moroccan-mint.why.taste.value' },
                    { icon: 'flower', labelKey: 'product.moroccan-mint.why.composition.label', valueKey: 'product.moroccan-mint.why.composition.value' }
                ],
                description: {
                    titleKey: 'product.moroccan-mint.essence.title',
                    paraKeys: ['product.moroccan-mint.description.para.1', 'product.moroccan-mint.description.para.2', 'product.moroccan-mint.description.para.3'],
                    factKeys: [
                        { icon: 'sun', labelKey: 'product.moroccan-mint.description.fact.1.label', valueKey: 'product.moroccan-mint.description.fact.1.value' },
                        { icon: 'cup', labelKey: 'product.moroccan-mint.description.fact.2.label', valueKey: 'product.moroccan-mint.description.fact.2.value' }
                    ]
                },
                brewing: {
                    type: 'methods',
                    eyebrowKey: 'ritual.eyebrow',
                    titleKey: 'product.moroccan-mint.ritual.title',
                    leadKey: 'product.moroccan-mint.ritual.lead',
                    methods: [
                        {
                            titleKey: 'product.moroccan-mint.ritual.method.1.title',
                            steps: [
                                { labelKey: 'product.moroccan-mint.ritual.method.1.step.1.label', hintKey: 'product.moroccan-mint.ritual.method.1.step.1.hint' },
                                { labelKey: 'product.moroccan-mint.ritual.method.1.step.2.label', hintKey: 'product.moroccan-mint.ritual.method.1.step.2.hint' },
                                { labelKey: 'product.moroccan-mint.ritual.method.1.step.3.label', hintKey: 'product.moroccan-mint.ritual.method.1.step.3.hint' }
                            ],
                            tipKey: 'product.moroccan-mint.ritual.method.1.tip',
                            tipLabelKey: 'product.moroccan-mint.ritual.tip.label'
                        },
                        {
                            titleKey: 'product.moroccan-mint.ritual.method.2.title',
                            steps: [
                                { labelKey: 'product.moroccan-mint.ritual.method.2.step.1.label', hintKey: 'product.moroccan-mint.ritual.method.2.step.1.hint' },
                                { labelKey: 'product.moroccan-mint.ritual.method.2.step.2.label', hintKey: 'product.moroccan-mint.ritual.method.2.step.2.hint' },
                                { labelKey: 'product.moroccan-mint.ritual.method.2.step.3.label', hintKey: 'product.moroccan-mint.ritual.method.2.step.3.hint' }
                            ]
                        },
                        {
                            titleKey: 'product.moroccan-mint.ritual.method.3.title',
                            listKeys: ['product.moroccan-mint.ritual.method.3.list.1', 'product.moroccan-mint.ritual.method.3.list.2', 'product.moroccan-mint.ritual.method.3.list.3']
                        }
                    ]
                },
                ingredients: {
                    eyebrowKey: 'ingredients.eyebrow',
                    titleKey: 'ingredients',
                    rows: [
                        [{ labelKey: 'ingredients', htmlKey: 'product.moroccan-mint.ingredients.html' }, { labelKey: 'origin', htmlKey: 'product.moroccan-mint.origin.html' }],
                        [{ labelKey: 'nutrition', tableKey: 'product.moroccan-mint.nutrition.table' }, { labelKey: 'certifications', tagsKey: 'product.moroccan-mint.certifications.tags' }]
                    ]
                },
                reviews: {
                    eyebrowKey: 'reviews.eyebrow',
                    headingKey: 'reviews.heading',
                    score: '5.0',
                    stars: 5,
                    count: 5,
                    distribution: [85, 10, 3, 1, 1],
                    entries: [
                        { author: 'Sarah M.', stars: 5, metaKey: 'product.moroccan-mint.reviews.1.meta', textKey: 'product.moroccan-mint.reviews.1.text' },
                        { author: 'Ahmed K.', stars: 5, metaKey: 'product.moroccan-mint.reviews.2.meta', textKey: 'product.moroccan-mint.reviews.2.text' },
                        { author: 'Emily R.', stars: 4, metaKey: 'product.moroccan-mint.reviews.3.meta', textKey: 'product.moroccan-mint.reviews.3.text' },
                        { author: 'James T.', stars: 5, metaKey: 'product.moroccan-mint.reviews.4.meta', textKey: 'product.moroccan-mint.reviews.4.text' },
                        { author: 'Leila N.', stars: 5, metaKey: 'product.moroccan-mint.reviews.5.meta', textKey: 'product.moroccan-mint.reviews.5.text' }
                    ]
                }
            }
        },

        detail: function (id) {
            return this.details[id] || null;
        },

        icon: function (name) {
            return '<svg class="sk-es-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
        }
    };
})(window);