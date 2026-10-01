/********** SUKOON — i18n runtime **********
 * Tiny key-based translation layer for the Sukoon product sections.
 * Locales live in js/i18n/locales/*.js and register on window.SK_LOCALES.
 * Missing keys fall back to FR, then to the key itself.
 */
(function (global) {
    "use strict";

    var STORAGE_KEY = 'sukoonLang';
    var DEFAULT_LANG = 'fr';
    var FALLBACK_LANG = 'fr';

    var SUPPORTED = ['en', 'fr', 'ar'];

    var listeners = [];
    var current = DEFAULT_LANG;

    function isSupported(lang) {
        return SUPPORTED.indexOf(lang) !== -1;
    }

    function store(lang) {
        return (global.SK_LOCALES && global.SK_LOCALES[lang]) || {};
    }

    function lookup(key, lang) {
        var chain = [lang, FALLBACK_LANG];
        for (var i = 0; i < chain.length; i++) {
            var table = store(chain[i]);
            if (Object.prototype.hasOwnProperty.call(table, key)) {
                return table[key];
            }
        }
        return key;
    }

    /* Translate every [data-i18n] node under root. */
    function apply(root, lang) {
        var scope = root || document;
        var nodes = scope.querySelectorAll('[data-i18n]');
        for (var i = 0; i < nodes.length; i++) {
            var key = nodes[i].getAttribute('data-i18n');
            nodes[i].textContent = lookup(key, lang);
        }
        var attrs = scope.querySelectorAll('[data-i18n-attr]');
        for (var j = 0; j < attrs.length; j++) {
            var el = attrs[j];
            /* Format: "attribute:key,attribute:key" */
            el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
                var parts = pair.split(':');
                if (parts.length !== 2) return;
                el.setAttribute(parts[0].trim(), lookup(parts[1].trim(), lang));
            });
        }
    }

    function onChange(fn) {
        listeners.push(fn);
    }

    function notify() {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](current);
        }
    }

    /* Keep <html lang> and direction in sync with the active locale. */
    function applyDocument(lang) {
        var html = document.documentElement;
        html.lang = lang;
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }

    function setLang(lang, persist) {
        if (!isSupported(lang)) return;
        current = lang;
        if (persist !== false) {
            try {
                global.localStorage.setItem(STORAGE_KEY, lang);
            } catch (e) { /* storage unavailable (private mode) */ }
        }
        applyDocument(lang);
        apply(document, lang);
        notify();
    }
    function t(key) {
        return lookup(key, current);
    }

    function getLang() {
        return current;
    }

    function readStoredLang() {
        try {
            var stored = global.localStorage.getItem(STORAGE_KEY);
            if (isSupported(stored)) return stored;
        } catch (e) { /* storage unavailable (private mode) */ }
        return DEFAULT_LANG;
    }

    /* Keep in sync with the header language menu. */
    document.addEventListener('sk:langchange', function (e) {
        var lang = e.detail && e.detail.lang;
        if (!isSupported(lang)) return;
        current = lang;
        apply(document, current);
        notify();
    });

    global.SKI18N = {
        t: t,
        apply: apply,
        onChange: onChange,
        setLang: setLang,
        getLang: getLang,
        readStoredLang: readStoredLang,
        defaultLang: DEFAULT_LANG
    };

    /* Initial pass: adopt the stored locale and translate the static markup. */
    current = readStoredLang();
    applyDocument(current);
    apply(document, current);

})(window);
