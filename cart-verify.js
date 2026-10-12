const puppeteer = require('puppeteer');
const fs = require('fs');

const PWD = '/home/wal3fo/Desktop/Sukoon';
const URL = 'http://localhost:8889/cart_test.html';

async function run() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
        defaultViewport: null
    });

    const VIEWPORTS = { '1440': { width: 1440, height: 1080 }, '375': { width: 375, height: 667 } };
    const CART_STATES = ['empty', '1', '3', '6'];
    const LANGS = ['en', 'fr'];

    for (const vpName of Object.keys(VIEWPORTS)) {
        const vp = VIEWPORTS[vpName];
        for (const state of CART_STATES) {
            for (const lang of LANGS) {
                const page = await browser.newPage();
                await page.setViewport(vp);
                
                await page.goto(URL + '?state=' + state + '&lang=' + lang, { waitUntil: 'networkidle0' });
                await page.waitForSelector('.sk-cart-drawer.is-open', { timeout: 5000 });
                await new Promise(r => setTimeout(r, 400));
                
                const fname = '/tmp/screenshots/cart_' + vpName + 'px_' + state + '_' + lang + '.png';
                await page.screenshot({ path: fname });
                
                const info = await page.evaluate(() => {
                    const drawer = document.getElementById('skCartDrawer');
                    const body = document.querySelector('.sk-cart-body');
                    const foot = document.querySelector('.sk-cart-foot');
                    const items = body.querySelectorAll('.sk-cart-item');
                    const empty = body.querySelector('.sk-cart-empty');
                    const emptyBtn = body.querySelector('.sk-cart-empty-btn');
                    const countEl = document.getElementById('skCartCount');
                    const checkout = foot.querySelector('.sk-cart-checkout');
                    const continueBtn = foot.querySelector('.sk-cart-continue');
                    const upsellTrack = foot.querySelector('.sk-cart-upsell-track');
                    const upsellLink = foot.querySelector('.sk-cart-upsell-link');
                    const cartTotal = foot.querySelector('#skCartTotal');
                    
                    function box(el) {
                        if (!el) return null;
                        const r = el.getBoundingClientRect();
                        return {
                            x: Math.round(r.left), y: Math.round(r.top),
                            w: Math.round(r.width), h: Math.round(r.height)
                        };
                    }
                    
                    return {
                        drawer: box(drawer),
                        count: box(countEl),
                        foot: box(foot),
                        footHidden: foot.hidden,
                        footDisplay: getComputedStyle(foot).display,
                        checkout: box(checkout),
                        continue: box(continueBtn),
                        upsellTrack: box(upsellTrack),
                        emptyBtn: box(emptyBtn),
                        itemCount: items.length,
                        emptyState: empty ? 'visible' : 'none',
                        item0: items.length > 0 ? box(items[0]) : null,
                        itemLast: items.length > 0 ? box(items[items.length-1]) : null,
                        cartText: drawer.textContent.replace(/\s+/g, ' ').trim().substring(0, 150),
                        upsellLinkHref: upsellLink ? upsellLink.getAttribute('href') : null,
                        upsellLinkText: upsellLink ? upsellLink.textContent : null,
                        upsellLinkBefore: upsellLink ? getComputedStyle(upsellLink, '::before').content : null,
                        upsellLinkAfter: upsellLink ? getComputedStyle(upsellLink, '::after').content : null,
                        cartTotal: cartTotal ? cartTotal.textContent : null,
                    };
                });
                
                const sz = fs.statSync(fname).size;
                console.log('=== ' + vpName + 'px | ' + state + ' items | ' + lang + ' | (' + sz + 'B) ===');
                console.log('Drawer:', info.drawer);
                console.log('Count:', info.count);
                console.log('Foot:', info.foot, 'hidden:', info.footHidden, 'display:', info.footDisplay);
                console.log('Checkout:', info.checkout);
                console.log('Continue:', info.continue);
                console.log('UpsellTrack:', info.upsellTrack);
                console.log('EmptyBtn:', info.emptyBtn, 'emptyState:', info.emptyState);
                console.log('Items:', info.itemCount, 'Item0:', info.item0, 'Last:', info.itemLast);
                console.log('Total:', info.cartTotal);
                console.log('UpsellLink:', info.upsellLinkHref, info.upsellLinkText, 'after:', info.upsellLinkAfter);
                console.log('CartText:', info.cartText);
                console.log('');
                
                await page.close();
            }
        }
    }
    
    await browser.close();
    console.log('=== DONE ===');
}

run().catch(e => { console.error(e); process.exit(1); });
