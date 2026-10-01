/********** SUKOON — Section 4 : Découvrir les autres essences **********
 * Cream surface. A centred header row (arrow / title / arrow) above a
 * scroll-snap carousel of the six packshots. Behaviour lives in
 * js/components/carousel.js; this file only emits markup.
 */
(function (global) {
    "use strict";

    var SkComponents = global.SkComponents = global.SkComponents || {};
    var h = SkComponents.helpers;

    function item(product, currentId, t) {
        var nameKey = 'product.' + product.id;
        var taglineKey = nameKey + '.tagline';
        var altKey = nameKey + '.alt';
        var name = t(nameKey);
        var isCurrent = product.id === currentId;
        var linkClass = 'sk-es-other-link' + (isCurrent ? ' is-active' : '');

        return '<li class="sk-es-other">' +
            '<a class="' + linkClass + '" href="' + h.esc(global.SK_ESSENCE.productUrl(product.id)) + '"' +
            (isCurrent ? ' aria-current="true"' : '') + '>' +
            '<span class="sk-es-other-media sk-es-other-media--' + h.esc(product.tone) + '">' +
            '<img class="sk-es-other-img" src="' + h.esc(product.image) + '" alt="' + h.esc(t(altKey)) + '" data-i18n-attr="alt:' + h.esc(altKey) + '" loading="lazy" decoding="async" width="600" height="750">' +
            '</span>' +
            '<span class="sk-es-other-name" data-i18n="' + h.esc(nameKey) + '">' + h.esc(name) + '</span>' +
            '<span class="sk-es-other-tagline" data-i18n="' + h.esc(taglineKey) + '">' + h.esc(t(taglineKey)) + '</span>' +
            '</a>' +
            '</li>';
    }

    function render(t, page, catalogue) {
        var id = 'autres-essences';

        var head =
            '<div class="sk-es-others-head">' +
            '<button type="button" class="sk-es-arrow" data-sk-others-prev aria-label="' + h.esc(t('others.previous')) + '" data-i18n-attr="aria-label:' + h.esc('others.previous') + '">' +
            global.SkIcons.icon('chevron-left') +
            '</button>' +
            '<h2 class="sk-es-others-title" id="' + h.esc(id) + '-title">' +
            '<span class="sk-es-others-rule" aria-hidden="true"></span>' +
            '<span class="sk-es-others-title-text" data-i18n="others.heading">' + h.esc(t('others.heading')) + '</span>' +
            '<span class="sk-es-others-rule" aria-hidden="true"></span>' +
            '</h2>' +
            '<button type="button" class="sk-es-arrow" data-sk-others-next aria-label="' + h.esc(t('others.next')) + '" data-i18n-attr="aria-label:' + h.esc('others.next') + '">' +
            global.SkIcons.icon('chevron-right') +
            '</button>' +
            '</div>';

        var track =
            '<div class="sk-es-others-track" data-sk-others-track tabindex="0" role="group" aria-labelledby="' + h.esc(id) + '-title">' +
            '<ul class="sk-es-others-list">' +
            catalogue.map(function (product) { return item(product, page.id, t); }).join('') +
            '</ul>' +
            '</div>';

        return h.section({
            id: id,
            variant: 'cream',
            extraClass: 'sk-es-section--others',
            inner: head + track
        });
    }

    SkComponents.otherEssences = { render: render };

})(window);
