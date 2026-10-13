const CDP = require('chrome-remote-interface');
const fs = require('fs');
const path = require('path');

const VIEWPORTS = {
    '1440': { width: 1440, height: 1080 },
    '375':  { width: 375,  height: 667 }
};

const CART_STATES = ['empty', '1', '3'];
const LANGS = ['en', 'fr'];

const PWD = process.cwd();
const URL = `file://${PWD}/index.html`;

async function screenshotPage(width, height, filename) {
    const client = await CDP({
        defaultViewport: { width, height },
        headless: true,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });

    const { Runtime, Page, Emulation } = client;
    await Page.enable();
    await Runtime.enable();

    await Emulation.setDeviceMetricsOverride({
        width, height,
        deviceScaleFactor: 1,
        mobile: false
    });

    await Page.navigate({ url: URL });
    await Page.loadEventFired();

    // Wait for DOM
    await new Promise(r => setTimeout(r, 1000));

    // Remove scrim so we can see the page behind
    const result = await Runtime.evaluate({
        expression: `
            (function() {
                // Open drawer
                var drawer = document.getElementById('skCartDrawer');
                if (drawer) {
                    drawer.classList.add('is-open');
                    drawer.setAttribute('aria-hidden', 'false');
                }
                var scrim = document.getElementById('skScrim') || document.getElementById('skScrimMobile');
                if (scrim) scrim.style.display = 'none';
                return 'drawer opened';
            })()
        `,
        returnByValue: true
    });

    await new Promise(r => setTimeout(r, 500));

    const base64 = await Page.captureScreenshot({
        format: 'png',
        fromSurface: false
    });

    fs.writeFileSync(filename, Buffer.from(base64.data, 'base64'));
    console.log('Saved: ' + filename);

    await client.close();
}

async function setCartState(width, height, cartState, lang, filename) {
    const client = await CDP({
        defaultViewport: { width, height },
        headless: true,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });

    const { Runtime, Page, Emulation } = client;
    await Page.enable();
    await Runtime.enable();

    await Emulation.setDeviceMetricsOverride({
        width, height,
        deviceScaleFactor: 1,
        mobile: false
    });

    await Page.navigate({ url: URL });
    await Page.loadEventFired();

    await new Promise(r => setTimeout(r, 1500));

    // Set language and cart state
    const script = `
        (function() {
            // Set language
            window.SKI18N.setLang('${lang}', false);
            // Set body dir
            document.documentElement.setAttribute('dir', '${lang === 'ar' ? 'rtl' : 'ltr'}');
            
            // Set cart state
            var cart = {};
            ${cartState === 'empty' ? '' : cartState === '1' ? `
            cart['moroccan-mint'] = { name: 'Menthe Marocaine', price: 18, img: 'img/products/product-moroccan-mint.png', tagline: 'Fraîcheur · Présence', qty: 1 };
            ` : cartState === '3' ? `
            cart['moroccan-mint'] = { name: 'Menthe Marocaine', price: 18, img: 'img/products/product-moroccan-mint.png', tagline: 'Fraîcheur · Présence', qty: 1 };
            cart['royal-verbena'] = { name: 'Verveine Royale', price: 18, img: 'img/products/product-royal-verbena.png', tagline: 'Clarté · Légèreté', qty: 2 };
            cart['ruby-hibiscus'] = { name: 'Hibiscus Rubis', price: 18, img: 'img/products/product-ruby-hibiscus.png', tagline: 'Éclat · Rayonnement', qty: 1 };
            ` : ''}
            localStorage.setItem('sukoonCart', JSON.stringify(cart));
            
            // Trigger re-render
            var evt = new CustomEvent('sk:langchange', { detail: { lang: '${lang}' } });
            document.dispatchEvent(evt);
            
            // Open drawer
            var drawer = document.getElementById('skCartDrawer');
            if (drawer) {
                drawer.classList.add('is-open');
                drawer.setAttribute('aria-hidden', 'false');
            }
            var scrim = document.getElementById('skScrim');
            if (scrim) { scrim.style.display = 'none'; scrim.classList.add('is-open'); }
            
            // Hide the nav panel if open
            var panel = document.getElementById('skNavPanel');
            if (panel) panel.classList.remove('is-open');
            
            return 'cart state: ' + Object.keys(cart).length + ' items, lang: ' + '${lang}';
        })()
    `;

    await Runtime.evaluate({ expression: script, returnByValue: true });
    await new Promise(r => setTimeout(r, 800));

    // Scroll the drawer to top
    await Runtime.evaluate({
        expression: `
        var drawer = document.querySelector('.sk-cart-drawer');
        if (drawer) drawer.scrollTop = 0;
        document.body.scrollTop = 0;
        `,
        returnByValue: true
    });

    const base64 = await Page.captureScreenshot({
        format: 'png',
        fromSurface: false
    });

    fs.writeFileSync(filename, Buffer.from(base64.data, 'base64'));
    console.log('Saved: ' + filename);

    await client.close();
}

async function main() {
    // Create screenshots for all combinations
    for (const vp of Object.keys(VIEWPORTS)) {
        const vp2 = VIEWPORTS[vp];
        for (const state of CART_STATES) {
            for (const lang of LANGS) {
                const filename = `/tmp/cart_${vp}px_${state}_${lang}.png`;
                await setCartState(vp2.width, vp2.height, state, lang, filename);
            }
        }
    }
    console.log('All screenshots done!');
}

main().catch(console.error);
