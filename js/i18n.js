/********** SUKOON — i18n runtime **********
 * Key-based translation layer. Locales are plain JS objects registered on
 * window.SK_LOCALES by the /i18n/*.js files (works from file:// as well).
 *
 * Features:
 *   - t(key)              resolves the current locale, falls back to FR
 *   - t(key, {vars})      {token} interpolation, e.g. reviews.basedOn
 *   - setLang(lang)       persists + applies + fires sk:langchange
 *   - apply(root, lang)   translates all [data-i18n] nodes under root
 *   - RTL switching for Arabic (dir=rtl)
 ********/
(function (global) {
    "use strict";

    var STORAGE_KEY = 'sukoonLang';
    var SUPPORTED = ['en', 'fr', 'ar'];
    var FALLBACK = 'fr';
    var current = FALLBACK;
    var listeners = [];

    function store(lang) {
        return (global.SK_LOCALES && global.SK_LOCALES[lang]) || {};
    }

    function lookup(key, lang) {
        var table = store(lang);
        if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
        var fb = store(FALLBACK);
        if (Object.prototype.hasOwnProperty.call(fb, key)) return fb[key];
        return key;
    }

    /* Replace {token} placeholders with the matching var value. */
    function interpolate(str, vars) {
        if (!vars) return str;
        for (var k in vars) {
            if (Object.prototype.hasOwnProperty.call(vars, k)) {
                str = str.split('{' + k + '}').join(String(vars[k]));
            }
        }
        return str;
    }

    function t(key, vars) {
        if (!key) return '';
        var val = lookup(key, current);
        return interpolate(val, vars);
    }

    /* Tag-based interpolation: "Based on {count} reviews" with { count: 5 } */
    function tCount(key, count) {
        if (count === 1) {
            var one = lookup(key + '.one', current) || lookup(key, current);
            return interpolate(one, { count: count });
        }
        return interpolate(lookup(key, current), { count: count });
    }

    function getLang() { return current; }

    function isSupported(lang) { return SUPPORTED.indexOf(lang) !== -1; }

    function applyDocument(lang) {
        var html = document.documentElement;
        html.lang = lang;
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }

    function apply(root, lang, fromInit) {
        var scope = root || document;
        var nodes = scope.querySelectorAll('[data-i18n]');
        var i;
        for (i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var key = el.getAttribute('data-i18n');
            el.textContent = lookup(key, lang);
        }
        /* data-i18n-attr="attr:key,attr:key" */
        var attrs = scope.querySelectorAll('[data-i18n-attr]');
        for (i = 0; i < attrs.length; i++) {
            var node = attrs[i];
            var spec = node.getAttribute('data-i18n-attr');
            if (!spec) continue;
            spec.split(',').forEach(function (pair) {
                var parts = pair.split(':');
                if (parts.length !== 2) return;
                node.setAttribute(parts[0].trim(), lookup(parts[1].trim(), lang));
            });
        }
    }

    function notify() {
        for (var i = 0; i < listeners.length; i++) listeners[i](current);
    }

    function onChange(fn) { listeners.push(fn); }

    function readStoredLang() {
        try {
            var stored = global.localStorage.getItem(STORAGE_KEY);
            if (isSupported(stored)) return stored;
        } catch (e) {}
        return FALLBACK;
    }

    function setLang(lang, persist) {
        if (!isSupported(lang)) return;
        current = lang;
        if (persist !== false) {
            try { global.localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
        }
        applyDocument(lang);
        apply(document, lang);
        notify();
    }

    global.SKI18N = {
        t: t,
        tCount: tCount,
        apply: apply,
        onChange: onChange,
        setLang: setLang,
        getLang: getLang,
        readStoredLang: readStoredLang,
        defaultLang: FALLBACK,
        supported: SUPPORTED
    };

    /* Initial pass on load. */
    current = readStoredLang();
    applyDocument(current);
    apply(document, current);

})(window);