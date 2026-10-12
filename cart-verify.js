const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = 'http://localhost:8889';
const PWD = '/home/wal3fo/Desktop/Sukoon';
const SCREENSHOTS_DIR = '/tmp/screenshots';
const VIEWPORTS = { '1440': { width: 1440, height: 1080 }, '375': { width: 375, height: 667 } };
const LANGS = ['en', 'fr'];

const drawerEval = `
(function() {
    function box(el) {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    }
    function ct(el) { return el ? el.textContent.replace(/\\s+/g, ' ').trim() : null; }

    const drawer = document.getElementById('skCartDrawer');
    if (!drawer) return { error: 'drawer not found' };
    const items = drawer.querySelectorAll('.sk-cart-item');
    const foot = drawer.querySelector('.sk-cart-foot');
    const body = drawer.querySelector('.sk-cart-body');

    const data = {
        footHidden: foot ? foot.hidden : null,
        items: [],
        priceBoxes: [],
        removeBoxes: [],
        stepperBoxes: [],
        gridBoxes: [],
        packshots: [],
        packshotsTrackBox: null,
        upsellLinkBox: null,
        checkoutBox: null,
        checkoutText: null,
        subtotal: null,
        countText: null,
        bodyBox: null,
    };

    const countEl = document.getElementById('skCartCount');
    data.countText = countEl ? ct(countEl) : null;
    const totalEl = foot ? foot.querySelector('#skCartTotal') : null;
    data.subtotal = totalEl ? totalEl.textContent : null;
    const checkoutBtn = foot ? foot.querySelector('#skCartCheckout') : null;
    data.checkoutBox = box(checkoutBtn);
    data.checkoutText = checkoutBtn ? ct(checkoutBtn) : null;
    const upsellLink = foot ? foot.querySelector('.sk-cart-upsell-link') : null;
    data.upsellLinkBox = box(upsellLink);
    const packTrack = foot ? foot.querySelector('.sk-cart-packshots') : null;
    data.packshotsTrackBox = box(packTrack);
    data.bodyBox = box(body);

    if (foot && packTrack) {
        packTrack.querySelectorAll('.sk-cart-packshot').forEach(function(el) {
            data.packshots.push({
                box: box(el),
                href: el.getAttribute('href'),
                label: ct(el.querySelector('.sk-cart-packshot-label')),
                imgSrc: el.querySelector('img') ? el.querySelector('img').getAttribute('src') : null,
            });
        });
    }

    items.forEach(function(item, i) {
        const grid = item.querySelector('.sk-cart-item-grid');
        const price = item.querySelector('.sk-cart-item-price');
        const qty = item.querySelector('.sk-cart-qty');
        const remove = item.querySelector('.sk-cart-remove');
        const tagline = item.querySelector('.sk-cart-item-tagline');
        const name = item.querySelector('.sk-cart-item-name');

        if (price) data.priceBoxes.push({ index: i, box: box(price), text: ct(price) });
        if (remove) {
            const svg = remove.querySelector('svg');
            const isTrash = svg ? !!svg.querySelector('path[d*="M6 7V4"]') : false;
            data.removeBoxes.push({ index: i, box: box(remove), aria: remove.getAttribute('aria-label'), isTrash: isTrash });
        }
        if (qty) data.stepperBoxes.push({ index: i, box: box(qty) });
        if (grid) data.gridBoxes.push({ index: i, box: box(grid) });
        data.items.push({
            index: i,
            name: ct(name),
            tagline: ct(tagline),
        });
    });

    return data;
})()
`;

async function main() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });

    // ===== 1. BOUNDING BOXES + SCREENSHOTS (empty/1/3) =====
    console.log('===== 1. BOUNDING BOXES + SCREENSHOTS =====\n');
    for (const vpName of Object.keys(VIEWPORTS)) {
        for (const lang of LANGS) {
            for (const state of ['empty', '1', '3']) {
                const vp = VIEWPORTS[vpName];
                const page = await browser.newPage();
                await page.setViewport(vp);
                await page.goto(BASE + '/cart_test.html?state=' + state + '&lang=' + lang, { waitUntil: 'networkidle0' });
                await page.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
                await new Promise(r => setTimeout(r, 500));
                const data = await page.evaluate(drawerEval);
                const fname = path.join(SCREENSHOTS_DIR, 'drawer_' + vpName + 'px_' + state + '_' + lang + '.png');
                await page.screenshot({ path: fname });
                const sz = fs.statSync(fname).size;
                console.log('SHOT: drawer_' + vpName + 'px_' + state + '_' + lang + '.png (' + sz + 'B)');
                console.log('  Count:', data.countText, '| Foot hidden:', data.footHidden, '| Subtotal:', data.subtotal);
                if (data.items.length) {
                    data.items.forEach(it => console.log('  Item ' + it.index + ': name="' + it.name + '" tagline="' + it.tagline + '"'));
                    data.priceBoxes.forEach(p => console.log('    Price: ' + JSON.stringify(p.box) + ' = ' + p.text));
                    data.removeBoxes.forEach(r => console.log('    Remove(trash=' + r.isTrash + '): ' + JSON.stringify(r.box) + ' aria="' + r.aria + '"'));
                    data.stepperBoxes.forEach(s => console.log('    Stepper: ' + JSON.stringify(s.box)));
                    data.gridBoxes.forEach(g => console.log('    Grid: ' + JSON.stringify(g.box)));
                }
                console.log('  Packshots track:', JSON.stringify(data.packshotsTrackBox), 'count:', data.packshots.length);
                data.packshots.forEach(p => console.log('    Packshot: ' + JSON.stringify(p.box) + ' href=' + p.href + ' label="' + p.label + '"'));
                console.log('  Upsell link:', JSON.stringify(data.upsellLinkBox));
                console.log('  Checkout:', JSON.stringify(data.checkoutBox), 'text="' + data.checkoutText + '"');
                console.log('');
                await page.close();
            }
        }
    }

    // ===== 2. TAGLINE LOOKUP (1notl state) =====
    console.log('===== 2. TAGLINE LOOKUP (state=1notl — no tagline stored) =====\n');
    for (const vpName of Object.keys(VIEWPORTS)) {
        for (const lang of LANGS) {
            const vp = VIEWPORTS[vpName];
            const page = await browser.newPage();
            await page.setViewport(vp);
            await page.goto(BASE + '/cart_test.html?state=1notl&lang=' + lang, { waitUntil: 'networkidle0' });
            await page.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
            await new Promise(r => setTimeout(r, 300));
            const data = await page.evaluate(drawerEval);
            console.log(vpName + 'px / ' + lang + ': name="' + data.items[0].name + '" tagline="' + data.items[0].tagline + '"');
            await page.close();
        }
    }
    console.log('');

    // ===== 3. 6 ITEMS (scroll) =====
    console.log('===== 3. 6 ITEMS (scroll) =====\n');
    for (const vpName of Object.keys(VIEWPORTS)) {
        const vp = VIEWPORTS[vpName];
        const page = await browser.newPage();
        await page.setViewport(vp);
        await page.goto(BASE + '/cart_test.html?state=6&lang=en', { waitUntil: 'networkidle0' });
        await page.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
        await new Promise(r => setTimeout(r, 300));
        const data = await page.evaluate(drawerEval);
        console.log(vpName + 'px / 6 items:');
        console.log('  Item count:', data.items.length, '(expected 6)');
        console.log('  Body box:', JSON.stringify(data.bodyBox));
        data.items.forEach(it => console.log('  Item ' + it.index + ': "' + it.name + '" tagline="' + it.tagline + '"'));
        console.log('  Price boxes:', data.priceBoxes.map(p => p.box.x + ',' + p.box.y + ',' + p.box.w + 'x' + p.box.h + ' = ' + p.text).join(', '));
        console.log('  Remove boxes:', data.removeBoxes.map(r => r.box.x + ',' + r.box.y + ',' + r.box.w + 'x' + r.box.h).join(', '));
        console.log('  Stepper boxes:', data.stepperBoxes.map(s => s.box.x + ',' + s.box.y + ',' + s.box.w + 'x' + s.box.h).join(', '));
        console.log('  Grid boxes:', data.gridBoxes.map(g => g.box.x + ',' + g.box.y + ',' + g.box.w + 'x' + g.box.h).join(', '));
        console.log('  Packshots:', data.packshots.length, '(expected 0 — all 6 products in cart)');
        console.log('');
        await page.close();
    }

    // ===== 4. SAME ITEM TWICE =====
    console.log('===== 4. SAME ITEM TWICE (qty=2) =====\n');
    for (const vpName of Object.keys(VIEWPORTS)) {
        const vp = VIEWPORTS[vpName];
        const page = await browser.newPage();
        await page.setViewport(vp);
        await page.goto(BASE + '/cart_test.html?state=same&lang=en', { waitUntil: 'networkidle0' });
        await page.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
        await new Promise(r => setTimeout(r, 300));
        const data = await page.evaluate(drawerEval);
        console.log(vpName + 'px: items=' + data.items.length + ', price=' + data.priceBoxes[0]?.text + ', subtotal=' + data.subtotal);
        await page.close();
    }
    console.log('');

    // ===== 5. TRASH/STEPPER OVERLAP CHECK (1 item, both viewports) =====
    console.log('===== 5. TRASH vs STEPPER OVERLAP CHECK =====\n');
    for (const vpName of Object.keys(VIEWPORTS)) {
        for (const lang of LANGS) {
            const vp = VIEWPORTS[vpName];
            const page = await browser.newPage();
            await page.setViewport(vp);
            await page.goto(BASE + '/cart_test.html?state=1&lang=' + lang, { waitUntil: 'networkidle0' });
            await page.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
            await new Promise(r => setTimeout(r, 300));
            const overlap = await page.evaluate(() => {
                const remove = document.querySelector('.sk-cart-remove');
                const stepper = document.querySelector('.sk-cart-qty');
                if (!remove || !stepper) return { remove: null, stepper: null, overlap: false };
                const r = remove.getBoundingClientRect();
                const s = stepper.getBoundingClientRect();
                const overlap = !(r.right < s.left || r.left > s.right || r.bottom < s.top || r.top > s.bottom);
                return {
                    remove: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
                    stepper: { x: Math.round(s.left), y: Math.round(s.top), w: Math.round(s.width), h: Math.round(s.height) },
                    overlap2d: overlap,
                };
            });
            console.log(vpName + 'px / ' + lang + ': remove=' + JSON.stringify(overlap.remove) + ' stepper=' + JSON.stringify(overlap.stepper) + ' overlap=' + overlap.overlap2d);
            await page.close();
        }
    }
    console.log('');

    // ===== 6. CHECKOUT BUTTON HANDLER =====
    console.log('===== 6. CHECKOUT BUTTON =====\n');
    const cpage = await browser.newPage();
    await cpage.setViewport({ width: 1440, height: 1080 });
    await cpage.goto(BASE + '/cart_test.html?state=1&lang=en', { waitUntil: 'networkidle0' });
    await cpage.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
    const checkoutInfo = await cpage.evaluate(() => {
        const btn = document.getElementById('skCartCheckout');
        const cont = document.getElementById('skCartContinue');
        return {
            checkout: { tagName: btn.tagName, id: btn.id, hasHref: btn.hasAttribute('href') },
            continueBtn: { id: cont.id, href: cont.getAttribute('href') },
        };
    });
    console.log('Checkout button:', JSON.stringify(checkoutInfo.checkout));
    console.log('Continue button:', JSON.stringify(checkoutInfo.continueBtn));
    console.log('Handler: js/main.js:490-499 — clicks .sk-cart-checkout class, calls closeCart() + alert("Redirecting to checkout")');
    console.log('Continue handler: js/main.js:487-489 — clicks .sk-cart-continue class, calls closeCart()');
    await cpage.close();
    console.log('');

    // ===== 7. ARABIC FALLBACK KEYS =====
    console.log('===== 7. ARABIC FALLBACK KEYS =====\n');
    const ap = await browser.newPage();
    await ap.setViewport({ width: 1440, height: 1080 });
    await ap.goto(BASE + '/cart_test.html?state=empty&lang=en', { waitUntil: 'networkidle0' });
    const i18nInfo = await ap.evaluate(() => {
        const en = (global.SK_LOCALES && global.SK_LOCALES.en) || {};
        const fr = (global.SK_LOCALES && global.SK_LOCALES.fr) || {};
        const ar = (global.SK_LOCALES && global.SK_LOCALES.ar) || {};
        const cartKeys = [
            'cartEyebrow', 'cartItemCount', 'cartItemCount.one', 'cartItemCount.other',
            'cartEmpty', 'cartDiscover', 'cartSubtotal', 'cartShipping', 'cartCheckout',
            'cartContinue', 'cartUpsellHeading', 'cartUpsellLink', 'cartRemove',
            'decreaseQty', 'increaseQty',
        ];
        const missing = {};
        const arFallsBack = [];
        cartKeys.forEach(k => {
            if (!(k in en)) missing[k + '@en'] = 'missing';
            if (!(k in fr)) missing[k + '@fr'] = 'missing';
            if (!(k in ar)) { missing[k + '@ar'] = 'missing'; arFallsBack.push(k); }
        });
        return { missing, arFallsBack };
    });
    console.log('Missing keys:', Object.keys(i18nInfo.missing).length === 0 ? 'NONE' : JSON.stringify(i18nInfo.missing));
    console.log('AR fallback to EN:', i18nInfo.arFallsBack.length === 0 ? 'NONE' : JSON.stringify(i18nInfo.arFallsBack));
    await ap.close();
    console.log('');

    // ===== 8. essence.html CHECK =====
    console.log('===== 8. essence.html =====\n');
    const essenceExists = fs.existsSync(path.join(PWD, 'essence.html'));
    console.log('File exists:', essenceExists);
    try {
        const grepResult = execSync('grep -rl "essence.html" ' + PWD + ' --include="*.html" --include="*.js" 2>/dev/null', { encoding: 'utf8' });
        console.log('Files linking to essence.html:', grepResult.trim() || 'NONE');
    } catch (e) {
        console.log('Files linking to essence.html: NONE');
    }
    console.log('');

    // ===== 9. localStorage KEY + JSON SHAPE =====
    console.log('===== 9. localStorage KEY + JSON SHAPE =====\n');
    const lpage = await browser.newPage();
    await lpage.setViewport({ width: 1440, height: 1080 });
    await lpage.goto(BASE + '/cart_test.html?state=1&lang=en', { waitUntil: 'networkidle0' });
    await lpage.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
    const storageInfo = await lpage.evaluate(() => {
        const raw = localStorage.getItem('sukoonCart');
        const parsed = JSON.parse(raw);
        const firstKey = Object.keys(parsed)[0];
        return { key: 'sukoonCart', item: firstKey ? { [firstKey]: parsed[firstKey] } : null };
    });
    console.log('localStorage key: ' + storageInfo.key);
    console.log('JSON shape of one item:');
    console.log(JSON.stringify(storageInfo.item, null, 2));
    await lpage.close();
    console.log('');

    // ===== 10. TAGLINE LOOKUP SOURCE + VALUES =====
    console.log('===== 10. TAGLINE LOOKUP SOURCE =====\n');
    console.log('Location: js/main.js lines 341-346');
    console.log('Code:');
    console.log('  if (!tagline && global.SK_PRODUCTS) {');
    console.log('      var prod = global.SK_PRODUCTS.byId(id);');
    console.log('      if (prod && prod.taglineKey) {');
    console.log('          tagline = global.SKI18N ? global.SKI18N.t(prod.taglineKey) : "";');
    console.log('      }');
    console.log('  }');
    console.log('');
    const tpage = await browser.newPage();
    await tpage.setViewport({ width: 1440, height: 1080 });
    await tpage.goto(BASE + '/cart_test.html?state=empty&lang=en', { waitUntil: 'networkidle0' });
    const taglines = await tpage.evaluate(() => {
        const ids = ['royal-verbena', 'moroccan-mint', 'noble-chamomile', 'atlas-oregano', 'ruby-hibiscus', 'heritage-fennel'];
        const result = {};
        ids.forEach(id => {
            const prod = global.SK_PRODUCTS.byId(id);
            const en = global.SKI18N.setLang('en', false);
            global.SKI18N.setLang('fr', false);
            const fr = global.SKI18N.setLang('en', false); // reset
        });
        // Get EN values
        global.SKI18N.setLang('en', false);
        ids.forEach(id => {
            const prod = global.SK_PRODUCTS.byId(id);
            result[id] = { taglineKey: prod.taglineKey, en: global.SKI18N.t(prod.taglineKey) };
        });
        // Get FR values
        global.SKI18N.setLang('fr', false);
        ids.forEach(id => {
            const prod = global.SK_PRODUCTS.byId(id);
            result[id].fr = global.SKI18N.t(prod.taglineKey);
        });
        return result;
    });
    Object.entries(taglines).forEach(([id, info]) => {
        console.log('  ' + id + ': taglineKey="' + info.taglineKey + '" EN="' + info.en + '" FR="' + info.fr + '"');
    });
    await tpage.close();
    console.log('');

    // ===== 11. GIT DIFF --STAT =====
    console.log('===== 11. git diff --stat =====\n');
    const diffStat = execSync('cd ' + PWD + ' && git diff --stat -- css/styles.css js/main.js', { encoding: 'utf8' });
    console.log(diffStat);

    await browser.close();
    console.log('===== ALL VERIFICATIONS COMPLETE =====');
}

main().catch(e => { console.error(e); process.exit(1); });
