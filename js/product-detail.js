/********** SUKOON — Product detail behaviour (page-local) **********
 * Reads ?essence=, validates it, then drives:
 *  - the <body data-essence> accent
 *  - the gallery (main image + thumbnails) from the per-essence asset manifest
 *  - the product title / <title> / meta via the shared i18n product keys
 *  - the "Découvrir les autres essences" carousel active state
 *  - the quantity stepper and the accessible tab bar
 *
 * Only references images that already exist in the repo. Essences without an
 * img/essences/<slug>/ folder fall back to their product packshot + lifestyle
 * photo (img/products/product-*.png) — nothing is invented or downloaded.
 */
(function (global) {
    "use strict";

    var SUPPORTED_SLUG = [
        'royal-verbena', 'moroccan-mint', 'noble-chamomile',
        'atlas-oregano', 'ruby-hibiscus', 'heritage-fennel'
    ];
    var DEFAULT_SLUG = 'moroccan-mint';

    /* Existing repo assets per essence. ruby-hibiscus is the only essence with a
       dedicated img/essences/<slug>/ folder; the other five reuse their existing
       product packshots (mix-blend friendly) and lifestyle photos (cover). */
    var GALLERY = {
        'royal-verbena': { photos: ['img/products/product_5_verveine.png'], packshots: ['img/products/product-royal-verbena.png'] },
        'moroccan-mint': { photos: ['img/products/product_3_menthe.png'], packshots: ['img/products/product-moroccan-mint.png'] },
        'noble-chamomile': { photos: ['img/products/product_4_chamomille.png'], packshots: ['img/products/product-noble-chamomile.png'] },
        'atlas-oregano': { photos: ['img/products/product_2_origan.png'], packshots: ['img/products/product-atlas-oregano.png'] },
        'ruby-hibiscus': {
            photos: [
                'img/essences/ruby-hibiscus/flower.jpg',
                'img/essences/ruby-hibiscus/ritual-cup.jpg',
                'img/essences/ruby-hibiscus/step-1.jpg',
                'img/essences/ruby-hibiscus/step-2.jpg',
                'img/essences/ruby-hibiscus/step-3.jpg',
                'img/essences/ruby-hibiscus/step-4.jpg'
            ],
            packshots: ['img/products/product-ruby-hibiscus.png']
        },
        'heritage-fennel': { photos: ['img/products/product_6_fenouil.png'], packshots: ['img/products/product-heritage-fennel.png'] }
    };

    /* i18n alt keys that already exist for the hibiscus hero images — reused
       rather than inventing new copy. */
    var HIBISCUS_ALT_KEYS = {
        'img/essences/ruby-hibiscus/flower.jpg': 'discover.imageAlt',
        'img/essences/ruby-hibiscus/ritual-cup.jpg': 'ritual.imageAlt',
        'img/essences/ruby-hibiscus/step-1.jpg': 'ritual.steps.01.alt',
        'img/essences/ruby-hibiscus/step-2.jpg': 'ritual.steps.02.alt',
        'img/essences/ruby-hibiscus/step-3.jpg': 'ritual.steps.03.alt',
        'img/essences/ruby-hibiscus/step-4.jpg': 'ritual.steps.04.alt'
    };

    function readEssence() {
        var params = new URLSearchParams(global.location.search);
        var raw = params.get('essence');
        if (raw && SUPPORTED_SLUG.indexOf(raw) !== -1) return raw;
        return DEFAULT_SLUG;
    }

    function esc(value) {
        return String(value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function t(key, fallback) {
        if (global.SKI18N && global.SKI18N.t) {
            var v = global.SKI18N.t(key);
            if (v && v !== key) return v;
        }
        return fallback || key;
    }

    function productName(slug) {
        var key = 'product.' + slug;
        return t(key, key);
    }

    function buildImages(slug) {
        var def = GALLERY[slug] || GALLERY[DEFAULT_SLUG];
        var list = [];
        def.photos.forEach(function (src) { list.push({ src: src, kind: 'photo' }); });
        def.packshots.forEach(function (src) { list.push({ src: src, kind: 'packshot' }); });
        return list;
    }

    function mainImgAlt(slug, src) {
        if (slug === 'ruby-hibiscus' && HIBISCUS_ALT_KEYS[src]) {
            return t(HIBISCUS_ALT_KEYS[src], productName(slug));
        }
        if (/product-.*\.png$/.test(src)) {
            return t('product.' + slug + '.alt', productName(slug));
        }
        return productName(slug);
    }

    function renderGallery(slug) {
        var main = document.getElementById('skPdMainImg');
        var thumbs = document.getElementById('skPdThumbs');
        var name = productName(slug);
        if (!main || !thumbs) return;

        var images = buildImages(slug);
        var first = images[0] || { src: GALLERY[DEFAULT_SLUG].packshots[0], kind: 'packshot' };

        main.src = first.src;
        main.alt = mainImgAlt(slug, first.src);
        main.className = first.kind === 'photo' ? 'sk-es-img' : 'sk-es-other-img';
        main.setAttribute('data-sk-pd-alt', main.alt);

        thumbs.innerHTML = '';
        images.forEach(function (img, i) {
            var figure = document.createElement('figure');
            figure.className = 'sk-pd-thumb' + (i === 0 ? ' is-active' : '') + (img.kind === 'photo' ? ' sk-pd-thumb--photo' : '');
            figure.setAttribute('data-sk-pd-img', img.src);
            figure.setAttribute('data-sk-pd-kind', img.kind);
            figure.setAttribute('data-sk-pd-alt', mainImgAlt(slug, img.src));
            figure.setAttribute('aria-label', name + ' — ' + (i + 1));
            var thumbImg = document.createElement('img');
            thumbImg.src = img.src;
            thumbImg.alt = '';
            thumbImg.className = img.kind === 'photo' ? 'sk-es-img' : 'sk-es-other-img';
            figure.appendChild(thumbImg);
            thumbs.appendChild(figure);
        });
    }

    function setActiveCarousel(slug) {
        var track = document.getElementById('skPdOthersTrack');
        if (!track) return;
        var links = track.querySelectorAll('.sk-es-other-link');
        links.forEach(function (link) {
            var href = link.getAttribute('href') || '';
            var isActive = href.indexOf('essence=' + slug) !== -1 || link.getAttribute('href') === 'product-detail.html?essence=' + slug;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /* ---- Accessible tab bar ---- */
    function initTabs(root) {
        if (!root) return;
        var tabs = root.querySelectorAll('[role="tab"]');
        if (!tabs.length) return;

        tabs.forEach(function (tab) {
            tab.addEventListener('click', onTabClick);
            tab.addEventListener('keydown', onTabKey);
        });

        function onTabClick(e) {
            e.preventDefault();
            activate(Array.prototype.indexOf.call(tabs, this));
        }

        function onTabKey(e) {
            var idx = Array.prototype.indexOf.call(tabs, document.activeElement);
            var count = tabs.length;
            var next = idx;
            switch (e.key) {
                case 'ArrowRight': next = (idx + 1) % count; break;
                case 'ArrowLeft':  next = (idx - 1 + count) % count; break;
                case 'Home':       next = 0; break;
                case 'End':        next = count - 1; break;
                default: return;
            }
            e.preventDefault();
            activate(next);
            tabs[next].focus();
        }

        function activate(idx) {
            tabs.forEach(function (tab, i) {
                var panel = document.getElementById(tab.getAttribute('aria-controls'));
                var on = i === idx;
                tab.setAttribute('aria-selected', on ? 'true' : 'false');
                tab.tabIndex = on ? 0 : -1;
                if (panel) {
                    panel.classList.toggle('is-hidden', !on);
                    panel.setAttribute('aria-hidden', on ? 'false' : 'true');
                }
            });
        }
    }

    /* ---- Quantity stepper (kept local, no framework) ---- */
    function initQty() {
        var input = document.getElementById('skPdQty');
        var minus = document.getElementById('skPdMinus');
        var plus = document.getElementById('skPdPlus');
        if (!input || !minus || !plus) return;
        function set(v) {
            input.value = v;
            if (window.dispatchEvent) {
                input.dispatchEvent(new global.Event('input', { bubbles: true }));
            }
        }
        plus.addEventListener('click', function () { set(parseInt(input.value, 10) + 1); });
        minus.addEventListener('click', function () {
            var v = parseInt(input.value, 10);
            if (v > 1) set(v - 1);
        });
    }

    /* ---- Gallery thumb click -> swap main image ---- */
    function initGallerySwap() {
        var thumbs = document.getElementById('skPdThumbs');
        var main = document.getElementById('skPdMainImg');
        if (!thumbs || !main) return;
        thumbs.addEventListener('click', function (e) {
            var fig = e.target.closest('.sk-pd-thumb');
            if (!fig) return;
            var src = fig.getAttribute('data-sk-pd-img');
            if (!src) return;
                        
            main.src = src;
            main.alt = fig.getAttribute('data-sk-pd-alt') || '';
            main.className = fig.classList.contains('sk-pd-thumb--photo') ? 'sk-es-img' : 'sk-es-other-img';
            thumbs.querySelectorAll('.sk-pd-thumb').forEach(function (t) {
                t.classList.toggle('is-active', t === fig);
            });
        });
    }

    /* ---- Keep Add-to-Cart wired to the shared header cart.
       main.js binds any .add-to-cart-btn[data-product] at load; applyProduct()
       above keeps data-product in sync with the selected essence. ---- */

    /* ---- Review star rating (display only; form is not submitted) ---- */
    function initReviewStars() {
        var container = document.getElementById('skPdReviewStars');
        if (!container) return;
        var stars = container.querySelectorAll('.sk-pd-star');
        stars.forEach(function (star, index) {
            star.addEventListener('click', function () {
                var rating = index + 1;
                var hidden = container.parentNode.querySelector('#sk-pd-review-rating');
                if (!hidden) {
                    hidden = global.document.createElement('input');
                    hidden.setAttribute('type', 'hidden');
                    hidden.setAttribute('id', 'sk-pd-review-rating');
                    hidden.setAttribute('name', 'rating');
                    container.parentNode.appendChild(hidden);
                }
                hidden.value = rating;
                stars.forEach(function (s, i) {
                    s.classList.toggle('is-selected', i < rating);
                });
            });
        });
    }

    function initReviewForm() {
        var form = document.getElementById('skPdReviewForm');
        if (!form) return;
        form.addEventListener('submit', function (e) { e.preventDefault(); });
    }

    function init() {
        var slug = readEssence();
        global.document.documentElement.setAttribute('data-essence', slug);
        global.document.body.setAttribute('data-essence', slug);

        applyProduct(slug);

        renderGallery(slug);
        setActiveCarousel(slug);
        initGallerySwap();
        initTabs(document.getElementById('skPdTabs'));
        initQty();
        initReviewStars();
        initReviewForm();

        /* Keep i18n nodes in sync if the header language menu changes locale. */
        if (global.SKI18N && global.SKI18N.onChange) {
            global.SKI18N.onChange(function () { applyProduct(slug); });
        }
    }

    /* Apply the essence name to the title, <title> and the Add-to-Cart label. */
    function applyProduct(slug) {
        var titleEl = document.getElementById('skPdTitle');
        var titleText = productName(slug);
        if (titleEl) {
            titleEl.textContent = titleText;
            titleEl.setAttribute('data-i18n', 'product.' + slug);
        }
        if (global.document.title && titleText) {
            global.document.title = titleText + ' — Sukoon';
        }
        var btn = document.getElementById('skPdCartBtn');
        if (btn) {
            btn.setAttribute('data-product', slug);
        }
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
