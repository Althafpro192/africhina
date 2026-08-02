const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8000';
const OUT_DIR = path.join(__dirname, 'test-results');
const REPORT_PATH = path.join(OUT_DIR, 'rfq-vue-error-forensics.json');

function serializeError(error) {
    return {
        name: error?.name || null,
        message: error?.message || String(error),
        stack: error?.stack || null,
    };
}

(async () => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-cache',
            '--js-flags=--async-stack-traces',
        ],
    });

    const context = await browser.newContext({
        bypassCSP: true,
    });
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });

    const report = {
        startedAt: new Date().toISOString(),
        console: [],
        pageErrors: [],
        vueErrors: [],
        scripts: [],
        states: [],
    };

    await page.exposeFunction('__recordVueError', (entry) => {
        report.vueErrors.push(entry);
        console.log('\n[VUE ERROR HANDLER]');
        console.log(JSON.stringify(entry, null, 2));
    });

    await page.addInitScript(() => {
        window.__FORENSICS__ = { installed: false, attempts: 0, errors: [] };

        const componentName = (type) => {
            if (!type) return 'Unknown';
            return type.name || type.__name || type.displayName || type.__file || 'Anonymous';
        };

        const install = () => {
            window.__FORENSICS__.attempts += 1;
            const root = document.querySelector('#app');
            const app = root?.__vue_app__;
            if (!app || window.__FORENSICS__.installed) return false;

            const previousHandler = app.config.errorHandler;
            app.config.errorHandler = (error, instance, info) => {
                const internal = instance?.$ || null;
                const chain = [];
                let cursor = internal;
                while (cursor && chain.length < 30) {
                    chain.push({
                        uid: cursor.uid,
                        name: componentName(cursor.type),
                        file: cursor.type?.__file || null,
                        vnodeKey: cursor.vnode?.key ?? null,
                    });
                    cursor = cursor.parent;
                }

                let props = null;
                try {
                    props = internal?.props ? JSON.parse(JSON.stringify(internal.props)) : null;
                } catch (serializationError) {
                    props = { serializationError: serializationError.message };
                }

                const entry = {
                    timestamp: new Date().toISOString(),
                    name: error?.name || null,
                    message: error?.message || String(error),
                    stack: error?.stack || null,
                    info,
                    component: chain[0] || null,
                    componentChain: chain,
                    props,
                    route: location.href,
                };

                window.__FORENSICS__.errors.push(entry);
                console.error('[FORENSIC_VUE_ERROR]', entry);
                window.__recordVueError(entry);

                if (previousHandler) previousHandler(error, instance, info);
            };

            window.__FORENSICS__.installed = true;
            console.info('[FORENSIC] Vue error handler installed', {
                rootComponent: componentName(app._component),
                attempts: window.__FORENSICS__.attempts,
                route: location.href,
            });
            return true;
        };

        const timer = setInterval(() => {
            if (install()) clearInterval(timer);
        }, 0);

        addEventListener('error', (event) => {
            console.error('[FORENSIC_WINDOW_ERROR]', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack || null,
            });
        });

        addEventListener('unhandledrejection', (event) => {
            console.error('[FORENSIC_REJECTION]', {
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack || null,
            });
        });
    });

    page.on('console', async (message) => {
        const entry = {
            timestamp: new Date().toISOString(),
            type: message.type(),
            text: message.text(),
            location: message.location(),
        };
        report.console.push(entry);
        if (/FORENSIC|Cannot create property|TypeError/.test(entry.text)) {
            console.log(`[CONSOLE ${entry.type}] ${entry.text}`);
            console.log('location:', JSON.stringify(entry.location));
            for (const arg of message.args()) {
                try {
                    console.log('arg:', JSON.stringify(await arg.jsonValue(), null, 2));
                } catch (_) {
                    // Ignore non-serializable console handles.
                }
            }
        }
    });

    page.on('pageerror', (error) => {
        const entry = serializeError(error);
        report.pageErrors.push(entry);
        console.log('\n[PAGE ERROR]');
        console.log(JSON.stringify(entry, null, 2));
    });

    page.on('response', async (response) => {
        const url = response.url();
        if (!/\/assets\/.*\.(js|css)(\?|$)/.test(url)) return;
        const headers = response.headers();
        report.scripts.push({
            url,
            status: response.status(),
            cacheControl: headers['cache-control'] || null,
            etag: headers.etag || null,
            sourceMapHeader: headers['sourcemap'] || headers['x-sourcemap'] || null,
        });
    });

    try {
        console.log('=== RFQ VUE ERROR FORENSICS ===');
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.fill('input[type="email"]', 'buyer@africhina.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        report.states.push({
            stage: 'after-login',
            url: page.url(),
            forensic: await page.evaluate(() => window.__FORENSICS__),
        });

        await page.goto(`${BASE_URL}/buyer/rfq/create`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        report.states.push({
            stage: 'before-upload',
            url: page.url(),
            forensic: await page.evaluate(() => window.__FORENSICS__),
        });

        const filePath = path.join(OUT_DIR, 'forensic-test-image.png');
        fs.writeFileSync(
            filePath,
            Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                'base64',
            ),
        );

        const fileInput = page.locator('.file-input-hidden').first();
        await fileInput.setInputFiles(filePath);
        await page.waitForTimeout(4000);

        report.states.push({
            stage: 'after-upload',
            url: page.url(),
            forensic: await page.evaluate(() => window.__FORENSICS__),
            dom: await page.evaluate(() => ({
                processingVisible: Boolean(document.querySelector('.drop-zone__processing')),
                addMoreVisible: Boolean(document.querySelector('.drop-zone__add-more')),
                fileCards: document.querySelectorAll('.file-card').length,
                dropZoneClass: document.querySelector('.drop-zone')?.className || null,
            })),
        });

        const sourceMapProbes = [];
        for (const asset of report.scripts.filter((item) => item.url.endsWith('.js'))) {
            const mapResponse = await context.request.get(`${asset.url}.map`);
            sourceMapProbes.push({
                mapUrl: `${asset.url}.map`,
                status: mapResponse.status(),
                contentType: mapResponse.headers()['content-type'] || null,
            });
        }
        report.sourceMapProbes = sourceMapProbes;

        await page.screenshot({
            path: path.join(OUT_DIR, 'rfq-vue-error-forensics.png'),
            fullPage: true,
        });
    } catch (error) {
        report.runnerError = serializeError(error);
        console.error('[RUNNER ERROR]', error);
    } finally {
        report.finishedAt = new Date().toISOString();
        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
        console.log(`\nReport: ${REPORT_PATH}`);
        console.log(`Vue errors: ${report.vueErrors.length}`);
        console.log(`Page errors: ${report.pageErrors.length}`);
        await browser.close();
    }
})();
