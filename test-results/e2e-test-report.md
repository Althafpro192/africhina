# Comprehensive E2E Test Report
Generated: 2026-07-31T16:40:58.525Z

## Summary
- **Total Tests**: 23
- **Passed**: 16
- **Failed**: 7
- **Warnings**: 0
- **Pass Rate**: 69.6%

## Test Results

### Guest Tests
- **PASS**: GUEST: Landing Page - Landing page loaded
- **PASS**: GUEST: Login Page - Login form visible
- **FAIL**: GUEST: Register Page - Register form not found

### Buyer Tests
- **PASS**: BUYER: Login - Login successful
- **FAIL**: BUYER: Dashboard - Dashboard empty or error
- **FAIL**: BUYER: Requests List - Error: page.$$: Unexpected token "" while parsing css selector "a[href*="/buyer/rfq/], .request-card, [class*="request"]". Did you mean to CSS.escape it?
- **PASS**: BUYER: Create RFQ - RFQ form loaded
- **FAIL**: BUYER: Request Detail - Error: page.$: Unexpected token "" while parsing css selector "a[href*="/buyer/rfq/][href$="/"]". Did you mean to CSS.escape it?
- **PASS**: BUYER: Messages - Messages page loaded
- **PASS**: BUYER: Orders - Orders page loaded
- **PASS**: BUYER: Suppliers - Suppliers page loaded
- **PASS**: BUYER: Sourcing - Sourcing page loaded
- **PASS**: BUYER: Logistics - Logistics page loaded
- **FAIL**: BUYER: Settings - Settings not found

### Admin Tests
- **FAIL**: ADMIN: Login - Error: page.fill: Timeout 20000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

- **PASS**: ADMIN: Dashboard - Admin dashboard loaded
- **PASS**: ADMIN: Requests - Admin requests loaded
- **PASS**: ADMIN: Suppliers - Admin suppliers loaded
- **PASS**: ADMIN: Drivers - Admin drivers loaded
- **PASS**: ADMIN: Ratings - Admin ratings loaded
- **PASS**: ADMIN: Messages - Admin messages loaded

### Driver Tests
- **FAIL**: DRIVER: Login - Error: page.fill: Timeout 20000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

- **PASS**: DRIVER: Messages - Driver messages loaded

## Screenshots
All screenshots saved to: test-results/e2e-screenshots/
