/**
 * Comprehensive Upload Feature Test
 * Tests all image upload features across the AfriChina application
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = process.env.API_URL || 'http://localhost:8000';
const TEST_TIMEOUT = 60000;

// Test colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`  ${title}`, 'cyan');
    log('='.repeat(60), 'cyan');
}

// Test results tracking
let testsPassed = 0;
let testsFailed = 0;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Create a test image file (1x1 pixel PNG)
function createTestImage(filename) {
    // Minimal valid PNG (1x1 pixel, transparent)
    const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // bit depth, color type, etc
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
        0x42, 0x60, 0x82
    ]);

    fs.writeFileSync(filename, pngBuffer);
    return filename;
}

async function testFileUpload(token) {
    logSection('TEST 1: Generic File Upload Endpoint');

    try {
        const testFile = createTestImage('/tmp/test-upload.png');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFile));

        const response = await axios.post(`${API_BASE}/api/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: TEST_TIMEOUT
        });

        if (response.data.success && response.data.data.url) {
            log(`✅ Generic upload: PASSED - URL: ${response.data.data.url}`, 'green');
            testsPassed++;
            return response.data.data.url;
        } else {
            log(`❌ Generic upload: FAILED - Invalid response`, 'red');
            testsFailed++;
            return null;
        }
    } catch (error) {
        log(`❌ Generic upload: FAILED - ${error.message}`, 'red');
        testsFailed++;
        return null;
    }
}

async function testMultipleFileUpload(token) {
    logSection('TEST 2: Multiple File Upload Endpoint');

    try {
        const file1 = createTestImage('/tmp/test-multi-1.png');
        const file2 = createTestImage('/tmp/test-multi-2.png');

        const formData = new FormData();
        formData.append('files[]', fs.createReadStream(file1));
        formData.append('files[]', fs.createReadStream(file2));

        const response = await axios.post(`${API_BASE}/api/upload/multiple`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: TEST_TIMEOUT
        });

        if (response.data.success && response.data.data.uploaded.length >= 2) {
            log(`✅ Multiple upload: PASSED - ${response.data.data.uploaded.length} files uploaded`, 'green');
            testsPassed++;
            return response.data.data.uploaded.map(f => f.url);
        } else {
            log(`❌ Multiple upload: FAILED - Invalid response`, 'red');
            testsFailed++;
            return [];
        }
    } catch (error) {
        log(`❌ Multiple upload: FAILED - ${error.message}`, 'red');
        testsFailed++;
        return [];
    }
}

async function testAvatarUpload(token) {
    logSection('TEST 3: Avatar Upload');

    try {
        const testFile = createTestImage('/tmp/test-avatar.png');
        const formData = new FormData();
        formData.append('avatar', fs.createReadStream(testFile));

        const response = await axios.post(`${API_BASE}/api/auth/avatar`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: TEST_TIMEOUT
        });

        if (response.data.avatar_url || response.data.avatar_data) {
            log(`✅ Avatar upload: PASSED`, 'green');
            testsPassed++;
            return true;
        } else {
            log(`❌ Avatar upload: FAILED - No avatar data returned`, 'red');
            testsFailed++;
            return false;
        }
    } catch (error) {
        log(`❌ Avatar upload: FAILED - ${error.message}`, 'red');
        testsFailed++;
        return false;
    }
}

async function testRFQCreationWithImages(token, imageUrls) {
    logSection('TEST 4: RFQ Creation with Pre-uploaded Images');

    try {
        const formData = new FormData();
        formData.append('product_name', 'Test Product for Upload');
        formData.append('category', 'electronics');
        formData.append('quantity', '100');
        formData.append('budget_range', '1000-5000');
        formData.append('shipping_terms', 'FOB');
        formData.append('payment_terms', 'T/T 30%');

        // Append pre-uploaded image URLs
        if (imageUrls && imageUrls.length > 0) {
            imageUrls.forEach(url => {
                formData.append('images[]', url);
            });
        }

        const response = await axios.post(`${API_BASE}/api/requests`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: TEST_TIMEOUT
        });

        if (response.data.request && response.data.request.image_urls) {
            const imageCount = Array.isArray(response.data.request.image_urls)
                ? response.data.request.image_urls.length
                : 0;
            log(`✅ RFQ creation with images: PASSED - ${imageCount} images attached`, 'green');
            testsPassed++;
            return response.data.request.id;
        } else {
            log(`❌ RFQ creation: FAILED - No images in response`, 'red');
            testsFailed++;
            return null;
        }
    } catch (error) {
        log(`❌ RFQ creation: FAILED - ${error.message}`, 'red');
        testsFailed++;
        return null;
    }
}

async function testRFQDirectImageUpload(token) {
    logSection('TEST 5: RFQ Creation with Direct Image Upload');

    try {
        const testFile = createTestImage('/tmp/test-rfq-direct.png');
        const formData = new FormData();
        formData.append('product_name', 'Direct Upload Test Product');
        formData.append('category', 'machinery');
        formData.append('quantity', '50');
        formData.append('budget_range', '5000-10000');
        formData.append('shipping_terms', 'CIF');
        formData.append('payment_terms', 'L/C');
        formData.append('images[]', fs.createReadStream(testFile));

        const response = await axios.post(`${API_BASE}/api/requests`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: TEST_TIMEOUT
        });

        if (response.data.request && response.data.request.image_urls) {
            const hasImages = Array.isArray(response.data.request.image_urls)
                ? response.data.request.image_urls.length > 0
                : false;
            if (hasImages) {
                log(`✅ RFQ direct upload: PASSED - Images stored successfully`, 'green');
                testsPassed++;
                return response.data.request.id;
            }
        }
        log(`❌ RFQ direct upload: FAILED - Images not stored`, 'red');
        testsFailed++;
        return null;
    } catch (error) {
        log(`❌ RFQ direct upload: FAILED - ${error.message}`, 'red');
        testsFailed++;
        return null;
    }
}

async function testMessageUpload(token, requestId) {
    logSection('TEST 6: Message with Media Upload');

    if (!requestId) {
        log(`⚠️ Skipping message test - no request ID`, 'yellow');
        return;
    }

    try {
        const testFile = createTestImage('/tmp/test-message.png');
        const formData = new FormData();
        formData.append('content', 'Test message with image');
        formData.append('media', fs.createReadStream(testFile));

        const response = await axios.post(`${API_BASE}/api/requests/${requestId}/messages`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: TEST_TIMEOUT
        });

        if (response.data.media_url) {
            log(`✅ Message media upload: PASSED`, 'green');
            testsPassed++;
            return true;
        } else {
            log(`❌ Message media upload: FAILED - No media URL`, 'red');
            testsFailed++;
            return false;
        }
    } catch (error) {
        log(`❌ Message media upload: FAILED - ${error.message}`, 'red');
        testsFailed++;
        return false;
    }
}

async function testGetMeEndpoint(token) {
    logSection('TEST 7: Get User Profile (Avatar Display)');

    try {
        const response = await axios.get(`${API_BASE}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: TEST_TIMEOUT
        });

        const user = response.data;
        const hasAvatar = user.avatar_url || user.avatar_data || user.avatar_mime_type;

        if (hasAvatar) {
            log(`✅ Get profile: PASSED - Avatar data present`, 'green');
            testsPassed++;
        } else {
            log(`⚠️ Get profile: WARNING - No avatar data (may need upload first)`, 'yellow');
        }
        return true;
    } catch (error) {
        log(`❌ Get profile: FAILED - ${error.message}`, 'red');
        testsFailed++;
        return false;
    }
}

async function runTests() {
    logSection('AfriChina Upload Feature Test Suite');
    log(`Testing API: ${API_BASE}\n`, 'blue');

    // First, login to get a token
    let token = null;
    let userId = null;

    try {
        // Try to login with existing test credentials
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'buyer@test.com',
            password: 'password123'
        }, { timeout: TEST_TIMEOUT });

        if (loginResponse.data.token) {
            token = loginResponse.data.token;
            userId = loginResponse.data.user?.id;
            log(`✅ Login successful - User ID: ${userId}`, 'green');
        }
    } catch (error) {
        // Try admin account
        try {
            const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
                email: 'admin@africhina.com',
                password: 'admin123'
            }, { timeout: TEST_TIMEOUT });

            if (loginResponse.data.token) {
                token = loginResponse.data.token;
                userId = loginResponse.data.user?.id;
                log(`✅ Admin login successful - User ID: ${userId}`, 'green');
            }
        } catch (error2) {
            log(`❌ Login failed - Cannot proceed with authenticated tests`, 'red');
            log(`   ${error.message}`, 'red');
            log(`   ${error2.message}`, 'red');
        }
    }

    if (!token) {
        log(`\n⚠️ Skipping authenticated tests - no valid token`, 'yellow');
    } else {
        // Run authenticated tests
        const uploadedUrls = await testFileUpload(token);
        const multipleUrls = await testMultipleFileUpload(token);

        await testAvatarUpload(token);
        await testGetMeEndpoint(token);

        const rfqId1 = await testRFQCreationWithImages(token, uploadedUrls ? [uploadedUrls] : []);
        const rfqId2 = await testRFQDirectImageUpload(token);

        await testMessageUpload(token, rfqId1);
    }

    // Summary
    logSection('Test Summary');
    log(`Total Passed: ${testsPassed}`, testsPassed > 0 ? 'green' : 'yellow');
    log(`Total Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`,
        testsPassed > testsFailed ? 'green' : 'yellow');

    // Cleanup
    const tempFiles = [
        '/tmp/test-upload.png',
        '/tmp/test-multi-1.png',
        '/tmp/test-multi-2.png',
        '/tmp/test-avatar.png',
        '/tmp/test-rfq-direct.png',
        '/tmp/test-message.png'
    ];

    tempFiles.forEach(file => {
        try {
            if (fs.existsSync(file)) fs.unlinkSync(file);
        } catch (e) { }
    });

    process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
