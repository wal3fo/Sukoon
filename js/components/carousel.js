/********** SUKOON — Essence carousel behaviour **********
 * Native scroll-snap track driven by the two arrow buttons: one card per
 * click, disabled at either end, keyboard arrows while the track holds focus
 * and while a card itself holds focus, touch swipe for free. Clicking a card
 * promotes it to the active one without cancelling the link target, so the
 * product page the card points at still opens. Honours reduced motion.
 *
 * Mounting is idempotent and also self-boots on any page that ships the static
 * markup, which is why the landing page gets working arrows with no change to
 * index.html.
 */
(function (global) {
    "use strict";

    var TRACK = '[data-sk-others-track]';
    var LINK = '.sk-es-other-link';
    /* Sub-pixel slack so a track parked on the last card still reads as the end. */
    var EDGE_SLOP = 2;
    var SETTLE_MS = 140;
    var RESIZE_MS = 200;

    function prefersReducedMotion() {
        return global.matchMedia
            && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /* `behavior: 'auto'` defers to the stylesheet's scroll-behavior, which is
       `smooth`, so reduced motion has to switch the property off for the jump
       to actually be instant. */
    function scrollTrack(track, left) {
        if (!prefersReducedMotion()) {
            track.scrollTo({ left: left, behavior: 'smooth' });
            return;
        }
        var previous = track.style.scrollBehavior;
        track.style.scrollBehavior = 'auto';
        track.scrollTo({ left: left });
        track.style.scrollBehavior = previous;
    }

    function scrollTrackBy(track, left) {
        if (!prefersReducedMotion()) {
            track.scrollBy({ left: left, behavior: 'smooth' });
            return;
        }
        var previous = track.style.scrollBehavior;
        track.style.scrollBehavior = 'auto';
        track.scrollBy({ left: left });
        track.style.scrollBehavior = previous;
    }

    function isRTL() {
        return document.documentElement.getAttribute('dir') === 'rtl';
    }

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

    /* One card plus the gap that follows it. */
    function step(track) {
        var first = track.querySelector('.sk-es-other');
        if (!first) return track.clientWidth;
        var styles = global.getComputedStyle(track);
        var gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
        return first.getBoundingClientRect().width + gap;
    }

    function maxScroll(track) {
        return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function scrollByStep(track, direction) {
        scrollTrackBy(track, step(track) * direction);
    }

    function updateArrows(track, prev, next, head) {
        var left = track.scrollLeft;
        var end = maxScroll(track);
        /* When the six columns already fill the track there is nothing to page,
           so the arrows are dropped from the layout/tab order entirely and the
           head stays on its 44px row (see .sk-es-others-head--static). */
        var canScroll = end > EDGE_SLOP;
        head.classList.toggle('sk-es-others-head--static', !canScroll);
        if (!canScroll) {
            prev.disabled = true;
            next.disabled = true;
            return;
        }
        var rtl = isRTL();
        var atStart = rtl ? left >= end - EDGE_SLOP : left <= EDGE_SLOP;
        var atEnd = rtl ? left <= EDGE_SLOP : left >= end - EDGE_SLOP;

        prev.disabled = atStart;
        next.disabled = atEnd;
    }

    /* The card nearest the reading edge is the one the visitor is looking at. */
    function nearestIndex(track) {
        var links = linksIn(track);
        if (!links.length) return -1;
        var rtl = isRTL();
        var box = track.getBoundingClientRect();
        var origin = rtl ? box.right : box.left;
        var best = 0;
        var bestDistance = Infinity;

        links.forEach(function (link, index) {
            var r = link.getBoundingClientRect();
            var anchor = rtl ? r.right : r.left;
            var distance = Math.abs(anchor - origin);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = index;
            }
        });
        return best;
    }

    function setActive(track, link) {
        if (!link) return;
        linksIn(track).forEach(function (other) {
            var isActive = other === link;
            other.classList.toggle('is-active', isActive);
            if (isActive) {
                other.setAttribute('aria-current', 'true');
            } else {
                other.removeAttribute('aria-current');
            }
        });
    }

    /* Brings a card into view on the horizontal axis only, so keyboard users
       never lose their place in the page. */
    function revealCard(track, link) {
        if (!link) return;
        var box = track.getBoundingClientRect();
        var card = link.getBoundingClientRect();
        var styles = global.getComputedStyle(track);
        var gutter = parseFloat(styles.scrollPaddingLeft || '0') || 0;
        var delta = 0;

        if (isRTL()) {
            if (card.right > box.right - gutter) {
                delta = card.right - (box.right - gutter);
            } else if (card.left < box.left + gutter) {
                delta = card.left - (box.left + gutter);
            }
        } else {
            if (card.left < box.left + gutter) {
                delta = card.left - (box.left + gutter);
            } else if (card.right > box.right - gutter) {
                delta = card.right - (box.right - gutter);
            }
        }

        if (delta) {
            scrollTrackBy(track, delta);
        }
    }

    function mountTrack(track) {
        var root = track.closest('.sk-es-section') || document;
        var head = root.querySelector('.sk-es-others-head');
        var prev = root.querySelector('[data-sk-others-prev]');
        var next = root.querySelector('[data-sk-others-next]');
        if (!prev || !next) return;

        /* Both bootstraps can reach the same track (self-init below and an
           explicit mount() from the page bootstrap); binding twice would double
           every scroll step. */
        if (track.getAttribute('data-sk-others-ready') === 'true') return;
        track.setAttribute('data-sk-others-ready', 'true');

        var syncArrows = function () { updateArrows(track, prev, next, head); };
        var settle = debounce(function () {
            setActive(track, linksIn(track)[nearestIndex(track)]);
            syncArrows();
        }, SETTLE_MS);

        prev.addEventListener('click', function () {
            scrollByStep(track, isRTL() ? 1 : -1);
        });

        next.addEventListener('click', function () {
            scrollByStep(track, isRTL() ? -1 : 1);
        });

        /* Swipe, drag, arrow clicks and Home/End all land here. */
        track.addEventListener('scroll', syncArrows, { passive: true });
        track.addEventListener('scroll', settle, { passive: true });

        /* Fonts landing and lazy packshots decoding can both move the column
           widths, which is what decides whether there is anything to scroll
           to. Re-evaluate on every one of those triggers. */
        if (global.document && global.document.fonts && global.document.fonts.ready) {
            global.document.fonts.ready.then(syncArrows);
        }
        if ('ResizeObserver' in global) {
            var ro = new ResizeObserver(syncArrows);
            ro.observe(track);
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

                /* With a card focused the arrows walk the cards; otherwise they
                   page the track itself. */
                if (onCard) {
                    var index = links.indexOf(focused);
                    if (index === -1) return;
                    var target = links[index + (e.key === 'ArrowRight' ? forward : -forward)];
                    if (!target) return;
                    e.preventDefault();
                    revealCard(track, target);
                    target.focus();
                    return;
                }

                e.preventDefault();
                scrollByStep(track, e.key === 'ArrowRight' ? forward : -forward);
            } else if (e.key === 'Home') {
                e.preventDefault();
                scrollTrack(track, 0);
            } else if (e.key === 'End') {
                e.preventDefault();
                scrollTrack(track, maxScroll(track));
            }
        });

        /* Promote on activation without cancelling the navigation the card was
           built to perform. */
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

    function mount(root) {
        var scope = root || document;
        var tracks = scope.querySelectorAll(TRACK);
        for (var i = 0; i < tracks.length; i++) {
            mountTrack(tracks[i]);
        }
    }

    global.SkEssenceCarousel = { mount: mount };

    function autoInit() {
        mount(document);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

})(window);