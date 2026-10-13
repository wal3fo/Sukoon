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

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1080 });
    
    // Set cart state BEFORE page load using request interception
    await page.goto(URL + '?state=1&lang=en', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    
    // Get detailed info
    const info = await page.evaluate(() => {
        var drawer = document.getElementById('skCartDrawer');
        var body = document.querySelector('.sk-cart-body');
        var foot = document.querySelector('.sk-cart-foot');
        var count = document.getElementById('skCartCount');
        var items = body.querySelectorAll('.sk-cart-item');
        var empty = body.querySelector('.sk-cart-empty');
        var emptyBtn = body.querySelector('.sk-cart-empty-btn');
        
        return {
            drawerOpen: drawer.classList.contains('is-open'),
            drawerAriaHidden: drawer.getAttribute('aria-hidden'),
            footHidden: foot.hidden,
            footDisplay: getComputedStyle(foot).display,
            itemCount: items.length,
            emptyExists: !!empty,
            emptyBtnText: emptyBtn ? emptyBtn.textContent : null,
            countText: count ? count.textContent : null,
            bodyHTML: body.innerHTML.substring(0, 500),
            footHTML: foot.innerHTML.substring(0, 500),
            cartText: drawer.textContent.replace(/\s+/g, ' ').trim().substring(0, 200),
        };
    });
    
    console.log(JSON.stringify(info, null, 2));
    
    await browser.close();
}

run().catch(console.error);
