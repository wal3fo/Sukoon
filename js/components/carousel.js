/********** SUKOON — Essence carousel behaviour **********
 * Native scroll-snap track driven by the two arrow buttons. Arrow keys move
 * one packshot at a time when the track has focus. Honours reduced motion.
 */
(function (global) {
    "use strict";

    function prefersReducedMotion() {
        return global.matchMedia
            && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function scrollAmount(track) {
        var first = track.querySelector('.sk-es-other');
        if (!first) return track.clientWidth;
        var styles = global.getComputedStyle(track);
        var gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
        return first.getBoundingClientRect().width + gap;
    }

    function scrollByStep(track, direction) {
        var step = scrollAmount(track);
        track.scrollBy({
            left: step * direction,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
    }

    function isRTL() {
        return document.documentElement.getAttribute('dir') === 'rtl';
    }

    function mount(root) {
        var track = root.querySelector('[data-sk-others-track]');
        var prev = root.querySelector('[data-sk-others-prev]');
        var next = root.querySelector('[data-sk-others-next]');
        if (!track || !prev || !next) return;

        prev.addEventListener('click', function () {
            scrollByStep(track, isRTL() ? 1 : -1);
        });

        next.addEventListener('click', function () {
            scrollByStep(track, isRTL() ? -1 : 1);
        });

        track.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollByStep(track, isRTL() ? -1 : 1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollByStep(track, isRTL() ? 1 : -1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                track.scrollTo({ left: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            } else if (e.key === 'End') {
                e.preventDefault();
                track.scrollTo({ left: track.scrollWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            }
        });
    }

    global.SkEssenceCarousel = { mount: mount };

})(window);
