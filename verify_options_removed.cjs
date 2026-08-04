// Final verification: confirm the "Product Options" UI is gone from the served bundle.
// Uses local Zorin Chrome (executablePath=/usr/bin/google-chrome) + PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1.

const { chromium } = require('playwright');

const BASE = 'http://localhost:5000';

async function fetchBundleText(page, url) {
    const res = await page.request.get(url);
    return res.text();
}

(async () => {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
        args: ['--no-sandbox'],
    });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    const results = {
        indexHtmlStatus: null,
        bundleHash: null,
        bundleClean: null,
        optionsInBundle: 0,
        negotiateInBundle: 0,
        menungguInBundle: 0,
        servedTextContainsOptions: null,
        servedTextContainsNegotiate: null,
    };

    try {
        // 1) Index page loads
        const resp = await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        results.indexHtmlStatus = resp.status();

        // 2) Fetch the served JS bundle and the two RequestDetail chunks
        const indexJsUrl = BASE + '/assets/index-cZDOc6WI.js';
        const indexJsText = await fetchBundleText(page, indexJsUrl);
        results.bundleHash = 'index-cZDOc6WI.js (' + indexJsText.length + ' bytes)';

        const reqDetail1 = BASE + '/assets/RequestDetail-QsjCD9UT.js';
        const reqDetail2 = BASE + '/assets/RequestDetail-k3yudg7o.js';
        const r1 = await fetchBundleText(page, reqDetail1);
        const r2 = await fetchBundleText(page, reqDetail2);
        const allText = indexJsText + '\n' + r1 + '\n' + r2;

        // 3) Forbid the forbidden strings inside the served bundle
        const forbidden = ['Product Options', 'proceedToNegotiate', 'proceed_to_negotiate', 'menunggu_pemilihan_buyer'];
        const counts = {};
        for (const f of forbidden) {
            const re = new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            counts[f] = (allText.match(re) || []).length;
        }
        results.optionsInBundle = counts['Product Options'];
        results.negotiateInBundle = counts['proceedToNegotiate'] + counts['proceed_to_negotiate'];
        results.menungguInBundle = counts['menunggu_pemilihan_buyer'];
        results.bundleClean =
            results.optionsInBundle === 0 &&
            results.negotiateInBundle === 0 &&
            results.menungguInBundle === 0;

        // 4) Wait for app mount and inspect rendered DOM for any "Product Options" / "Add Option" UI
        await page.waitForSelector('#app', { timeout: 15000 });
        await page.waitForTimeout(2500);
        const dom = await page.content();
        results.servedTextContainsOptions = /Product Options|Add Option/i.test(dom);
        results.servedTextContainsNegotiate = /proceedToNegotiate/i.test(dom);

        await page.screenshot({ path: '/tmp/africhina_home.png', fullPage: false });

        console.log('\n=== PLAYWRIGHT VERIFICATION RESULTS ===');
        console.log('Index HTML status         :', results.indexHtmlStatus);
        console.log('Bundle (size)             :', results.bundleHash);
        console.log('Product Options count     :', results.optionsInBundle);
        console.log('proceedToNegotiate count  :', results.negotiateInBundle);
        console.log('menunggu_pemilihan count  :', results.menungguInBundle);
        console.log('Bundle is CLEAN           :', results.bundleClean);
        console.log('DOM still shows Options   :', results.servedTextContainsOptions);
        console.log('DOM still shows Negotiate :', results.servedTextContainsNegotiate);
        console.log('Screenshot saved          : /tmp/africhina_home.png');

        const pass =
            results.indexHtmlStatus === 200 &&
            results.bundleClean &&
            !results.servedTextContainsOptions &&
            !results.servedTextContainsNegotiate;
        console.log('\nFINAL VERDICT             :', pass ? 'PASS - Product Options fully removed' : 'FAIL');
        process.exitCode = pass ? 0 : 1;
    } catch (err) {
        console.error('ERROR:', err && err.message ? err.message : err);
        process.exitCode = 2;
    } finally {
        await browser.close();
    }
})();