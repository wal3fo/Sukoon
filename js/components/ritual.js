/********** SUKOON — Section 2 : Le rituel **********
 * Dark navy surface. Top: two columns with the photograph bleeding off the
 * right edge. Bottom: a four-step row (photo, serif numeral, caption) split
 * by thin vertical rules, plus a narrow column of three circular badges.
 */
(function (global) {
    "use strict";

    var SkComponents = global.SkComponents = global.SkComponents || {};
    var h = SkComponents.helpers;

    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }

    function stepList(steps, t) {
        var items = steps.map(function (step, index) {
            var captionKey = 'ritual.steps.' + pad2(index + 1);
            return '<li class="sk-es-step">' +
                '<figure class="sk-es-step-media">' +
                '<img class="sk-es-img" src="' + h.esc(step.image) + '" alt="' + h.esc(t(step.altKey)) + '" data-i18n-attr="alt:' + h.esc(step.altKey) + '" loading="lazy" decoding="async" width="600" height="600">' +
                '</figure>' +
                '<span class="sk-es-step-num" aria-hidden="true">' + pad2(index + 1) + '</span>' +
                '<span class="sk-es-step-caption" data-i18n="' + h.esc(captionKey) + '">' + h.esc(t(captionKey)) + '</span>' +
                '</li>';
        });
        return '<ol class="sk-es-steps">' + items.join('') + '</ol>';
    }

    function badgeList(badges, t) {
        var items = badges.map(function (badge) {
            return '<li class="sk-es-badge">' +
                h.iconBadge(badge.icon) +
                '<span class="sk-es-badge-text" data-i18n="' + h.esc(badge.textKey) + '">' + h.esc(t(badge.textKey)) + '</span>' +
                '</li>';
        });
        return '<ul class="sk-es-badges">' + items.join('') + '</ul>';
    }

    function render(t, page) {
        var r = page.ritual;
        var id = 'rituel';

        var inner =
            '<div class="sk-es-ritual-top">' +
            '<div class="sk-es-ritual-body">' +
            h.eyebrow(t('ritual.eyebrow'), 'sk-es-eyebrow--gold') +
            h.title(id, 'ritual.heading', t) +
            '<p class="sk-es-lead" data-i18n="ritual.body">' + h.esc(t('ritual.body')) + '</p>' +
            '</div>' +
            '<figure class="sk-es-ritual-media">' +
            '<img class="sk-es-img" src="' + h.esc(r.image) + '" alt="' + h.esc(t(r.altKey)) + '" data-i18n-attr="alt:' + h.esc(r.altKey) + '" loading="lazy" decoding="async" width="1200" height="900">' +
            '</figure>' +
            '</div>' +
            '<div class="sk-es-ritual-bottom">' +
            stepList(r.steps, t) +
            badgeList(r.badges, t) +
            '</div>';

        return h.section({
            id: id,
            variant: 'navy',
            extraClass: 'sk-es-section--ritual',
            inner: inner
        });
    }

    SkComponents.ritual = { render: render };

})(window);
