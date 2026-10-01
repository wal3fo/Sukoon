/********** SUKOON — Markup helpers **********
 * Small utilities shared by the essence section components. No framework:
 * each component returns an HTML string that the page mounts once.
 */
(function (global) {
    "use strict";

    var SkComponents = global.SkComponents = global.SkComponents || {};

    function esc(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* Uppercase small label followed by a thin rule — the section signature. */
    function eyebrow(text, extraClass) {
        return '<p class="sk-es-eyebrow ' + (extraClass || '') + '"><span class="sk-es-eyebrow-text">' + esc(text) + '</span></p>';
    }

    /* Circular thin-line icon badge. */
    function iconBadge(name, extraClass) {
        return '<span class="sk-es-icon-badge ' + (extraClass || '') + '">' + global.SkIcons.icon(name) + '</span>';
    }

    /* Section shell: one <section> landmark per block, variant-driven surface.
       The <h2> lives inside `inner` so each layout can place it correctly. */
    function section(opts) {
        var classes = ['sk-es-section', 'sk-es-section--' + opts.variant];
        if (opts.extraClass) classes.push(opts.extraClass);
        var innerClass = opts.innerClass ? ' ' + opts.innerClass : '';
        return '<section class="' + classes.join(' ') + '" id="' + esc(opts.id) + '" aria-labelledby="' + esc(opts.id) + '-title">' +
            '<div class="sk-es-inner' + innerClass + '">' +
            opts.inner +
            '</div></section>';
    }

    /* Heading with a stable id for aria-labelledby, keyed for translation. */
    function title(id, key, t) {
        return '<h2 class="sk-es-title" id="' + esc(id) + '-title" data-i18n="' + esc(key) + '">' + esc(t(key)) + '</h2>';
    }

    SkComponents.helpers = {
        esc: esc,
        eyebrow: eyebrow,
        iconBadge: iconBadge,
        section: section,
        title: title
    };

})(window);
