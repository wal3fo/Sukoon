/********** SUKOON — Scroll reveal **********
 * Fade + translate-up on first intersection, 400-600ms ease-out. Disabled
 * entirely when the visitor prefers reduced motion.
 */
(function (global) {
    "use strict";

    var SELECTOR = '.sk-reveal';

    function mount(root) {
        var targets = Array.prototype.slice.call(root.querySelectorAll(SELECTOR));
        if (!targets.length) return;

        if (!('IntersectionObserver' in global)) {
            targets.forEach(function (el) { el.classList.add('is-revealed'); });
            return;
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

    global.SkEssenceReveal = { mount: mount };

})(window);
