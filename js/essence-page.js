/********** SUKOON — Essence page bootstrap **********
 * Composes the product-page sections below the hero from the data config in
 * js/data/essences.js and the copy in js/i18n. Mounts into #skEssenceSections.
 * Renders once; later language switches are handled in place by the i18n
 * layer, so scroll position and carousel state are preserved.
 */
(function (global) {
    "use strict";

    var MOUNT_ID = 'skEssenceSections';

    /* Order matches the reference design. */
    var SECTIONS = [
        { component: 'discoverFlower', reveal: ['.sk-es-eyebrow', '.sk-es-title', '.sk-es-lead', '.sk-es-facts'] },
        { component: 'ritual', reveal: ['.sk-es-eyebrow', '.sk-es-title', '.sk-es-lead', '.sk-es-ritual-media', '.sk-es-steps', '.sk-es-badges'] },
        { component: 'essence', reveal: ['.sk-es-eyebrow', '.sk-es-title', '.sk-es-lead', '.sk-es-pillars'] },
        { component: 'otherEssences', reveal: ['.sk-es-others-head', '.sk-es-others-track'] }
    ];

    function renderAll(t) {
        var page = global.SK_ESSENCE.page;
        var catalogue = global.SK_ESSENCE.products;

        return SECTIONS.map(function (entry) {
            var component = global.SkComponents[entry.component];
            return component.render(t, page, catalogue);
        }).join('');
    }

    function init() {
        var mount = document.getElementById(MOUNT_ID);
        if (!mount || !global.SKI18N || !global.SK_ESSENCE) return;

        var t = global.SKI18N.t;
        mount.innerHTML = renderAll(t);
        global.SKI18N.apply(mount, global.SKI18N.getLang());
        mount.classList.add('sk-reveal-ready');

        /* Tag the reveal targets. Everything after the first group member in
           a section gets a small stagger delay. */
        var sections = mount.querySelectorAll('.sk-es-section');
        SECTIONS.forEach(function (entry, index) {
            var section = sections[index];
            if (!section) return;
            var isFirstGroup = true;
            entry.reveal.forEach(function (selector) {
                section.querySelectorAll(selector).forEach(function (el) {
                    el.classList.add('sk-reveal');
                    if (!isFirstGroup) {
                        el.setAttribute('data-reveal-delay', '90');
                    }
                });
                isFirstGroup = false;
            });
        });

        global.SkEssenceCarousel.mount(mount);
        global.SkEssenceReveal.mount(mount);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
