/********** SUKOON — Section 3 : L'essence **********
 * Cream surface, two columns. Left: eyebrow, heading, paragraph over a faint
 * pink line-art botanical watermark. Right: three pillars, each a circular
 * icon, an uppercase label and a short description.
 */
(function (global) {
    "use strict";

    var SkComponents = global.SkComponents = global.SkComponents || {};
    var h = SkComponents.helpers;

    function pillarList(pillars, t) {
        var items = pillars.map(function (pillar) {
            return '<li class="sk-es-pillar">' +
                h.iconBadge(pillar.icon) +
                '<h3 class="sk-es-pillar-label" data-i18n="' + h.esc(pillar.labelKey) + '">' + h.esc(t(pillar.labelKey)) + '</h3>' +
                '<p class="sk-es-pillar-body" data-i18n="' + h.esc(pillar.bodyKey) + '">' + h.esc(t(pillar.bodyKey)) + '</p>' +
                '</li>';
        });
        return '<ul class="sk-es-pillars">' + items.join('') + '</ul>';
    }

    function render(t, page) {
        var e = page.essence;
        var id = 'essence';

        var inner =
            '<div class="sk-es-essence-body">' +
            global.SkIcons.botanical() +
            h.eyebrow(t('essence.eyebrow'), 'sk-es-eyebrow--gold') +
            h.title(id, 'essence.heading', t) +
            '<p class="sk-es-lead" data-i18n="essence.body">' + h.esc(t('essence.body')) + '</p>' +
            '</div>' +
            pillarList(e.pillars, t);

        return h.section({
            id: id,
            variant: 'cream',
            extraClass: 'sk-es-section--essence',
            innerClass: 'sk-es-split',
            inner: inner
        });
    }

    SkComponents.essence = { render: render };

})(window);
