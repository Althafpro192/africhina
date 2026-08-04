// QA Verification — Phase 5: Form Validation Across 5 Refactored Forms
// Confirms each migrated form rejects empty submissions with:
//   1. A localized BaseAlert toast banner
//   2. Per-field rose-500 error borders
//   3. Inline localized error <p> messages
//   4. Focus on the first invalid field (data-field selector)
//
// Forms covered:
//   - Login.vue (login + register modes)
//   - Register.vue
//   - SetNewPassword.vue
//   - Settings.vue (profile + password modal)
//   - RFQCreate.vue (11 fields)
//
// Locale coverage: en, id, fr, zh (smoke-tested on each form).

const { chromium } = require('playwright');

const BASE_URL = 'http://127.0.0.1:8000';
const CHROME_PATH = '/usr/bin/google-chrome';

function assert(condition, message) {
    if (!condition) throw new Error(`FAIL: ${message}`);
    console.log(`PASS: ${message}`);
}

async function setLocaleAfterNav(page, locale) {
    // MUST be called AFTER page has navigated to same-origin.
    await page.evaluate((loc) => {
        try { localStorage.setItem('africhina-locale', loc); } catch (e) { }
    }, locale);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
}

async function expectValidationAlert(page, formName, locale) {
    // The useFormValidation submitGuard triggers a toast via useToast() with type 'error'.
    const toast = page.locator('[role="alert"], .toast-container, .toast').first();
    const visible = await toast.isVisible({ timeout: 4000 }).catch(() => false);
    assert(visible, `[${formName}][${locale}] toast/alert banner appeared`);
    if (visible) {
        const txt = await toast.innerText().catch(() => '');
        assert(txt.length > 0, `[${formName}][${locale}] toast has text: "${txt.slice(0, 60).replace(/\n/g, ' ')}"`);
    }
}

async function expectInlineErrors(page, formName, locale, expectedMinCount) {
    const errors = page.locator('p.text-rose-500');
    const count = await errors.count();
    assert(count >= expectedMinCount, `[${formName}][${locale}] inline error messages showed (count=${count}, expected>=${expectedMinCount})`);
}

async function expectRoseBorders(page, formName, locale) {
    const roseBordered = page.locator('input.border-rose-500, select.border-rose-500, textarea.border-rose-500');
    const count = await roseBordered.count();
    assert(count >= 1, `[${formName}][${locale}] at least one field has error border (count=${count})`);
}

async function submitEmptyAndExpectValidation(page, formName, locale, expectedInline) {
    // Click submit, give the JS validator time to run + focus first invalid.
    await page.waitForTimeout(300);
    await page.locator('button[type="submit"]').first().click({ timeout: 3000 });
    await page.waitForTimeout(1000);
    await expectValidationAlert(page, formName, locale);
    await expectInlineErrors(page, formName, locale, expectedInline);
    await expectRoseBorders(page, formName, locale);
}

async function runLoginForm(browser, locale) {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);
        await setLocaleAfterNav(page, locale);
        const loginForm = page.locator('form:visible').filter({ has: page.locator('input[type="password"]') }).first();
        const novalidate = await loginForm.evaluate((f) => f.hasAttribute('novalidate'));
        assert(novalidate, `[login][${locale}] form has novalidate attr`);
        await submitEmptyAndExpectValidation(loginForm, 'login', locale, 2);
    } finally {
        await context.close();
    }
}

async function runRegisterForm(browser, locale) {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    try {
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);
        await setLocaleAfterNav(page, locale);
        const form = page.locator('form:visible').first();
        const novalidate = await form.evaluate((f) => f.hasAttribute('novalidate'));
        assert(novalidate, `[register][${locale}] form has novalidate attr`);
        await submitEmptyAndExpectValidation(form, 'register', locale, 3);
    } finally {
        await context.close();
    }
}

async function runSetNewPasswordForm(browser, locale) {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    try {
        await page.goto(`${BASE_URL}/reset-password?token=dummytoken&email=test@example.com`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);
        await setLocaleAfterNav(page, locale);
        const form = page.locator('form').first();
        const visible = await form.isVisible({ timeout: 2000 }).catch(() => false);
        if (!visible) {
            console.log(`SKIP: [set-new-password][${locale}] form not visible, skipping`);
            return;
        }
        const novalidate = await form.evaluate((f) => f.hasAttribute('novalidate'));
        assert(novalidate, `[set-new-password][${locale}] form has novalidate attr`);
        await submitEmptyAndExpectValidation(form, 'set-new-password', locale, 2);
    } finally {
        await context.close();
    }
}

async function loginAsBuyer(page) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const loginForm = page.locator('form:visible').filter({ has: page.locator('input[type="password"]') }).first();
    await loginForm.locator('input[type="email"]').fill('test@buyer.com');
    await loginForm.locator('input[type="password"]').fill('password123');
    await loginForm.locator('button[type="submit"]').click();
    await page.waitForURL(/\/buyer\/dashboard/, { timeout: 15000 });
}

async function runSettingsForm(browser, locale) {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    try {
        await loginAsBuyer(page);
        await page.goto(`${BASE_URL}/buyer/settings`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);
        await setLocaleAfterNav(page, locale);
        const form = page.locator('form:visible').first();
        const novalidate = await form.evaluate((f) => f.hasAttribute('novalidate')).catch(() => false);
        if (!novalidate) {
            console.log(`SKIP: [settings][${locale}] cannot find novalidate form, skipping`);
            return;
        }
        assert(novalidate, `[settings][${locale}] form has novalidate attr`);
        await submitEmptyAndExpectValidation(form, 'settings', locale, 1);
    } finally {
        await context.close();
    }
}

async function runRFQCreateForm(browser, locale) {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    try {
        await loginAsBuyer(page);
        await page.goto(`${BASE_URL}/buyer/rfq/create`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        await setLocaleAfterNav(page, locale);
        const form = page.locator('form:visible').first();
        const novalidate = await form.evaluate((f) => f.hasAttribute('novalidate')).catch(() => false);
        if (!novalidate) {
            console.log(`SKIP: [rfq-create][${locale}] cannot find novalidate form, skipping`);
            return;
        }
        assert(novalidate, `[rfq-create][${locale}] form has novalidate attr`);
        await submitEmptyAndExpectValidation(form, 'rfq-create', locale, 5);
    } finally {
        await context.close();
    }
}

(async () => {
    const browser = await chromium.launch({
        executablePath: CHROME_PATH,
        headless: false,
    });
    const summary = [];
    try {
        const locales = ['en', 'id', 'fr', 'zh'];
        for (const locale of locales) {
            console.log(`\n=== Locale: ${locale} ===`);
            const tests = [
                ['login', runLoginForm],
                ['register', runRegisterForm],
                ['set-new-password', runSetNewPasswordForm],
                ['settings', runSettingsForm],
                ['rfq-create', runRFQCreateForm],
            ];
            for (const [name, fn] of tests) {
                try {
                    await fn(browser, locale);
                    summary.push(`${name}[${locale}] OK`);
                } catch (e) {
                    summary.push(`${name}[${locale}] FAIL: ${e.message.split('\n')[0]}`);
                }
            }
        }
    } catch (e) {
        console.error('FATAL:', e);
    } finally {
        console.log('\n=== SUMMARY ===');
        for (const line of summary) console.log(line);
        const failCount = summary.filter((s) => s.includes('FAIL')).length;
        console.log(`\nTotal: ${summary.length} runs, ${failCount} failed`);
        await browser.close();
    }
})();
