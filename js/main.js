(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 60) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-150px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Modal Video
    var $videoSrc;
    $('.btn-play').click(function () {
        $videoSrc = $(this).data("src");
    });
    console.log($videoSrc);
    $('#videoModal').on('shown.bs.modal', function (e) {
        $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    })
    $('#videoModal').on('hide.bs.modal', function (e) {
        $("#video").attr('src', $videoSrc);
    })


    // Product carousel
    $(".product-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        center: true,
        dots: false,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
			0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


    // Testimonial carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        loop: true,
        dots: true,
        nav: false,
    });
    
    })(jQuery);

    // ===== Sukoon Header =====
    (function () {
        "use strict";

        var LANG_CODES = { en: 'EN', fr: 'FR', ar: 'AR' };

        var el = {
            header: document.getElementById('skHeader'),
            langBtn: document.getElementById('skLangBtn'),
            langMenu: document.getElementById('skLangMenu'),
            langCode: document.getElementById('skLangCode'),
            langItems: document.querySelectorAll('.sk-lang-item'),
            hamburger: document.getElementById('skHamburger'),
            panel: document.getElementById('skNavPanel'),
            panelClose: document.getElementById('skPanelClose'),
            cartBtn: document.getElementById('skCartBtn'),
            cartDrawer: document.getElementById('skCartDrawer'),
            cartClose: document.getElementById('skCartClose'),
            scrim: document.getElementById('skScrim'),
            cartBadge: document.getElementById('skCartBadge'),
            cartBody: document.getElementById('skCartBody'),
            cartFoot: document.getElementById('skCartFoot'),
            cartTotal: document.getElementById('skCartTotal')
        };

        if (!el.header) return;

        var PRODUCTS = {
            'moroccan-mint': { name: 'Menthe Marocaine', price: 18, img: 'img/products/product-moroccan-mint.png' },
            'royal-verbena': { name: 'Verveine Royale', price: 18, img: 'img/products/product-royal-verbena.png' },
            'ruby-hibiscus': { name: 'Hibiscus Rubis', price: 18, img: 'img/products/product-ruby-hibiscus.png' },
            'atlas-oregano': { name: "Origan d'Atlas", price: 18, img: 'img/products/product-atlas-oregano.png' },
            'noble-chamomile': { name: 'Camomille Noble', price: 18, img: 'img/products/product-noble-chamomile.png' },
            'heritage-fennel': { name: 'Fenouil Héritage', price: 18, img: 'img/products/product-heritage-fennel.png' }
        };

        var cart = JSON.parse(localStorage.getItem('sukoonCart') || '{}');
        var currentLang = localStorage.getItem('sukoonLang') || 'en';
        var focusables = 'a[href], button:not([disabled])';
        var lastFocused = null;

        /* ---- Scroll state ---- */
        function onScroll() {
            var y = window.pageYOffset || document.documentElement.scrollTop;
            el.header.classList.toggle('is-scrolled', y >= 60);
        }

        /* ---- Language menu ---- */
        function langIsOpen() {
            return el.langMenu.classList.contains('is-open');
        }

        function setLangMenu(open) {
            el.langMenu.classList.toggle('is-open', open);
            el.langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                var sel = el.langMenu.querySelector('[aria-selected="true"]');
                if (sel) sel.focus();
            } else {
                el.langBtn.focus();
            }
        }

        function langItemsArray() {
            return Array.prototype.slice.call(el.langItems);
        }

        function setLanguage(lang, persist) {
            currentLang = lang;
            if (persist !== false) {
                localStorage.setItem('sukoonLang', lang);
            }
            el.langCode.textContent = LANG_CODES[lang] || 'EN';
            langItemsArray().forEach(function (item) {
                item.setAttribute('aria-selected', item.getAttribute('data-lang') === lang ? 'true' : 'false');
            });
            var html = document.documentElement;
            if (lang === 'ar') {
                html.lang = 'ar';
                html.setAttribute('dir', 'rtl');
            } else {
                html.lang = lang;
                html.setAttribute('dir', 'ltr');
            }
        }

        el.langBtn.addEventListener('click', function () {
            setLangMenu(!langIsOpen());
        });

        el.langItems.forEach(function (item, index, all) {
            item.addEventListener('click', function () {
                setLanguage(item.getAttribute('data-lang'));
                el.langMenu.classList.remove('is-open');
                el.langBtn.setAttribute('aria-expanded', 'false');
                el.langBtn.focus();
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
                    if (e.key === 'Escape') {
                        setLangMenu(false);
                    }
                    return;
                }
                if (next) {
                    e.preventDefault();
                    next.focus();
                }
            });
        });

        /* ---- Drawers ---- */
        function overlayOpen() {
            return panelIsOpen() || cartIsOpen();
        }

        function panelIsOpen() {
            return el.panel.classList.contains('is-open');
        }

        function cartIsOpen() {
            return el.cartDrawer.classList.contains('is-open');
        }

        function setScrim(on) {
            el.scrim.hidden = !on;
        }

        function focusablesIn(node) {
            return Array.prototype.slice.call(node.querySelectorAll(focusables))
                .filter(function (f) { return f.offsetParent !== null; });
        }

        function openPanel() {
            lastFocused = document.activeElement;
            el.panel.classList.add('is-open');
            el.panel.setAttribute('aria-hidden', 'false');
            el.hamburger.classList.add('is-open');
            el.hamburger.setAttribute('aria-expanded', 'true');
            el.hamburger.setAttribute('aria-label', 'Close menu');
            el.cartDrawer.classList.remove('is-open');
            el.cartDrawer.setAttribute('aria-hidden', 'true');
            el.cartBtn.setAttribute('aria-expanded', 'false');
            setScrim(true);
            var f = focusablesIn(el.panel);
            if (f.length) f[0].focus();
        }

        function closePanel(refocus) {
            el.panel.classList.remove('is-open');
            el.panel.setAttribute('aria-hidden', 'true');
            el.hamburger.classList.remove('is-open');
            el.hamburger.setAttribute('aria-expanded', 'false');
            el.hamburger.setAttribute('aria-label', 'Open menu');
            if (refocus !== false) el.hamburger.focus();
            if (!overlayOpen()) setScrim(false);
        }

        function openCart() {
            lastFocused = document.activeElement;
            closePanel(false);
            el.cartDrawer.classList.add('is-open');
            el.cartDrawer.setAttribute('aria-hidden', 'false');
            el.cartBtn.setAttribute('aria-expanded', 'true');
            setScrim(true);
            var f = focusablesIn(el.cartDrawer);
            if (f.length) f[0].focus();
        }

        function closeCart(refocus) {
            el.cartDrawer.classList.remove('is-open');
            el.cartDrawer.setAttribute('aria-hidden', 'true');
            el.cartBtn.setAttribute('aria-expanded', 'false');
            if (refocus !== false) el.cartBtn.focus();
            if (!overlayOpen()) setScrim(false);
        }

        el.hamburger.addEventListener('click', function () {
            panelIsOpen() ? closePanel() : openPanel();
        });
        el.panelClose.addEventListener('click', function () { closePanel(); });
        el.cartBtn.addEventListener('click', function () {
            cartIsOpen() ? closeCart() : openCart();
        });
        el.cartClose.addEventListener('click', function () { closeCart(); });
        el.scrim.addEventListener('click', function () {
            if (panelIsOpen()) closePanel(false);
            if (cartIsOpen()) closeCart(false);
            setScrim(false);
        });

        document.addEventListener('click', function (e) {
            if (langIsOpen() && !el.langBtn.contains(e.target) && !el.langMenu.contains(e.target)) {
                el.langMenu.classList.remove('is-open');
                el.langBtn.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (langIsOpen()) {
                    setLangMenu(false);
                    return;
                }
                if (panelIsOpen()) { closePanel(); return; }
                if (cartIsOpen()) { closeCart(); }
                return;
            }

            if (e.key === 'Tab' && overlayOpen()) {
                var host = panelIsOpen() ? el.panel : el.cartDrawer;
                var f = focusablesIn(host);
                if (!f.length) return;
                var first = f[0];
                var last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        document.addEventListener('focusin', function (e) {
            if (overlayOpen()) {
                var host = panelIsOpen() ? el.panel : el.cartDrawer;
                if (!host.contains(e.target)) {
                    var f = focusablesIn(host);
                    if (f.length) f[0].focus();
                }
            }
        });

        /* ---- Cart ---- */
        function cartCount() {
            var n = 0;
            for (var k in cart) {
                if (Object.prototype.hasOwnProperty.call(cart, k)) n += cart[k].qty;
            }
            return n;
        }

        function updateBadge() {
            var n = cartCount();
            el.cartBadge.textContent = n;
            el.cartBadge.hidden = n === 0;
        }

        function renderCart() {
            var keys = Object.keys(cart);
            if (keys.length === 0) {
                el.cartBody.innerHTML = '';
                el.cartFoot.hidden = true;
                return;
            }
            var total = 0;
            var html = '';
            keys.forEach(function (id) {
                var item = cart[id];
                total += item.price * item.qty;
                html += '<div class="sk-cart-item">' +
                    '<img src="' + item.img + '" alt="">' +
                    '<div class="sk-cart-item-body">' +
                    '<span class="sk-cart-item-name">' + item.name + '</span>' +
                    '<span class="sk-cart-item-price">$' + item.price.toFixed(2) + ' &times; ' + item.qty + '</span>' +
                    '<span class="sk-cart-qty">' +
                    '<button type="button" class="sk-qty-btn" data-id="' + id + '" data-delta="-1" aria-label="Decrease quantity">&minus;</button>' +
                    '<span class="sk-qty-value">' + item.qty + '</span>' +
                    '<button type="button" class="sk-qty-btn" data-id="' + id + '" data-delta="1" aria-label="Increase quantity">+</button>' +
                    '</span></div>' +
                    '<button type="button" class="sk-cart-remove" data-id="' + id + '" aria-label="Remove ' + item.name + '">' +
                    '<svg class="sk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
                    '</button></div>';
            });
            el.cartBody.innerHTML = html;
            el.cartFoot.hidden = false;
            el.cartTotal.textContent = '$' + total.toFixed(2);
        }

        function saveCart() {
            localStorage.setItem('sukoonCart', JSON.stringify(cart));
            updateBadge();
            renderCart();
        }

        el.cartBody.addEventListener('click', function (e) {
            var qtyBtn = e.target.closest('.sk-qty-btn');
            if (qtyBtn) {
                var id = qtyBtn.getAttribute('data-id');
                var delta = parseInt(qtyBtn.getAttribute('data-delta'), 10);
                if (!cart[id]) return;
                cart[id].qty += delta;
                if (cart[id].qty <= 0) delete cart[id];
                saveCart();
                return;
            }
            var rm = e.target.closest('.sk-cart-remove');
            if (rm) {
                delete cart[rm.getAttribute('data-id')];
                saveCart();
            }
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var id = btn.getAttribute('data-product');
                var product = PRODUCTS[id];
                if (!product) return;
                if (cart[id]) {
                    cart[id].qty += 1;
                } else {
                    cart[id] = { name: product.name, price: product.price, img: product.img, qty: 1 };
                }
                saveCart();
                openCart();
            });
        });

        /* ---- Smooth in-page anchors, offset by header height ---- */
        document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var parts = this.getAttribute('href').split('#');
                if (parts.length < 2) return;
                var target = document.getElementById(parts[1]);
                if (!target) return;
                e.preventDefault();
                if (panelIsOpen()) closePanel(false);
                var offset = el.header.offsetHeight + 16;
                window.scrollTo({
                    top: window.pageYOffset + target.getBoundingClientRect().top - offset,
                    behavior: 'smooth'
                });
            });
        });

        /* ---- Init ---- */
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        setLanguage(currentLang, false);
        updateBadge();
        renderCart();
    })();



