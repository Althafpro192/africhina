/**
 * DIAGNOSTIC TEST: Stuck "Sedang diproses..." state on RFQ Create page
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'test-results');

(async () => {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    const browser = await chromium.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleLogs = [];
    page.on('console', (msg) => {
        const entry = `[${msg.type()}] ${msg.text()}`;
        consoleLogs.push(entry);
        if (msg.type() === 'error' || msg.text().includes('[DIAG]')) {
            console.log('  PAGE:', entry);
        }
    });

    page.on('pageerror', (err) => {
        console.log('  PAGE ERROR:', err.message);
        consoleLogs.push(`[pageerror] ${err.message}`);
    });

    page.on('response', async (resp) => {
        if (resp.status() >= 400) {
            console.log(`  HTTP ${resp.status()}: ${resp.url()}`);
        }
    });

    try {
        console.log('=== DIAGNOSTIC: Stuck Processing State ===\n');

        // 1. Login
        console.log('1. Logging in...');
        await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        await page.fill('input[type="email"]', 'buyer@africhina.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        console.log('   ✓ Login successful, current URL:', page.url(), '\n');

        // 2. Navigate to RFQ Create
        console.log('2. Navigating to /buyer/rfq/create ...');
        await page.goto('http://localhost:8000/buyer/rfq/create', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        // 2b. Debug page state
        const currentUrl = page.url();
        console.log('   current URL:', currentUrl);
        const fileInputs = await page.$$('input[type="file"]');
        console.log('   file inputs found:', fileInputs.length);
        const allInputs = await page.$$('input');
        console.log('   all inputs found:', allInputs.length);
        const fileUploadContainer = await page.$('.file-upload-container');
        console.log('   .file-upload-container present:', !!fileUploadContainer);
        const dropZone = await page.$('.drop-zone');
        console.log('   .drop-zone present:', !!dropZone);

        if (dropZone) {
            const dzHtml = await page.evaluate(() => {
                const dz = document.querySelector('.drop-zone');
                return dz ? dz.outerHTML.slice(0, 800) : null;
            });
            console.log('   drop zone HTML (first 800):', dzHtml);
        }

        // Dump first input outerHTML for diagnostic
        if (allInputs.length > 0) {
            const firstInputHtml = await page.evaluate(() => {
                const inp = document.querySelector('input[type="file"]');
                return inp ? inp.outerHTML : 'no file input';
            });
            console.log('   first file input:', firstInputHtml);
        }

        // 3. Inject diagnostics to watch isProcessing lifecycle
        console.log('\n3. Injecting Vue reactive watcher for isProcessing ...');
        const injectResult = await page.evaluate(() => {
            const allEls = document.querySelectorAll('*');
            let found = false;
            for (const el of allEls) {
                const inst = el.__vueParentComponent;
                if (inst && inst.setupState && 'isProcessing' in inst.setupState) {
                    found = true;
                    const sp = inst.setupState;
                    console.log('[DIAG] Found FileUpload element:', el.tagName, el.className);
                    console.log('[DIAG] Initial isProcessing.value =', sp.isProcessing?.value);
                    console.log('[DIAG] Initial files.value.length =', sp.files?.value?.length);
                    console.log('[DIAG] Initial hasFiles.value =', sp.hasFiles?.value);
                    let lastVal = sp.isProcessing?.value;
                    let lastFilesLen = sp.files?.value?.length;
                    setInterval(() => {
                        const v = sp.isProcessing?.value;
                        const f = sp.files?.value?.length;
                        if (v !== lastVal || f !== lastFilesLen) {
                            console.log(`[DIAG] CHANGE isProcessing: ${lastVal}->${v}, filesLen: ${lastFilesLen}->${f}`);
                            lastVal = v;
                            lastFilesLen = f;
                        }
                    }, 100);
                    return { found: true, isProcessing: sp.isProcessing?.value, filesCount: sp.files?.value?.length };
                }
            }
            return { found: false };
        });
        console.log('   inject result:', JSON.stringify(injectResult));

        if (!injectResult.found) {
            console.log('   ⚠ FileUpload component not found via __vueParentComponent walk');
        }

        await page.waitForTimeout(1500);

        // 4. Find the hidden file input
        console.log('\n4. Uploading 3 image files ...');
        let fileInput = await page.$('.file-input-hidden');
        if (!fileInput) {
            fileInput = await page.$('input[type="file"]');
        }
        if (!fileInput) {
            console.log('   ✗ Hidden file input NOT found');
            const html = await page.content();
            fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'no-input.html'), html);
            throw new Error('Hidden file input not found');
        }

        const tmpFiles = [];
        for (let i = 1; i <= 3; i++) {
            const fp = path.join(SCREENSHOTS_DIR, `test-img-${i}.png`);
            const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
            fs.writeFileSync(fp, png);
            tmpFiles.push(fp);
        }

        await fileInput.setInputFiles(tmpFiles);
        console.log('   ✓ Files attached to input');

        // 5. Wait and observe - check at intervals
        console.log('\n5. Watching state for 6s ...');
        for (let t = 0; t < 6; t++) {
            await page.waitForTimeout(1000);
            const snap = await page.evaluate(() => {
                const dz = document.querySelector('.drop-zone');
                const proc = document.querySelector('.drop-zone__processing');
                const addMore = document.querySelector('.drop-zone__add-more');
                const cards = document.querySelectorAll('[class*="file-card"]');
                let reactive = null;
                const allEls = document.querySelectorAll('*');
                for (const el of allEls) {
                    const inst = el.__vueParentComponent;
                    if (inst && inst.setupState && 'isProcessing' in inst.setupState) {
                        reactive = {
                            isProcessing: inst.setupState.isProcessing?.value,
                            filesCount: inst.setupState.files?.value?.length,
                            hasFiles: inst.setupState.hasFiles?.value,
                        };
                        break;
                    }
                }
                return {
                    procVisible: !!proc,
                    addMoreVisible: !!addMore,
                    cardCount: cards.length,
                    reactive,
                };
            });
            console.log(`   t=${t + 1}s:`, JSON.stringify(snap));
        }

        // 6. Final DOM state
        const domState = await page.evaluate(() => {
            const state = {};
            state.hasDropZone = !!document.querySelector('.drop-zone');
            state.hasProcessingIndicator = !!document.querySelector('.drop-zone__processing');
            state.hasAddMoreButton = !!document.querySelector('.drop-zone__add-more');
            state.fileCardCount = document.querySelectorAll('[class*="file-card"]').length;
            state.processingText = document.querySelector('.drop-zone__processing span:last-child')?.textContent?.trim() || null;
            state.dropZoneClass = document.querySelector('.drop-zone')?.className || null;
            return state;
        });
        console.log('\n=== FINAL DOM STATE ===');
        console.log(JSON.stringify(domState, null, 2));

        // 7. Final reactive state
        const reactiveState = await page.evaluate(() => {
            const allEls = document.querySelectorAll('*');
            for (const el of allEls) {
                const inst = el.__vueParentComponent;
                if (inst && inst.setupState && 'isProcessing' in inst.setupState) {
                    return {
                        isProcessing: inst.setupState.isProcessing?.value,
                        filesCount: inst.setupState.files?.value?.length,
                        hasFiles: inst.setupState.hasFiles?.value,
                        canAddMore: inst.setupState.canAddMore?.value,
                    };
                }
            }
            return null;
        });
        console.log('\n=== FINAL REACTIVE STATE ===');
        console.log(JSON.stringify(reactiveState, null, 2));

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'rfq-stuck-processing.png'), fullPage: true });
        console.log('\n   📸 Screenshot saved: test-results/rfq-stuck-processing.png');

        const diagLogs = consoleLogs.filter((l) => l.includes('[DIAG]'));
        console.log('\n=== DIAGNOSTIC LOGS FROM PAGE ===');
        if (diagLogs.length === 0) {
            console.log('(none captured)');
        } else {
            diagLogs.forEach((l) => console.log('  ', l));
        }

        console.log('\n=== VERDICT ===');
        if (domState.hasProcessingIndicator) {
            console.log('❌ BUG CONFIRMED: .drop-zone__processing element IS rendered');
            console.log('   isProcessing reactive value =', reactiveState?.isProcessing);
            console.log('   files.length =', reactiveState?.filesCount);
        } else if (reactiveState?.isProcessing === true) {
            console.log('❌ BUG CONFIRMED (state only): isProcessing=true but processing div not visible');
        } else if (reactiveState?.isProcessing === false) {
            console.log('✓ isProcessing=false, processing div not visible — NO BUG in this run');
        } else {
            console.log('? Unable to determine — isProcessing =', reactiveState?.isProcessing);
        }
    } catch (err) {
        console.error('Test error:', err.message);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'rfq-stuck-error.png'), fullPage: true });
    } finally {
        await browser.close();
    }
})();