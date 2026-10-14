/********** SUKOON — Checkout page logic **********
 * Handles order summary rendering, form validation, submission,
 * language switching, session storage for drafts, and state
 * transitions (empty → form → confirmation).
 *
 * Depends on globals exposed by js/main.js:
 *   - getCart()         : reads cart from localStorage
 *   - saveCart(cart)    : persists cart, updates badge + drawer
 *   - CURRENCY          : { symbol, code, format(amount) }
 *   - t(key, vars)      : i18n translation with {token} interpolation
 *   - cartCount(cart)   : total item count
 *   - cartCatalogueById : lookup product by id
 ********/
(function (global) {
    "use strict";

    /* ==================== CONFIGURATION ==================== */

    /* Payment methods — add a new entry to enable a method later.
       The `disabled` flag renders the option as disabled with a note. */
    var PAYMENT_METHODS = [
        { id: 'cod',  labelKey: 'checkout.payment.cod',    noteKey: null,          disabled: false },
        { id: 'card', labelKey: 'checkout.payment.card',   noteKey: 'checkout.payment.comingSoon', disabled: true }
    ];

    var NOTES_MAX = 300;
    var SESSION_DRAFT_KEY = 'sukoonCheckoutDraft';
    var ORDER_STORAGE_KEY = 'sukoonLastOrder';
    var CART_STORAGE_KEY = 'sukoonCart';

    /* ==================== UTILITIES ==================== */

    function t(key, vars) {
        if (global.SKI18N && global.SKI18N.t) return global.SKI18N.t(key, vars);
        return key;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatPrice(amount) {
        var CUR = global.CURRENCY || { format: function (v) { return String(v); } };
        return CUR.format(amount);
    }

    /* SK-YYYYMMDD-XXXX (random base-36). Clearly temporary — server must assign real orderRef. */
    function generateOrderRef() {
        var d = new Date();
        var ymd = d.getFullYear().toString() +
            (d.getMonth() + 1).toString().padStart(2, '0') +
            d.getDate().toString().padStart(2, '0');
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var rand = '';
        for (var i = 0; i < 4; i++) {
            rand += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return 'SK-' + ymd + '-' + rand;
    }

    function normalizePhone(phone) {
        var noSpace = (phone || '').replace(/\s+/g, '');
        if (noSpace.indexOf('+212') === 0) {
            return '0' + noSpace.slice(4);
        }
        if (noSpace.indexOf('212') === 0) {
            return '0' + noSpace.slice(3);
        }
        return noSpace;
    }

    function validatePhone(phone) {
        var normalized = normalizePhone(phone);
        return /^0[67]\d{8}$/.test(normalized);
    }

    function validateEmail(email) {
        if (!email || !email.trim()) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    /* ==================== STATE ==================== */

    var state = {
        cart: {},
        submitting: false
    };

    /* ==================== DOM CACHE ==================== */

    var $ = function (id) { return document.getElementById(id); };

    var el = {
        emptyState:       $('skCheckoutEmptyState'),
        content:          $('skCheckoutContent'),
        confirmation:     $('skCheckoutConfirmation'),
        summaryCol:       $('skCheckoutSummaryCol'),
        summaryToggle:    $('skCheckoutSummaryToggle'),
        summaryContent:   $('skCheckoutSummary'),
        summaryList:      $('skCheckoutSummaryList'),
        summarySubtotal:  $('skCheckoutSubtotal'),
        summaryTotal:     $('skCheckoutTotal'),
        form:             $('skCheckoutForm'),
        errorsBox:        $('skCheckoutErrors'),
        errorsList:       $('skCheckoutErrorsList'),
        name:             $('skCheckoutName'),
        phone:            $('skCheckoutPhone'),
        email:            $('skCheckoutEmail'),
        street:           $('skCheckoutStreet'),
        city:             $('skCheckoutCity'),
        postal:           $('skCheckoutPostal'),
        notes:            $('skCheckoutNotes'),
        notesCounter:     $('skCheckoutNotesCounter'),
        consent:          $('skCheckoutConsent'),
        submit:           $('skCheckoutSubmit'),
        orderRef:         $('skCheckoutOrderRef'),
        confirmList:      $('skCheckoutConfirmationList'),
        confirmTotal:     $('skCheckoutConfirmationTotal'),
        fieldErrors: {
            name:     $('skCheckoutNameError'),
            phone:    $('skCheckoutPhoneError'),
            email:    $('skCheckoutEmailError'),
            street:   $('skCheckoutStreetError'),
            city:     $('skCheckoutCityError'),
            postal:   $('skCheckoutPostalError'),
            consent:  $('skCheckoutConsentError')
        },
        fields: {}
    };

    el.fields.name    = $('skCheckoutName');
    el.fields.phone   = $('skCheckoutPhone');
    el.fields.email   = $('skCheckoutEmail');
    el.fields.street  = $('skCheckoutStreet');
    el.fields.city    = $('skCheckoutCity');
    el.fields.postal  = $('skCheckoutPostal');
    el.fields.notes   = $('skCheckoutNotes');
    el.fields.consent = $('skCheckoutConsent');

    /* ==================== RENDERING ==================== */

    function renderInitial() {
        var cart = (global.getCart ? global.getCart() : {});
        state.cart = cart;
        var count = Object.keys(cart).length;

        if (count === 0) {
            showEmptyState();
            return;
        }

        showCheckout();
        renderSummary();
        restoreDraft();
        updateNotesCounter();
    }

    function showEmptyState() {
        if (el.emptyState) el.emptyState.hidden = false;
        if (el.content) el.content.hidden = true;
        if (el.confirmation) el.confirmation.hidden = true;
    }

    function showCheckout() {
        if (el.emptyState) el.emptyState.hidden = true;
        if (el.content) el.content.hidden = false;
        if (el.confirmation) el.confirmation.hidden = true;
    }

/* Build the order summary item rows — identical markup to the cart drawer
   (js/main.js renderCart), so both render the same sk-cart-item structure. */
    function renderSummary() {
        var cart = state.cart;
        var list = el.summaryList;
        if (!list) return;

        var keys = Object.keys(cart);
        var html = '';
        var subtotal = 0;

        keys.forEach(function (id) {
            var item = cart[id];
            var name = item.name;
            var tagline = item.tagline || '';
            if (!tagline) {
                var prod = (global.cartCatalogueById ? global.cartCatalogueById(id) : null);
                if (prod && prod.taglineKey) {
                    tagline = global.SKI18N ? global.SKI18N.t(prod.taglineKey) : '';
                }
            }
            if (!name) {
                var prodName = (global.cartCatalogueById ? global.cartCatalogueById(id) : null);
                if (prodName && prodName.nameKey) {
                    name = global.SKI18N ? global.SKI18N.t(prodName.nameKey) : '';
                }
            }
            var img = item.img || '';
            if (!img) {
                var prodImg = (global.cartCatalogueById ? global.cartCatalogueById(id) : null);
                if (prodImg) img = prodImg.image;
            }
            var lineTotal = item.price * item.qty;
            subtotal += lineTotal;

            html += '<div class="sk-cart-item">' +
                '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(name) + '">' +
                '<div class="sk-cart-item-body">' +
                '<span class="sk-cart-item-name">' + escapeHtml(name) + '</span>' +
                '<span class="sk-cart-item-tagline">' + escapeHtml(tagline) + '</span>' +
                '<div class="sk-cart-item-grid">' +
                '<div class="sk-cart-qty">' +
                '<button type="button" class="sk-qty-btn" data-id="' + escapeHtml(id) + '" data-delta="-1" aria-label="' + escapeHtml(t('decreaseQty')) + '">&#8722;</button>' +
                '<span class="sk-qty-value">' + item.qty + '</span>' +
                '<button type="button" class="sk-qty-btn" data-id="' + escapeHtml(id) + '" data-delta="1" aria-label="' + escapeHtml(t('increaseQty')) + '">+</button>' +
                '</div>' +
                '<span class="sk-cart-item-price">' + formatPrice(lineTotal) + '</span>' +
                '</div>' +
                '</div>' +
                '<button type="button" class="sk-cart-remove" data-id="' + escapeHtml(id) + '" aria-label="' + escapeHtml(t('cartRemove')) + '">' +
                '<svg class="sk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path></svg>' +
                '</button></div>';
        });

        list.innerHTML = html;

        if (el.summarySubtotal) el.summarySubtotal.textContent = formatPrice(subtotal);
        if (el.summaryTotal) el.summaryTotal.textContent = formatPrice(subtotal);
    }

    /* ==================== EVENT HANDLERS ==================== */

    function handleSummaryClick(e) {
        var tgt = e.target;
        var qtyBtn = tgt.closest ? tgt.closest('.sk-qty-btn') : null;
        if (qtyBtn) {
            var id = qtyBtn.getAttribute('data-id');
            var delta = parseInt(qtyBtn.getAttribute('data-delta'), 10);
            if (!state.cart[id]) return;
            state.cart[id].qty += delta;
            if (state.cart[id].qty <= 0) delete state.cart[id];
            saveCart(state.cart);
            renderSummary();
            return;
        }
        var rm = tgt.closest ? tgt.closest('.sk-cart-remove') : null;
        if (rm) {
            var rid = rm.getAttribute('data-id');
            delete state.cart[rid];
            saveCart(state.cart);
            renderSummary();
            /* If cart is now empty, switch to empty state */
            if (Object.keys(state.cart).length === 0) {
                setTimeout(function () { renderInitial(); }, 50);
            }
        }
    }

    function handleToggle() {
        if (!el.summaryContent) return;
        var wasHidden = el.summaryContent.hidden;
        el.summaryContent.hidden = !wasHidden;
        if (el.summaryToggle) {
            el.summaryToggle.setAttribute('aria-expanded', !wasHidden);
            el.summaryToggle.textContent = t(!wasHidden ? 'checkout.hideSummary' : 'checkout.showSummary');
        }
    }

    function handleNotesInput() {
        var val = el.notes.value;
        var len = val.length;
        var pct = len / NOTES_MAX;
        var counterText = t('checkout.notesCounter', { count: len });
        if (el.notesCounter) el.notesCounter.textContent = counterText;
        if (el.notesCounter) el.notesCounter.style.color = pct > 0.9 ? 'var(--sk-es-gold)' : '';
    }

    function updateNotesCounter() {
        handleNotesInput();
    }

    /* Save form values to sessionStorage on every change. Never stores anything sensitive. */
    function saveDraft() {
        var draft = {
            name:     el.name ? el.name.value : '',
            phone:    el.phone ? el.phone.value : '',
            email:    el.email ? el.email.value : '',
            street:   el.street ? el.street.value : '',
            city:     el.city ? el.city.value : '',
            postal:   el.postal ? el.postal.value : '',
            notes:    el.notes ? el.notes.value : '',
            consent:  el.consent ? el.consent.checked : false,
            payment:  getSelectedPayment()
        };
        try { global.sessionStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(draft)); } catch (e) {}
    }

    function restoreDraft() {
        var raw = null;
        try { raw = global.sessionStorage.getItem(SESSION_DRAFT_KEY); } catch (e) {}
        if (!raw) return;
        var draft = null;
        try { draft = JSON.parse(raw); } catch (e) { return; }

        if (el.name) el.name.value = draft.name || '';
        if (el.phone) el.phone.value = draft.phone || '';
        if (el.email) el.email.value = draft.email || '';
        if (el.street) el.street.value = draft.street || '';
        if (el.city) el.city.value = draft.city || '';
        if (el.postal) el.postal.value = draft.postal || '';
        if (el.notes) el.notes.value = draft.notes || '';
        if (el.consent) el.consent.checked = !!draft.consent;
        selectPayment(draft.payment || 'cod');
    }

    function getSelectedPayment() {
        var checked = el.form ? el.form.querySelector('input[name="paymentMethod"]:checked') : null;
        return checked ? checked.value : 'cod';
    }

    function selectPayment(method) {
        var inputs = el.form ? el.form.querySelectorAll('input[name="paymentMethod"]') : [];
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].checked = inputs[i].value === method;
        }
    }

    function clearFieldError(fieldId) {
        var errEl = el.fieldErrors[fieldId];
        if (errEl) errEl.textContent = '';
        var input = el.fields[fieldId];
        if (input) input.setAttribute('aria-invalid', 'false');
    }

    function setFieldError(fieldId, message) {
        var errEl = el.fieldErrors[fieldId];
        var input = el.fields[fieldId];
        if (errEl) errEl.textContent = message;
        if (input) input.setAttribute('aria-invalid', 'true');
    }

    function handleBlur(fieldId) {
        var value = el.fields[fieldId] ? el.fields[fieldId].value : '';
        clearFieldError(fieldId);

        if (fieldId === 'name') {
            if (!value.trim()) setFieldError('name', t('checkout.nameError'));
        } else if (fieldId === 'phone') {
            if (!value.trim()) {
                setFieldError('phone', t('checkout.phoneError'));
            } else if (!validatePhone(value)) {
                setFieldError('phone', t('checkout.phoneInvalid'));
            }
        } else if (fieldId === 'email') {
            if (value.trim() && !validateEmail(value)) {
                setFieldError('email', t('checkout.emailInvalid'));
            }
        } else if (fieldId === 'street') {
            if (!value.trim()) setFieldError('street', t('checkout.streetError'));
        } else if (fieldId === 'city') {
            if (!value.trim()) setFieldError('city', t('checkout.cityError'));
        }
    }

    /* ==================== VALIDATION ==================== */

    function validateForm() {
        var errors = [];
        var firstInvalid = null;

        /* Clear previous errors */
        Object.keys(el.fieldErrors).forEach(function (k) { clearFieldError(k); });

        /* Name */
        var nameVal = el.name ? el.name.value.trim() : '';
        if (!nameVal) {
            setFieldError('name', t('checkout.nameError'));
            errors.push(t('checkout.nameError'));
            if (!firstInvalid) firstInvalid = el.name;
        }

        /* Phone */
        var phoneVal = el.phone ? el.phone.value.trim() : '';
        if (!phoneVal) {
            setFieldError('phone', t('checkout.phoneError'));
            errors.push(t('checkout.phoneError'));
            if (!firstInvalid) firstInvalid = el.phone;
        } else if (!validatePhone(phoneVal)) {
            var msg = t('checkout.phoneInvalid');
            setFieldError('phone', msg);
            errors.push(msg);
            if (!firstInvalid) firstInvalid = el.phone;
        }

        /* Email (optional) */
        var emailVal = el.email ? el.email.value.trim() : '';
        if (emailVal && !validateEmail(emailVal)) {
            var emsg = t('checkout.emailInvalid');
            setFieldError('email', emsg);
            errors.push(emsg);
            if (!firstInvalid) firstInvalid = el.email;
        }

        /* Street */
        var streetVal = el.street ? el.street.value.trim() : '';
        if (!streetVal) {
            setFieldError('street', t('checkout.streetError'));
            errors.push(t('checkout.streetError'));
            if (!firstInvalid) firstInvalid = el.street;
        }

        /* City */
        var cityVal = el.city ? el.city.value.trim() : '';
        if (!cityVal) {
            setFieldError('city', t('checkout.cityError'));
            errors.push(t('checkout.cityError'));
            if (!firstInvalid) firstInvalid = el.city;
        }

        /* Consent */
        if (!el.consent || !el.consent.checked) {
            setFieldError('consent', t('checkout.consentError'));
            errors.push(t('checkout.consentError'));
            if (!firstInvalid) firstInvalid = el.consent;
        }

        return { errors: errors, firstInvalid: firstInvalid };
    }

    function renderErrors(errors) {
        if (!el.errorsBox) return;

        if (errors.length === 0) {
            el.errorsBox.hidden = true;
            return;
        }

        /* Build error list items */
        var listItems = errors.map(function (e) {
            return '<li>' + escapeHtml(e) + '</li>';
        }).join('');

        var title = el.errorsBox.querySelector('.sk-checkout-errors-title');
        if (title) title.textContent = t('checkout.formError');

        if (el.errorsList) el.errorsList.innerHTML = '<ol>' + listItems + '</ol>';
        el.errorsBox.hidden = false;
    }

    /* ==================== SUBMISSION ==================== */

    function buildOrder() {
        var cart = state.cart;
        var items = [];
        var subtotal = 0;
        var keys = Object.keys(cart);

        keys.forEach(function (id) {
            var item = cart[id];
            var prod = (global.cartCatalogueById ? global.cartCatalogueById(id) : null);
            var name = prod ? t(prod.nameKey) : item.name;
            var lineTotal = item.price * item.qty;
            subtotal += lineTotal;
            items.push({
                id: id,
                name: name,
                qty: item.qty,
                unitPrice: item.price,
                lineTotal: lineTotal
            });
        });

        var method = getSelectedPayment();

        return {
            orderRef: generateOrderRef(),
            createdAt: new Date().toISOString(),
            lang: (global.SKI18N ? global.SKI18N.getLang() : 'fr'),
            currency: (global.CURRENCY ? global.CURRENCY.code : 'USD'),
            items: items,
            subtotal: subtotal,
            shippingNote: t('checkout.shippingNote'),
            /* DB: customer.fields */
            customer: {
                name: el.name ? el.name.value.trim() : '',
                phone: el.phone ? el.phone.value.trim() : '',
                email: el.email ? el.email.value.trim() : ''
            },
            address: {
                street:  el.street ? el.street.value.trim() : '',
                city:    el.city ? el.city.value.trim() : '',
                postalCode: el.postal ? el.postal.value.trim() : '',
                country: (global.SKI18N ? global.SKI18N.t('checkout.countryMorocco') : 'Maroc'),
                notes:   el.notes ? el.notes.value.trim() : ''
            },
            /* /DB: customer.fields */
            paymentMethod: method,
            consent: !!(el.consent && el.consent.checked)
        };
    }

    /* <!-- PHP: replace submitOrder() with POST to /checkout.php, validate server-side, persist, return orderRef --> */
    function submitOrder(order) {
        /* Save to localStorage for demo / debugging */
        try { global.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order)); } catch (e) {}

        /* Clear cart */
        try { global.localStorage.removeItem(CART_STORAGE_KEY); } catch (e) {}

        /* Sync drawer badge + empty state */
        if (global.saveCart) {
            global.saveCart({});
        } else {
            state.cart = {};
        }

        /* Clear form draft */
        try { global.sessionStorage.removeItem(SESSION_DRAFT_KEY); } catch (e) {}

        /* Show confirmation */
        showConfirmation(order);
    }

    /* ==================== CONFIRMATION ==================== */

    function showConfirmation(order) {
        if (el.content) el.content.hidden = true;
        if (el.emptyState) el.emptyState.hidden = true;
        if (el.confirmation) {
            el.confirmation.hidden = false;
            el.confirmation.focus();
        }

        /* Order reference */
        if (el.orderRef) el.orderRef.textContent = order.orderRef;

        /* Items recap */
        if (el.confirmList) {
            var html = '';
            order.items.forEach(function (item) {
                var prod = (global.cartCatalogueById ? global.cartCatalogueById(item.id) : null);
                var img = prod ? prod.image : '';
                html += '<li class="sk-checkout-confirm-item">' +
                    '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(item.name) + '" ' +
                    'class="sk-checkout-confirm-thumb" width="64" height="78" loading="lazy">' +
                    '<span class="sk-checkout-confirm-name">' + escapeHtml(item.name) + '</span>' +
                    '<span class="sk-checkout-confirm-qty" data-i18n="checkout.qty">' + t('checkout.qty') + ' ' + item.qty + '</span>' +
                    '</li>';
            });
            el.confirmList.innerHTML = html;
        }

        /* Total */
        if (el.confirmTotal) el.confirmTotal.textContent = formatPrice(order.subtotal);

        /* Apply i18n to static confirmation elements */
        if (global.SKI18N && global.SKI18N.apply) {
            global.SKI18N.apply(el.confirmation, global.SKI18N.getLang());
        }
    }

    /* ==================== LANGUAGE SWITCH ==================== */

    function handleLanguageChange() {
        /* Re-render summary (names, taglines may change) */
        if (!el.emptyState.hidden) return; /* don't re-render if empty/confirmation */
        if (el.confirmation && !el.confirmation.hidden) return;

        renderSummary();
        updateToggleText();
        updateNotesCounter();
        /* Labels and placeholders are auto-updated by the i18n system */
    }

    function updateToggleText() {
        if (!el.summaryToggle || !el.summaryContent) return;
        var key = el.summaryContent.hidden ? 'checkout.showSummary' : 'checkout.hideSummary';
        el.summaryToggle.textContent = t(key);
    }

    /* ==================== INIT ==================== */

    function init() {
        /* Ensure elements are cached (DOM may not have been ready at script time) */
        el.summaryContent = el.summaryContent || document.getElementById('skCheckoutSummary');

        /* Bind summary click (qty stepper + remove) */
        if (el.summaryList) {
            el.summaryList.addEventListener('click', handleSummaryClick);
        }

        /* Bind toggle */
        if (el.summaryToggle) {
            el.summaryToggle.addEventListener('click', handleToggle);
        }

        /* Bind notes counter */
        if (el.notes) {
            el.notes.addEventListener('input', handleNotesInput);
        }

        /* Bind form draft save on input */
        var inputSelectors = ['skCheckoutName', 'skCheckoutPhone', 'skCheckoutEmail',
            'skCheckoutStreet', 'skCheckoutCity', 'skCheckoutPostal', 'skCheckoutNotes', 'skCheckoutConsent'];
        inputSelectors.forEach(function (id) {
            var fld = $(id);
            if (fld) {
                fld.addEventListener('blur', function () {
                    var fid = id.replace('skCheckout', '').toLowerCase();
                    handleBlur(fid);
                    saveDraft();
                });
            }
        });

        /* Payment radio blur */
        var payInputs = el.form ? el.form.querySelectorAll('input[name="paymentMethod"]') : [];
        for (var i = 0; i < payInputs.length; i++) {
            payInputs[i].addEventListener('change', saveDraft);
        }

        /* Form submit */
        if (el.form) {
            el.form.addEventListener('submit', handleSubmit);
        }

        /* Language change */
        document.addEventListener('sk:langchange', handleLanguageChange);

        /* Initial render */
        renderInitial();
    }

    /* ==================== SUBMIT HANDLER ==================== */

    function handleSubmit(e) {
        e.preventDefault();
        if (state.submitting) return;

        var result = validateForm();

        if (result.errors.length > 0) {
            renderErrors(result.errors);
            if (result.firstInvalid) {
                result.firstInvalid.focus();
            }
            return;
        }

        /* Hide errors */
        if (el.errorsBox) el.errorsBox.hidden = true;

        /* Prevent double submit */
        state.submitting = true;
        if (el.submit) el.submit.disabled = true;

        /* Show spinner state briefly, then build order + submit */
        var originalText = el.submit ? el.submit.textContent : '';
        if (el.submit) {
            el.submit.innerHTML = '<span class="sk-checkout-submit-text" data-i18n="checkout.submitting">' + t('checkout.submitting') + '</span>';
        }

        setTimeout(function () {
            var order = buildOrder();
            submitOrder(order);
            state.submitting = false;
        }, 200); /* tiny delay so the user sees the spinner */
    }

    /* ==================== EXPORT (for debugging) ==================== */
    global.SK_CHECKOUT = {
        generateOrderRef: generateOrderRef,
        validatePhone: validatePhone,
        validateEmail: validateEmail,
        buildOrder: buildOrder,
        submitOrder: submitOrder
    };

    /* ==================== BOOT ==================== */
    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
