/********** SUKOON — global page behaviour (vanilla JS) **********
 * Header language menu, nav drawer, cart drawer, quantity stepper on the
 * product page, spinner dismissal, sticky header, back-to-top, essence
 * carousel, and scroll reveal.
 *
 * No framework: plain DOM APIs. Back-to-top button is created exactly once.
 */
(function (global) {
    "use strict";

    var LANG_CODES = { en: 'EN', fr: 'FR', ar: 'AR' };

    /* ---- cache elements (null-safe) ---- */
    var $ = function (id) { return document.getElementById(id); };

    var el = {
        header: $('skHeader'),
        langBtn: $('skLangBtn'),
        langMenu: $('skLangMenu'),
        langCode: $('skLangCode'),
        langItems: document.querySelectorAll('.sk-lang-item'),
        hamburger: $('skHamburger'),
        panel: $('skNavPanel'),
        panelClose: $('skPanelClose'),
        cartBtn: $('skCartBtn'),
        cartDrawer: $('skCartDrawer'),
        cartClose: $('skCartClose'),
        scrim: $('skScrim'),
        cartBadge: $('skCartBadge'),
        cartBody: $('skCartBody'),
        cartFoot: $('skCartFoot'),
        cartTotal: $('skCartTotal'),
        qtyMinus: $('skPdMinus'),
        qtyPlus: $('skPdPlus'),
        qtyInput: $('skPdQty'),
        cartBtnProd: $('skPdCartBtn'),
        backToTop: document.querySelector('.back-to-top')
    };

    var currentLang = 'fr';

    function readLang() {
        try {
            var stored = global.localStorage.getItem('sukoonLang');
            if (stored) return stored;
        } catch (e) {}
        return 'fr';
    }

    function langItemsArray() {
        return Array.prototype.slice.call(el.langItems);
    }

    function setLanguage(lang, persist) {
        if (!lang) return;
        currentLang = lang;
        if (persist !== false) {
            try { global.localStorage.setItem('sukoonLang', lang); } catch (e) {}
        }
         if (global.SKI18N) {
            global.SKI18N.setLang(lang, false);
        } else {
            /* Fallback: set document direction + code. */
            var code = document.getElementById('skLangCode');
            if (code) code.textContent = LANG_CODES[lang] || 'EN';
            var html = document.documentElement;
            html.lang = lang;
            html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        }
        if (el.langCode) el.langCode.textContent = LANG_CODES[lang] || 'EN';
        langItemsArray().forEach(function (item) {
            item.setAttribute('aria-selected', item.getAttribute('data-lang') === lang ? 'true' : 'false');
        });
        applyInlineLang(lang);
        document.dispatchEvent(new CustomEvent('sk:langchange', { detail: { lang: lang } }));
    }

    /* ---- Inline data-en language swapping ----
     * Static product pages carry French text inline (for JS-off / AR fallback)
     * and English text in data-en attributes. This function swaps textContent
     * and img alt attributes when switching to EN, and restores FR on FR/AR.
     * data-en-aria is used for aria-label translation on container elements.
     */
    function applyInlineLang(lang) {
        var textNodes = document.querySelectorAll('[data-en]:not([data-en-aria])');
        for (var i = 0; i < textNodes.length; i++) {
            var el = textNodes[i];
            if (lang === 'en') {
                if (!el._origText) el._origText = el.textContent;
                var en = el.getAttribute('data-en');
                if (en) el.textContent = en;
            } else {
                if (el._origText !== undefined) el.textContent = el._origText;
            }
        }
        var altNodes = document.querySelectorAll('[data-en-alt]');
        for (var j = 0; j < altNodes.length; j++) {
            var img = altNodes[j];
            if (lang === 'en') {
                if (!img._origAlt) img._origAlt = img.getAttribute('alt') || '';
                var enAlt = img.getAttribute('data-en-alt');
                if (enAlt) img.setAttribute('alt', enAlt);
            } else {
                if (img._origAlt !== undefined) img.setAttribute('alt', img._origAlt);
            }
        }
        var ariaNodes = document.querySelectorAll('[data-en-aria]');
        for (var k = 0; k < ariaNodes.length; k++) {
            var btn = ariaNodes[k];
            var currentAria = btn.getAttribute('aria-label');
            if (lang === 'en') {
                if (!btn._origAria) btn._origAria = currentAria || '';
                var enAria = btn.getAttribute('data-en-aria');
                if (enAria) btn.setAttribute('aria-label', enAria);
            } else {
                if (btn._origAria !== undefined) btn.setAttribute('aria-label', btn._origAria);
            }
        }
    }

    function langIsOpen() {
        return el.langMenu && el.langMenu.classList.contains('is-open');
    }

    function setLangMenu(open) {
        if (!el.langMenu) return;
        el.langMenu.classList.toggle('is-open', open);
        if (el.langBtn) el.langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
            var sel = el.langMenu.querySelector('[aria-selected="true"]');
            if (sel) sel.focus();
        } else if (el.langBtn) {
            el.langBtn.focus();
        }
    }

    function panelIsOpen() { return el.panel && el.panel.classList.contains('is-open'); }
    function cartIsOpen() { return el.cartDrawer && el.cartDrawer.classList.contains('is-open'); }
    function overlayOpen() { return panelIsOpen() || cartIsOpen(); }

    function setScrim(on) {
        if (!el.scrim) return;
        el.scrim.hidden = !on;
    }

    function focusablesIn(node) {
        var results = Array.prototype.slice.call(node.querySelectorAll('a[href], button:not([disabled])'));
        return results.filter(function (f) { return f.offsetParent !== null; });
    }

    function openPanel() {
        if (!el.panel) return;
        el.panel.classList.add('is-open');
        el.panel.setAttribute('aria-hidden', 'false');
        if (el.hamburger) {
            el.hamburger.classList.add('is-open');
            el.hamburger.setAttribute('aria-expanded', 'true');
            el.hamburger.setAttribute('aria-label', 'Close menu');
        }
        if (el.cartDrawer) {
            el.cartDrawer.classList.remove('is-open');
            el.cartDrawer.setAttribute('aria-hidden', 'true');
        }
        if (el.cartBtn) el.cartBtn.setAttribute('aria-expanded', 'false');
        setScrim(true);
        var f = focusablesIn(el.panel);
        if (f.length) f[0].focus();
    }

    function closePanel(refocus) {
        if (!el.panel) return;
        el.panel.classList.remove('is-open');
        el.panel.setAttribute('aria-hidden', 'true');
        if (el.hamburger) {
            el.hamburger.classList.remove('is-open');
            el.hamburger.setAttribute('aria-expanded', 'false');
            el.hamburger.setAttribute('aria-label', 'Open menu');
        }
        if (refocus !== false && el.hamburger) el.hamburger.focus();
        if (!overlayOpen()) setScrim(false);
    }

    function openCart() {
        if (!el.cartDrawer) return;
        closePanel(false);
        el.cartDrawer.classList.add('is-open');
        el.cartDrawer.setAttribute('aria-hidden', 'false');
        if (el.cartBtn) el.cartBtn.setAttribute('aria-expanded', 'true');
        setScrim(true);
        var f = focusablesIn(el.cartDrawer);
        if (f.length) f[0].focus();
    }

    function closeCart(refocus) {
        if (!el.cartDrawer) return;
        el.cartDrawer.classList.remove('is-open');
        el.cartDrawer.setAttribute('aria-hidden', 'true');
        if (el.cartBtn) el.cartBtn.setAttribute('aria-expanded', 'false');
        if (refocus !== false && el.cartBtn) el.cartBtn.focus();
        if (!overlayOpen()) setScrim(false);
    }

    /* ---- Cart (persisted in localStorage) ---- */
    function getCart() {
        try {
            return JSON.parse(global.localStorage.getItem('sukoonCart') || '{}');
        } catch (e) { return {}; }
    }

    function saveCart(cart) {
        try { global.localStorage.setItem('sukoonCart', JSON.stringify(cart)); } catch (e) {}
        updateBadge(cart);
        renderCart(cart);
    }

    function cartCount(cart) {
        var n = 0;
        for (var k in cart) { if (Object.prototype.hasOwnProperty.call(cart, k)) n += cart[k].qty; }
        return n;
    }

    function updateBadge(cart) {
        if (!el.cartBadge) return;
        var n = cartCount(cart);
        el.cartBadge.textContent = n;
        el.cartBadge.hidden = n === 0;
    }

    function renderCart(cart) {
        if (!el.cartBody || !el.cartFoot) return;
        var keys = Object.keys(cart);
        if (!keys.length) {
            el.cartBody.innerHTML = '';
            el.cartFoot.hidden = true;
            return;
        }
        var total = 0;
        var html = '';
        keys.forEach(function (id) {
            var item = cart[id];
            var name = item.name;
            if (global.SKI18N && global.SKI18N.t) {
                var translated = global.SKI18N.t('product.' + id, name);
                name = translated;
            }
            total += item.price * item.qty;
            html += '<div class="sk-cart-item">' +
                '<img src="' + escapeHtml(item.img) + '" alt="">' +
                '<div class="sk-cart-item-body">' +
                '<span class="sk-cart-item-name">' + escapeHtml(name) + '</span>' +
                '<span class="sk-cart-item-price">$' + item.price.toFixed(2) + ' \u00d7 ' + item.qty + '</span>' +
                '<span class="sk-cart-qty">' +
                '<button type="button" class="sk-qty-btn" data-id="' + escapeHtml(id) + '" data-delta="-1" aria-label="Decrease quantity" disabled>&minus;</button>' +
                '<span class="sk-qty-value">' + item.qty + '</span>' +
                '<button type="button" class="sk-qty-btn" data-id="' + escapeHtml(id) + '" data-delta="1" aria-label="Increase quantity" disabled>+</button>' +
                '</span></div>' +
                '<button type="button" class="sk-cart-remove" data-id="' + escapeHtml(id) + '" aria-label="Remove item">' +
                '<svg class="sk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
                '</button></div>';
        });
        el.cartBody.innerHTML = html;
        el.cartFoot.hidden = false;
        if (el.cartTotal) el.cartTotal.textContent = '$' + total.toFixed(2);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function initCart() {
        var cart = getCart();
        updateBadge(cart);
        renderCart(cart);

        if (el.cartBody) {
            el.cartBody.addEventListener('click', function (e) {
                var tgt = e.target;
                var qtyBtn = tgt.closest ? tgt.closest('.sk-qty-btn') : null;
                if (qtyBtn) {
                    var id = qtyBtn.getAttribute('data-id');
                    var delta = parseInt(qtyBtn.getAttribute('data-delta'), 10);
                    if (!cart[id]) return;
                    cart[id].qty += delta;
                    if (cart[id].qty <= 0) delete cart[id];
                    saveCart(cart);
                    return;
                }
                var rm = tgt.closest ? tgt.closest('.sk-cart-remove') : null;
                if (rm) {
                    delete cart[rm.getAttribute('data-id')];
                    saveCart(cart);
                }
            });
        }

        /* Add-to-cart buttons (product-detail page or static product pages) */
        document.querySelectorAll('.add-to-cart-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var id = btn.getAttribute('data-product-id') || btn.getAttribute('data-product');
                if (!id) return;

                var name = null, price = null, img = '';

                /* Try SK_PRODUCTS catalogue first (essence.html template) */
                if (global.SK_PRODUCTS) {
                    var prod = global.SK_PRODUCTS.byId(id);
                    if (prod) {
                        name = prod.nameKey;
                        if (global.SKI18N) name = global.SKI18N.t(prod.nameKey, name);
                        price = prod.price;
                        img = prod.image;
                    }
                }

                /* Fall back to inline data attributes (static product pages) */
                if (!name) {
                    name = btn.getAttribute('data-product-name') || btn.getAttribute('data-name');
                    price = parseFloat(btn.getAttribute('data-product-price') || btn.getAttribute('data-price'));
                    img = btn.getAttribute('data-product-image') || btn.getAttribute('data-image') || '';
                }

                if (!name || !price) return;

                if (!cart[id]) {
                    cart[id] = { name: name, price: price, img: img, qty: 1 };
                } else {
                    cart[id].qty += 1;
                }
                saveCart(cart);
                openCart();
            });
        });

        /* Quantity stepper */
        if (el.qtyInput && el.qtyMinus && el.qtyPlus) {
            function setQty(v) {
                el.qtyInput.value = v;
            }
            el.qtyPlus.addEventListener('click', function () {
                setQty(parseInt(el.qtyInput.value, 10) + 1);
            });
            el.qtyMinus.addEventListener('click', function () {
                var v = parseInt(el.qtyInput.value, 10);
                if (v > 1) setQty(v - 1);
            });
        }
    }

    function initSpinner() {
        var spinner = document.getElementById('spinner');
        if (!spinner) return;

        function hideSpinner() {
            spinner.classList.remove('show');
            spinner.style.setProperty('display', 'none', 'important');
            spinner.setAttribute('aria-hidden', 'true');
        }

        /* Hide immediately on DOMContentLoaded; fallback on window load; safety net at 3s. */
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', hideSpinner);
        } else {
            hideSpinner();
        }
        global.addEventListener('load', hideSpinner);
        setTimeout(hideSpinner, 3000);
    }

    /* Run spinner hide independently of init() so a JS error elsewhere
       never leaves the spinner stuck on screen. */
    initSpinner();

    function initSticky() {
        function onScroll() {
            var y = global.pageYOffset || document.documentElement.scrollTop;
            if (el.header) el.header.classList.toggle('is-scrolled', y >= 60);
            if (el.backToTop) {
                if (y > 300) {
                    el.backToTop.style.display = 'flex';
                } else {
                    el.backToTop.style.display = 'none';
                }
            }
        }
        global.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function initBackToTop() {
        if (!el.backToTop) return;
        el.backToTop.style.display = 'none';
        el.backToTop.addEventListener('click', function (e) {
            e.preventDefault();
            var start = global.pageYOffset || document.documentElement.scrollTop;
            var startTime = null;
            var duration = 800;
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = timestamp - startTime;
                var percent = Math.min(progress / duration, 1);
                var ease = 1 - Math.pow(1 - percent, 4);
                global.scrollTo(0, start * (1 - ease));
                if (progress < duration) global.requestAnimationFrame(step);
            }
            global.requestAnimationFrame(step);
        });
    }

    /* ---- smooth in-page anchors ---- */
    function initAnchors() {
        var links = document.querySelectorAll('a[href*="#"]:not([href="#"])');
        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var parts = this.getAttribute('href').split('#');
                if (parts.length < 2) return;
                var target = document.getElementById(parts[1]);
                if (!target) return;
                e.preventDefault();
                if (panelIsOpen()) closePanel(false);
                var offset = (el.header ? el.header.offsetHeight : 0) + 16;
                window.scrollTo({
                    top: global.pageYOffset + target.getBoundingClientRect().top - offset,
                    behavior: 'smooth'
                });
            });
        });
    }

    /* ---- Essence carousel (native scroll-snap) ---- */
    function initCarousel() {
        var TRACK = '[data-sk-others-track]';
        var LINK = '.sk-es-other-link';
        var EDGE_SLOP = 2;
        var SETTLE_MS = 140;
        var RESIZE_MS = 200;

        function prefersReducedMotion() {
            return global.matchMedia
                && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        function scrollTrack(track, left) {
            if (!prefersReducedMotion()) {
                track.scrollTo({ left: left, behavior: 'smooth' }); return;
            }
            var previous = track.style.scrollBehavior;
            track.style.scrollBehavior = 'auto';
            track.scrollTo({ left: left });
            track.style.scrollBehavior = previous;
        }
        function scrollTrackBy(track, left) {
            if (!prefersReducedMotion()) {
                track.scrollBy({ left: left, behavior: 'smooth' }); return;
            }
            var previous = track.style.scrollBehavior;
            track.style.scrollBehavior = 'auto';
            track.scrollBy({ left: left });
            track.style.scrollBehavior = previous;
        }
        function isRTL() { return document.documentElement.getAttribute('dir') === 'rtl'; }
        function linksIn(track) {
            return Array.prototype.slice.call(track.querySelectorAll(LINK));
        }
        function debounce(fn, wait) {
            var timer = null;
            return function () {
                global.clearTimeout(timer);
                timer = global.setTimeout(fn, wait);
            };
        }
        function step(track) {
            var first = track.querySelector('.sk-es-other');
            if (!first) return track.clientWidth;
            var styles = global.getComputedStyle(track);
            var gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
            return first.getBoundingClientRect().width + gap;
        }
        function maxScroll(track) { return Math.max(0, track.scrollWidth - track.clientWidth); }
        function scrollByStep(track, direction) { scrollTrackBy(track, step(track) * direction); }
        function updateArrows(track, prev, next, head) {
            var left = track.scrollLeft;
            var end = maxScroll(track);
            var canScroll = end > EDGE_SLOP;
            head.classList.toggle('sk-es-others-head--static', !canScroll);
            if (!canScroll) { prev.disabled = true; next.disabled = true; return; }
            var rtl = isRTL();
            var atStart = rtl ? left >= end - EDGE_SLOP : left <= EDGE_SLOP;
            var atEnd = rtl ? left <= EDGE_SLOP : left >= end - EDGE_SLOP;
            prev.disabled = atStart; next.disabled = atEnd;
        }
        function nearestIndex(track) {
            var links = linksIn(track);
            if (!links.length) return -1;
            var rtl = isRTL();
            var box = track.getBoundingClientRect();
            var origin = rtl ? box.right : box.left;
            var best = 0; var bestDistance = Infinity;
            links.forEach(function (link, index) {
                var r = link.getBoundingClientRect();
                var anchor = rtl ? r.right : r.left;
                var distance = Math.abs(anchor - origin);
                if (distance < bestDistance) { bestDistance = distance; best = index; }
            });
            return best;
        }
        function setActive(track, link) {
            if (!link) return;
            linksIn(track).forEach(function (other) {
                var isActive = other === link;
                other.classList.toggle('is-active', isActive);
                if (isActive) other.setAttribute('aria-current', 'true');
                else other.removeAttribute('aria-current');
            });
        }
        function revealCard(track, link) {
            if (!link) return;
            var box = track.getBoundingClientRect();
            var card = link.getBoundingClientRect();
            var styles = global.getComputedStyle(track);
            var gutter = parseFloat(styles.scrollPaddingLeft || '0') || 0;
            var delta = 0;
            if (isRTL()) {
                if (card.right > box.right - gutter) delta = card.right - (box.right - gutter);
                else if (card.left < box.left + gutter) delta = card.left - (box.left + gutter);
            } else {
                if (card.left < box.left + gutter) delta = card.left - (box.left + gutter);
                else if (card.right > box.right - gutter) delta = card.right - (box.right - gutter);
            }
            if (delta) scrollTrackBy(track, delta);
        }
        function mountTrack(track) {
            var root = track.closest('.sk-es-section') || document;
            var head = root.querySelector('.sk-es-others-head');
            var prev = root.querySelector('[data-sk-others-prev]');
            var next = root.querySelector('[data-sk-others-next]');
            if (!prev || !next) return;
            if (track.getAttribute('data-sk-others-ready') === 'true') return;
            track.setAttribute('data-sk-others-ready', 'true');
            var syncArrows = function () { updateArrows(track, prev, next, head); };
            var settle = debounce(function () { setActive(track, linksIn(track)[nearestIndex(track)]); syncArrows(); }, SETTLE_MS);
            prev.addEventListener('click', function () { scrollByStep(track, isRTL() ? 1 : -1); });
            next.addEventListener('click', function () { scrollByStep(track, isRTL() ? -1 : 1); });
            track.addEventListener('scroll', syncArrows, { passive: true });
            track.addEventListener('scroll', settle, { passive: true });
            if (global.document && global.document.fonts && global.document.fonts.ready) {
                global.document.fonts.ready.then(syncArrows);
            }
            if ('ResizeObserver' in global) {
                var ro = new ResizeObserver(syncArrows); ro.observe(track);
            }
            global.addEventListener('resize', debounce(syncArrows, RESIZE_MS));
            track.addEventListener('load', syncArrows, true);
            global.addEventListener('load', syncArrows);
            track.addEventListener('keydown', function (e) {
                var forward = isRTL() ? -1 : 1;
                var links = linksIn(track);
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    var focused = document.activeElement;
                    var onCard = focused && focused.matches && focused.matches(LINK);
                    if (onCard) {
                        var index = links.indexOf(focused);
                        if (index === -1) return;
                        var target = links[index + (e.key === 'ArrowRight' ? forward : -forward)];
                        if (!target) return;
                        e.preventDefault(); revealCard(track, target); target.focus(); return;
                    }
                    e.preventDefault();
                    scrollByStep(track, e.key === 'ArrowRight' ? forward : -forward);
                } else if (e.key === 'Home') { e.preventDefault(); scrollTrack(track, 0); }
                else if (e.key === 'End') { e.preventDefault(); scrollTrack(track, maxScroll(track)); }
            });
            track.addEventListener('click', function (e) {
                var link = e.target.closest ? e.target.closest(LINK) : null;
                if (link && track.contains(link)) setActive(track, link);
            });
            track.addEventListener('focusin', function (e) {
                var link = e.target.closest ? e.target.closest(LINK) : null;
                if (link && track.contains(link)) revealCard(track, link);
            });
            syncArrows();
        }
        var tracks = document.querySelectorAll(TRACK);
        for (var i = 0; i < tracks.length; i++) mountTrack(tracks[i]);
    }

    /* ---- Scroll reveal ---- */
    function initReveal() {
        var targets = Array.prototype.slice.call(document.querySelectorAll('.sk-reveal'));
        if (!targets.length) return;
        if (!('IntersectionObserver' in global)) {
            targets.forEach(function (el) { el.classList.add('is-revealed'); }); return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
                el.style.transitionDelay = delay + 'ms';
                el.classList.add('is-revealed');
                observer.unobserve(el);
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
        targets.forEach(function (el) { observer.observe(el); });
    }

    function init() {
        /* Language menu */
        if (el.langBtn) {
            el.langBtn.addEventListener('click', function () {
                setLangMenu(!langIsOpen());
            });
        }
        if (el.langItems) {
            el.langItems.forEach(function (item) {
                item.addEventListener('click', function () {
                    var lang = item.getAttribute('data-lang');
                    setLanguage(lang);
                    setLangMenu(false);
                    if (el.langBtn) el.langBtn.focus();
                });
                item.addEventListener('keydown', function (e) {
                    var items = langItemsArray();
                    var i = items.indexOf(this);
                    var next = null;
                    if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
                    if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
                    if (e.key === 'Home') next = items[0];
                    if (e.key === 'End') next = items[items.length - 1];
                    if (e.key === 'Escape' || e.key === 'Tab') {
                        if (e.key === 'Escape') setLangMenu(false);
                        return;
                    }
                    if (next) {
                        e.preventDefault();
                        next.focus();
                    }
                });
            });
        }

        document.addEventListener('click', function (e) {
            if (langIsOpen() && el.langBtn && !el.langBtn.contains(e.target) && el.langMenu && !el.langMenu.contains(e.target)) {
                setLangMenu(false);
            }
        });

        /* Panel / cart open-close */
        if (el.hamburger) el.hamburger.addEventListener('click', function () { panelIsOpen() ? closePanel() : openPanel(); });
        if (el.panelClose) el.panelClose.addEventListener('click', function () { closePanel(); });
        if (el.cartBtn) el.cartBtn.addEventListener('click', function () { cartIsOpen() ? closeCart() : openCart(); });
        if (el.cartClose) el.cartClose.addEventListener('click', function () { closeCart(); });
        if (el.scrim) el.scrim.addEventListener('click', function () {
            if (panelIsOpen()) closePanel(false);
            if (cartIsOpen()) closeCart(false);
            setScrim(false);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (langIsOpen()) { setLangMenu(false); return; }
                if (panelIsOpen()) { closePanel(); return; }
                if (cartIsOpen()) { closeCart(); return; }
                return;
            }
            if (e.key === 'Tab' && overlayOpen()) {
                var host = panelIsOpen() ? el.panel : el.cartDrawer;
                if (!host) return;
                var f = focusablesIn(host);
                if (!f.length) return;
                var first = f[0];
                var last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        });

        document.addEventListener('focusin', function (e) {
            if (overlayOpen()) {
                var host = panelIsOpen() ? el.panel : el.cartDrawer;
                if (!host || !host.contains(e.target)) {
                    var f = focusablesIn(host);
                    if (f.length) f[0].focus();
                }
            }
        });

        initCart();
        initSticky();
        initBackToTop();
        initAnchors();
        initCarousel();
        initReveal();

        /* Apply stored language */
        var lang = readLang();
        setLanguage(lang, false);

        /* Expose for testing / scripting */
        global.applyInlineLang = applyInlineLang;
        global.setLanguage = setLanguage;
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);