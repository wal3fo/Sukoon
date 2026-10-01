/********** SUKOON — Essence data **********
 * Single source of truth for the product page sections.
 * Structure (ids, images, order, icon names) lives here; all copy is resolved
 * through js/i18n. Switching SK_ESSENCE.page.id to another product id renders
 * the whole page for that essence — no other change required.
 */
(function (global) {
    "use strict";

    /* Catalogue used by the "other essences" carousel. `tone` drives the soft
       backdrop behind each packshot. */
    var products = [
        { id: 'royal-verbena', image: 'img/products/product-royal-verbena.png', tone: 'green' },
        { id: 'moroccan-mint', image: 'img/products/product-moroccan-mint.png', tone: 'green' },
        { id: 'noble-chamomile', image: 'img/products/product-noble-chamomile.png', tone: 'sand' },
        { id: 'atlas-oregano', image: 'img/products/product-atlas-oregano.png', tone: 'clay' },
        { id: 'ruby-hibiscus', image: 'img/products/product-ruby-hibiscus.png', tone: 'hibiscus' },
        { id: 'heritage-fennel', image: 'img/products/product-heritage-fennel.png', tone: 'gold' }
    ];

    function productUrl(id) {
        return 'product-detail.html?essence=' + encodeURIComponent(id);
    }

    global.SK_ESSENCE = {
        page: {
            id: 'ruby-hibiscus',

            /* Section 1 — Rencontrer l'hibiscus */
            discover: {
                image: 'img/essences/ruby-hibiscus/flower.jpg',
                altKey: 'discover.imageAlt',
                facts: [
                    { icon: 'globe', labelKey: 'discover.facts.origin.label', valueKey: 'discover.facts.origin.value' },
                    { icon: 'leaf', labelKey: 'discover.facts.taste.label', valueKey: 'discover.facts.taste.value' },
                    { icon: 'flower', labelKey: 'discover.facts.composition.label', valueKey: 'discover.facts.composition.value' },
                    { icon: 'package', labelKey: 'discover.facts.sachets.label', valueKey: 'discover.facts.sachets.value' }
                ]
            },

            /* Section 2 — Le rituel */
            ritual: {
                image: 'img/essences/ruby-hibiscus/ritual-cup.jpg',
                altKey: 'ritual.imageAlt',
                steps: [
                    { image: 'img/essences/ruby-hibiscus/step-1.jpg', altKey: 'ritual.steps.01.alt' },
                    { image: 'img/essences/ruby-hibiscus/step-2.jpg', altKey: 'ritual.steps.02.alt' },
                    { image: 'img/essences/ruby-hibiscus/step-3.jpg', altKey: 'ritual.steps.03.alt' },
                    { image: 'img/essences/ruby-hibiscus/step-4.jpg', altKey: 'ritual.steps.04.alt' }
                ],
                badges: [
                    { icon: 'thermometer', textKey: 'ritual.badges.90c' },
                    { icon: 'clock', textKey: 'ritual.badges.8min' },
                    { icon: 'cup', textKey: 'ritual.badges.serve' }
                ]
            },

            /* Section 3 — L'essence */
            essence: {
                watermark: 'botanical',
                pillars: [
                    { icon: 'sun', labelKey: 'essence.pillars.eclat.label', bodyKey: 'essence.pillars.eclat.body' },
                    { icon: 'sparkle', labelKey: 'essence.pillars.rayonnement.label', bodyKey: 'essence.pillars.rayonnement.body' },
                    { icon: 'heart', labelKey: 'essence.pillars.vitalite.label', bodyKey: 'essence.pillars.vitalite.body' }
                ]
            }
        },

        products: products,
        productUrl: productUrl,

        byId: function (id) {
            for (var i = 0; i < products.length; i++) {
                if (products[i].id === id) return products[i];
            }
            return null;
        }
    };

})(window);
