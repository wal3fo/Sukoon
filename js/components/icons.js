/********** SUKOON — Essence icon set **********
 * Thin-line (1.25 stroke) 24px viewBox icons, matching the .sk-icon stroke
 * language already used by the header. Decorative icons are aria-hidden;
 * pass a label only when the glyph carries meaning on its own.
 */
(function (global) {
    "use strict";

    var ICONS = {
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
        leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
        flower: '<ellipse cx="12" cy="6.6" rx="2.6" ry="3.4"/><ellipse cx="12" cy="17.4" rx="2.6" ry="3.4"/><ellipse cx="6.6" cy="12" rx="3.4" ry="2.6"/><ellipse cx="17.4" cy="12" rx="3.4" ry="2.6"/><circle cx="12" cy="12" r="1.5"/>',
        package: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
        thermometer: '<path d="M14 14.8V4.5a2.5 2.5 0 0 0-5 0v10.3a4.5 4.5 0 1 0 5 0Z"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
        cup: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8.5A4.5 4.5 0 0 1 13.5 21h-3A4.5 4.5 0 0 1 6 16.5V8Z"/><path d="M6.5 2.5V5"/><path d="M10 2.5V5"/><path d="M13.5 2.5V5"/>',
        sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5"/><path d="M12 19.5V22"/><path d="M2 12h2.5"/><path d="M19.5 12H22"/><path d="M4.9 4.9l1.8 1.8"/><path d="M17.3 17.3l1.8 1.8"/><path d="M19.1 4.9l-1.8 1.8"/><path d="M6.7 17.3l-1.8 1.8"/>',
        sparkle: '<path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9Z"/><path d="M18.5 17.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/>',
        heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
        'chevron-left': '<path d="M15 18 9 12l6-6"/>',
        'chevron-right': '<path d="M9 18l6-6-6-6"/>'
    };

    /* Decorative line-art botanical watermark, drawn in a 200x260 box. */
    var BOTANICAL = '' +
        '<g fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M100 252C100 190 100 128 100 66"/>' +
        '<path d="M100 196c-22 0-40-14-46-34 22-2 40 12 46 34Z"/>' +
        '<path d="M100 152c22 0 40-14 46-34-22-2-40 12-46 34Z"/>' +
        '<path d="M100 110c-18 0-33-11-38-27 18-2 33 9 38 27Z"/>' +
        '<ellipse cx="100" cy="52" rx="20" ry="27"/>' +
        '<ellipse cx="78" cy="70" rx="20" ry="26" transform="rotate(-48 78 70)"/>' +
        '<ellipse cx="122" cy="70" rx="20" ry="26" transform="rotate(48 122 70)"/>' +
        '<ellipse cx="68" cy="38" rx="16" ry="22" transform="rotate(-78 68 38)"/>' +
        '<ellipse cx="132" cy="38" rx="16" ry="22" transform="rotate(78 132 38)"/>' +
        '<path d="M100 78V50"/>' +
        '</g>';

    function icon(name) {
        var body = ICONS[name];
        if (!body) return '';
        return '<svg class="sk-es-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>';
    }

    function botanical() {
        return '<svg class="sk-es-watermark-svg" viewBox="0 0 200 260" aria-hidden="true" focusable="false">' + BOTANICAL + '</svg>';
    }

    global.SkIcons = {
        icon: icon,
        botanical: botanical
    };

})(window);
