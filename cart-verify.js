const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = 'http://localhost:8889';
const PWD = '/home/wal3fo/Desktop/Sukoon';
const SCREENSHOTS_DIR = '/tmp/screenshots';
const VIEWPORTS = { '1440': { width: 1440, height: 900 }, '375': { width: 375, height: 667 } };

const PAGES = [
    'index.html',
    'product-moroccan-mint.html',
    'product-noble-chamomile.html',
    'product-royal-verbena.html',
    'product-ruby-hibiscus.html',
    'product-atlas-oregano.html',
    'product-heritage-fennel.html',
];

// Cart test states for test page
const TEST_STATES = ['empty', '1', '3', '8'];
const LANGS = ['en', 'fr'];

const drawerEval = `
(function() {
    function box(el) { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }
    function ct(el) { return el ? el.textContent.replace(/\\s+/g, ' ').trim() : null; }
    const drawer = document.getElementById('skCartDrawer');
    if (!drawer) return { error: 'drawer not found' };
    const items = drawer.querySelectorAll('.sk-cart-item');
    const foot = drawer.querySelector('.sk-cart-foot');
    const countEl = document.getElementById('skCartCount');
    const data = {
        drawerBox: box(drawer), countText: ct(countEl), footHidden: foot ? foot.hidden : null,
        subtotal: foot ? ct(foot.querySelector('#skCartTotal')) : null, items: [],
        priceBoxes: [], removeBoxes: [], stepperBoxes: [],
        checkoutBox: null, checkoutText: foot ? ct(foot.querySelector('#skCartCheckout')) : null,
        skProductsExists: typeof window.SK_PRODUCTS !== 'undefined',
        catalogueUsed: typeof window.SK_PRODUCTS !== 'undefined' ? 'SK_PRODUCTS' : 'CART_CATALOGUE',
    };
    const checkoutBtn = foot ? foot.querySelector('#skCartCheckout') : null; data.checkoutBox = box(checkoutBtn);
    items.forEach(function(item, i) {
        const name = item.querySelector('.sk-cart-item-name'); const tag = item.querySelector('.sk-cart-item-tagline');
        const pr = item.querySelector('.sk-cart-item-price'); const st = item.querySelector('.sk-cart-qty');
        const rm = item.querySelector('.sk-cart-remove'); const im = item.querySelector('img');
        const svg = rm ? rm.querySelector('svg') : null;
        const isTrash = svg ? !!svg.querySelector('path[d*="M6 7V4"]') : false;
        if (pr) data.priceBoxes.push({ index: i, text: ct(pr) });
        if (rm) data.removeBoxes.push({ index: i, box: box(rm), isTrash: isTrash });
        if (st) data.stepperBoxes.push({ index: i, box: box(st) });
        data.items.push({ index: i, name: ct(name), tagline: ct(tag), imgBox: box(im) });
    });
    return data;
})()
`;

const overlapEval = `
(function() {
    function box(el) { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }
    const remove = document.querySelector('.sk-cart-remove'); const stepper = document.querySelector('.sk-cart-qty');
    const price = document.querySelector('.sk-cart-item-price');
    if (!remove || !stepper) return { remove: box(remove), stepper: box(stepper), overlap: false };
    const r = remove.getBoundingClientRect(); const s = stepper.getBoundingClientRect();
    const overlap = !(r.right < s.left || r.left > s.right || r.bottom < s.top || r.top > s.bottom);
    return { remove: box(remove), stepper: box(stepper), price: box(price), overlap: overlap };
})()
`;

async function main() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] });

    // ===== DRAWER SHELL + SCREENSHOTS (test page, all states) =====
    console.log('===== 0. DRAWER SHELL HEIGHT + SCREENSHOTS =====');
    for (const vpName of Object.keys(VIEWPORTS)) {
        for (const state of TEST_STATES) {
            for (const lang of LANGS) {
                const vp = VIEWPORTS[vpName];
                const page = await browser.newPage();
                await page.setViewport(vp);
                await page.goto(BASE + '/cart_test.html?state=' + state + '&lang=' + lang, { waitUntil: 'networkidle0' });
                await page.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
                await new Promise(r => setTimeout(r, 300));
                const d = await page.evaluate(drawerEval);
                const h = d.drawerBox ? d.drawerBox.h : 'N/A';
                console.log(vpName + ' | ' + state + ' | ' + lang + ': drawer h=' + h + ' (vp=' + vp.height + ') match=' + (h === vp.height));
                const fname = path.join(SCREENSHOTS_DIR, 'drawer_' + vpName + 'px_' + state + '_' + lang + '.png');
                await page.screenshot({ path: fname });
                await page.close();
            }
        }
    }
    console.log('');

    // ===== 1. ROOT CAUSE: SK_PRODUCTS on 7 pages =====
    console.log('===== 1. ROOT CAUSE: SK_PRODUCTS on 7 pages =====');
    for (const pg of PAGES) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 1080 });
        await page.goto(BASE + '/' + pg, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 200));
        const info = await page.evaluate(drawerEval);
        console.log(pg + ': SK_PRODUCTS=' + info.skProductsExists + ' → catalogue=' + info.catalogueUsed);
        await page.close();
    }
    console.log('');

    // ===== 2+3. TAGLINE + ITEM ROW on ALL 7 PAGES (add 1 item via ATC) =====
    console.log('===== 2. TAGLINE + 3. ITEM ROW (all 7 pages, add 1 item) =====');
    for (const pg of PAGES) {
        const page = await browser.newPage();
        const pgErrors = [];
        page.on('console', msg => { if (msg.type() === 'error') pgErrors.push(msg.text()); });
        page.on('pageerror', err => pgErrors.push(err.message));
        await page.setViewport({ width: 1440, height: 900 });
        await page.goto(BASE + '/' + pg, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 200));
        // Add a product to cart
        try {
            const atc = await page.$('.add-to-cart-btn, [data-product-id]');
            if (atc) { await atc.click(); await new Promise(r => setTimeout(r, 500)); }
        } catch(e) {}
        const d = await page.evaluate(drawerEval);
        const o = await page.evaluate(overlapEval);
        console.log(pg + ': SK_PRODUCTS=' + d.skProductsExists);
        if (d.items.length) {
            console.log('  name="' + d.items[0].name + '" tagline="' + d.items[0].tagline + '" img=' + JSON.stringify(d.items[0].imgBox));
            console.log('  price: ' + JSON.stringify(o.price));
            console.log('  stepper: ' + JSON.stringify(o.stepper));
            console.log('  remove(isTrash=' + o.remove.isTrash + '): ' + JSON.stringify(o.remove));
            console.log('  overlap(remove,stepper): ' + o.overlap);
        } else {
            console.log('  NO ITEMS FOUND - drawer may not be open');
        }
        console.log('  Console errors: ' + pgErrors.length);
        await page.close();
    }
    console.log('');

    // ===== 5. 8 ITEMS SCROLL =====
    console.log('===== 5. 8 ITEMS SCROLL =====');
    for (const vpName of Object.keys(VIEWPORTS)) {
        const vp = VIEWPORTS[vpName];
        const page = await browser.newPage();
        await page.setViewport(vp);
        await page.goto(BASE + '/cart_test.html?state=8&lang=en', { waitUntil: 'networkidle0' });
        await page.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
        await new Promise(r => setTimeout(r, 200));
        const d = await page.evaluate(drawerEval);
        console.log(vpName + ': items=' + d.items.length + ' count="' + d.countText + '" subtotal=' + d.subtotal + ' drawerH=' + d.drawerBox.h);
        await page.close();
    }
    console.log('');

    // ===== 6. CHECKOUT URL =====
    console.log('===== 6. CHECKOUT =====');
    const cp = await browser.newPage();
    await cp.goto(BASE + '/cart_test.html?state=1&lang=en', { waitUntil: 'networkidle0' });
    const curl = await cp.evaluate(() => window.CHECKOUT_URL);
    console.log('CHECKOUT_URL: ' + JSON.stringify(curl));
    console.log('Handler: js/main.js ~500, window.location.href = CHECKOUT_URL');
    await cp.close();
    console.log('');

    // ===== 7. ARABIC FALLBACK =====
    console.log('===== 7. AR FALLBACK =====');
    const ap = await browser.newPage();
    await ap.setViewport({ width: 1440, height: 900 });
    await ap.goto(BASE + '/cart_test.html?state=3&lang=en', { waitUntil: 'networkidle0' });
    const arInfo = await ap.evaluate(() => {
        const en = (window.SK_LOCALES && window.SK_LOCALES.en) || {};
        const fr = (window.SK_LOCALES && window.SK_LOCALES.fr) || {};
        const ar = (window.SK_LOCALES && window.SK_LOCALES.ar) || {};
        const keys = ['cartEyebrow','cartItemCount.one','cartItemCount.other','cartEmpty','cartDiscover','cartSubtotal','cartShipping','cartCheckout','cartContinue','cartRemove','decreaseQty','increaseQty'];
        const fb = [];
        keys.forEach(k => {
            if (!(k in ar)) fb.push({key:k,en:en[k],fr:fr[k],ar:'MISSING->falls back to FR'});
        });
        return { fallbacks: fb };
    });
    console.log('AR keys falling back to English: ' + (arInfo.fallbacks.length === 0 ? 'NONE' : JSON.stringify(arInfo.fallbacks)));
    await ap.close();
    console.log('');

    // ===== 8. essence.html + empty button =====
    console.log('===== 8. essence.html + EMPTY BUTTON =====');
    console.log('File exists: ' + fs.existsSync(path.join(PWD, 'essence.html')));
    try {
        const refs = execSync('grep -rn "essence.html" ' + PWD + ' --include="*.html" --include="*.js" 2>/dev/null | grep -v node_modules | grep -v cart-verify', { encoding: 'utf8' });
        console.log('References to essence.html:'); refs.trim().split('\n').filter(l=>l).forEach(l => console.log('  ' + l));
    } catch(e) { console.log('No references'); }
    const anchorLine = execSync('grep -n "autres-essences-title" ' + path.join(PWD, 'index.html'), { encoding: 'utf8' }).split('\n')[0];
    console.log('Anchor #autres-essences-title in index.html: ' + (anchorLine ? 'EXISTS at ' + anchorLine.split(':')[0] : 'MISSING'));
    console.log('Empty button handler: js/main.js ~507, closeCart() + window.location.href = "index.html#autres-essences-title"');
    console.log('');

    // ===== 9. localStorage + JSON =====
    console.log('===== 9. localStorage KEY + JSON SHAPE =====');
    const lp = await browser.newPage();
    await lp.setViewport({ width: 1440, height: 900 });
    await lp.goto(BASE + '/cart_test.html?state=1&lang=en', { waitUntil: 'networkidle0' });
    await lp.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
    const si = await lp.evaluate(() => {
        const raw = localStorage.getItem('sukoonCart');
        const parsed = JSON.parse(raw);
        const key = Object.keys(parsed)[0];
        return { key: 'sukoonCart', item: key ? { [key]: parsed[key] } : null };
    });
    console.log('localStorage key: ' + si.key);
    console.log('JSON shape: ' + JSON.stringify(si.item));
    await lp.close();
    console.log('');

    // ===== 10. CART_CATALOGUE =====
    console.log('===== 10. CART_CATALOGUE =====');
    const tp = await browser.newPage();
    await tp.goto(BASE + '/cart_test.html?state=empty&lang=en', { waitUntil: 'networkidle0' });
    const cat = await tp.evaluate(() => window.CART_CATALOGUE.map(p => ({ id: p.id, nameKey: p.nameKey, taglineKey: p.taglineKey, image: p.image, productPage: 'product-' + p.id + '.html' })));
    console.log(JSON.stringify(cat, null, 2));
    await tp.close();
    console.log('');

    // ===== 11. SCRIM / ESCAPE / FOCUS TRAP / CLICKABLE =====
    console.log('===== 11. SCRIM / ESCAPE / FOCUS / CLICKABLE =====');
    const sp = await browser.newPage();
    const spErrors = [];
    sp.on('console', msg => { if (msg.type() === 'error') spErrors.push(msg.text()); });
    await sp.setViewport({ width: 1440, height: 900 });
    await sp.goto(BASE + '/cart_test.html?state=1&lang=en', { waitUntil: 'networkidle0' });
    await sp.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 200));
    const beforeClose = await sp.evaluate(() => {
        const d = document.getElementById('skCartDrawer');
        const s = document.getElementById('skScrim');
        return { drawerOpen: d.classList.contains('is-open'), ariaHidden: d.getAttribute('aria-hidden'), scrimVisible: !s.hidden && s.classList.contains('is-open') };
    });
    console.log('Before close: drawerOpen=' + beforeClose.drawerOpen + ' aria-hidden=' + beforeClose.ariaHidden + ' scrim=' + beforeClose.scrimVisible);
    await sp.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    const afterEsc = await sp.evaluate(() => {
        const d = document.getElementById('skCartDrawer');
        return { drawerOpen: d.classList.contains('is-open'), ariaHidden: d.getAttribute('aria-hidden') };
    });
    console.log('After Escape: drawerOpen=' + afterEsc.drawerOpen + ' aria-hidden=' + afterEsc.ariaHidden);
    const clickable = await sp.evaluate(() => {
        const pts = [{x:50,y:50},{x:720,y:450},{x:1390,y:50},{x:50,y:400},{x:1000,y:450}];
        return pts.map(p => { const el = document.elementFromPoint(p.x,p.y); return {x:p.x,y:p.y,tag:el?el.tagName:'null',id:el?el.id:'null'}; });
    });
    console.log('elementFromPoint after close (5 pts):');
    clickable.forEach(p => console.log('  ('+p.x+','+p.y+'): ' + p.tag + (p.id ? '#'+p.id : '')));
    console.log('Console errors during scrim/escape test: ' + spErrors.length);
    await sp.close();
    console.log('');

    // ===== 12. CONSOLE ERRORS (all 7 pages with ATC click) =====
    console.log('===== 12. CONSOLE ERRORS (7 pages) =====');
    for (const pg of PAGES) {
        const errors = [];
        const page = await browser.newPage();
        page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
        page.on('pageerror', err => errors.push(err.message));
        await page.setViewport({ width: 1440, height: 900 });
        await page.goto(BASE + '/' + pg, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 200));
        try {
            const atc = await page.$('.add-to-cart-btn, [data-product-id]');
            if (atc) { await atc.click(); await new Promise(r => setTimeout(r, 500)); }
        } catch(e) {}
        // Check for raw keys in drawer
        const rawKeys = await page.evaluate(() => {
            const d = document.getElementById('skCartDrawer');
            if (!d) return [];
            const texts = d.textContent || '';
            const matches = texts.match(/cart[A-Z][a-zA-Z]+/g) || [];
            return [...new Set(matches)].filter(k => !['cartEyebrow','cartItemCount','cartEmpty','cartDiscover','cartSubtotal','cartShipping','cartCheckout','cartContinue'].includes(k));
        });
        console.log(pg + ': ' + errors.length + ' errors, raw keys: ' + (rawKeys.length === 0 ? 'NONE' : JSON.stringify(rawKeys)));
        await page.close();
    }
    console.log('');

    // ===== 13. GIT DIFF --STAT =====
    console.log('===== 13. git diff --stat =====');
    console.log(execSync('cd ' + PWD + ' && git diff --stat -- css/styles.css js/main.js', { encoding: 'utf8' }));

    await browser.close();
    console.log('===== ALL VERIFICATIONS COMPLETE =====');
}

main().catch(e => { console.error(e); process.exit(1); });
