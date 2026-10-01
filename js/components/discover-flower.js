/********** SUKOON — Section 1 : Rencontrer l'hibiscus **********
 * Cream surface, two columns. The photograph is full-bleed to the left edge
 * (~40% of the viewport); the right column carries the eyebrow, heading,
 * paragraph and a four-item fact row split by thin vertical rules.
 */
(function (global) {
    "use strict";

    var SkComponents = global.SkComponents = global.SkComponents || {};
    var h = SkComponents.helpers;

    function factRow(facts, t) {
        var items = facts.map(function (fact) {
            return '<div class="sk-es-fact">' +
                h.iconBadge(fact.icon) +
                '<span class="sk-es-fact-label" data-i18n="' + h.esc(fact.labelKey) + '">' + h.esc(t(fact.labelKey)) + '</span>' +
                '<span class="sk-es-fact-value" data-i18n="' + h.esc(fact.valueKey) + '">' + h.esc(t(fact.valueKey)) + '</span>' +
                '</div>';
        });
        return '<dl class="sk-es-facts">' + items.join('') + '</dl>';
    }

    function render(t, page) {
        var d = page.discover;
        var id = 'rencontrer';

        var inner =
            '<figure class="sk-es-discover-media">' +
            '<img class="sk-es-img" src="' + h.esc(d.image) + '" alt="' + h.esc(t(d.altKey)) + '" data-i18n-attr="alt:' + h.esc(d.altKey) + '" loading="lazy" decoding="async" width="1200" height="1500">' +
            '</figure>' +
            '<div class="sk-es-discover-body">' +
            h.eyebrow(t('discover.eyebrow'), 'sk-es-eyebrow--gold') +
            h.title(id, 'discover.heading', t) +
            '<p class="sk-es-lead" data-i18n="discover.body">' + h.esc(t('discover.body')) + '</p>' +
            factRow(d.facts, t) +
            '</div>';

        return h.section({
            id: id,
            variant: 'cream',
            extraClass: 'sk-es-section--split',
            innerClass: 'sk-es-split',
            inner: inner
        });
    }

    SkComponents.discoverFlower = { render: render };

})(window);
