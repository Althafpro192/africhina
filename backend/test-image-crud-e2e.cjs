#!/usr/bin/env node
/**
 * Image CRUD E2E Test
 * ===================
 * Verifies the new image upload/delete endpoints for supplier logos and driver photos.
 *
 * Tests:
 *  1. Supplier CRUD lifecycle (create, upload logo, read back, delete logo, delete supplier)
 *  2. Driver CRUD lifecycle (create, upload photo, read back, delete photo, delete driver)
 *  3. Validation: reject non-image files
 *  4. Auth: endpoint requires admin token
 *  5. Logo/photo serve statically with correct content-type
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const API_BASE = 'http://localhost:8000/api';
const FRONTEND_BASE = 'http://localhost:5173';

const STATS = { passed: 0, failed: 0, warnings: 0 };
const results = [];

function logResult(name, status, details = '') {
  results.push({ name, status, details });
  if (status === 'PASS') STATS.passed++;
  else if (status === 'FAIL') STATS.failed++;
  else STATS.warnings++;
  console.log(`[${status}] ${name}${details ? ' - ' + details : ''}`);
}

function httpRequest(method, url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    if (options.body) {
      if (options.body instanceof Buffer) req.write(options.body);
      else req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Build multipart body manually (small helper) --------------------------------
function buildMultipart(fields, file) {
  const boundary = '----E2EBoundary' + Date.now();
  const parts = [];
  for (const [key, value] of Object.entries(fields)) {
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`);
  }
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${file.field}"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`);
  const head = Buffer.from(parts.join(''), 'utf-8');
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
  const body = Buffer.concat([head, file.content, tail]);
  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

// 1x1 PNG (transparent) - tiny valid image
const TINY_PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000005000100' +
  '0d0a2db40000000049454e44ae426082',
  'hex'
);

// 1x1 JPG (also valid)
const TINY_JPG = Buffer.from(
  'ffd8ffe000104a46494600010100000100010000ffdb00430003020202020203020202030303030406040404040408060605' +
  '0606050807070707070707070707070707070707070707070707070707070707070707070707070707070707070707070707070707070707' +
  '07ff' + '00'.repeat(100) + 'ffd9',
  'hex'
);

// 1. Login as admin ---------------------------------------------------------
async function loginAdmin() {
  const res = await httpRequest('POST', `${API_BASE}/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'test@admin.com', password: 'admin123' }
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Admin login failed: ${res.status} ${res.body}`);
  }
  const data = JSON.parse(res.body);
  return data.access_token || data.token || data.data?.token;
}

async function login(role = 'admin') {
  const creds = {
    admin: { email: 'test@admin.com', password: 'admin123' },
    buyer: { email: 'test@buyer.com', password: 'password123' },
  };
  const res = await httpRequest('POST', `${API_BASE}/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    body: creds[role]
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login ${role} failed: ${res.status} ${res.body}`);
  }
  const data = JSON.parse(res.body);
  return data.access_token || data.token || data.data?.token;
}

// 2. SUPPLIER CRUD -----------------------------------------------------------
async function testSupplierFlow(token) {
  console.log('\n--- SUPPLIER LOGO FLOW ---');
  // Create supplier
  const createRes = await httpRequest('POST', `${API_BASE}/admin/suppliers`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: {
      company_name: 'E2E Test Supplier ' + Date.now(),
      category: 'Test',
      contact_person: 'Tester',
      phone_china: '+8612345678901',
      email: `e2e-supplier-${Date.now()}@test.com`,
      factory_address: 'Test Factory, China',
      verification_level: 'Level 1 - Basic'
    }
  });
  if (createRes.status !== 200 && createRes.status !== 201) {
    logResult('Create supplier', 'FAIL', `${createRes.status} ${createRes.body}`);
    return;
  }
  const supplierData = JSON.parse(createRes.body);
  const supplierId = supplierData.id || supplierData.data?.id;
  logResult('Create supplier', 'PASS', `id=${supplierId}`);

  // Upload logo
  const { body, contentType } = buildMultipart({}, {
    field: 'logo',
    filename: 'logo.png',
    contentType: 'image/png',
    content: TINY_PNG
  });
  const uploadRes = await httpRequest('POST', `${API_BASE}/admin/suppliers/${supplierId}/logo`, {
    headers: {
      'Content-Type': contentType,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Length': body.length
    },
    body
  });
  if (uploadRes.status !== 200 && uploadRes.status !== 201) {
    logResult('Upload supplier logo', 'FAIL', `${uploadRes.status} ${uploadRes.body}`);
  } else {
    const udata = JSON.parse(uploadRes.body);
    const logoUrl = udata.logo_url || udata.url || udata.data?.logo_url;
    logResult('Upload supplier logo', 'PASS', `logo_url=${logoUrl ? logoUrl.slice(0, 60) : 'none'}`);

    // Fetch supplier and confirm logo persisted
    const getRes = await httpRequest('GET', `${API_BASE}/admin/suppliers/${supplierId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const gdata = JSON.parse(getRes.body);
    const gUrl = gdata.logo_url || gdata.data?.logo_url;
    if (gUrl) logResult('Logo persisted in DB', 'PASS', gUrl.slice(0, 60));
    else logResult('Logo persisted in DB', 'FAIL', 'no logo_url in supplier detail');

    // Download the logo and ensure content-type is image
    if (logoUrl) {
      const fullUrl = logoUrl.startsWith('http') ? logoUrl : `${API_BASE.replace('/api', '')}${logoUrl}`;
      try {
        const dl = await httpRequest('GET', fullUrl);
        const ct = dl.headers['content-type'] || '';
        if (dl.status === 200 && ct.includes('image')) {
          logResult('Logo serves with image content-type', 'PASS', `status=${dl.status}, ct=${ct}`);
        } else {
          logResult('Logo serves with image content-type', 'FAIL', `status=${dl.status}, ct=${ct}`);
        }
      } catch (e) {
        logResult('Logo serves with image content-type', 'FAIL', e.message);
      }
    }
  }

  // Try uploading non-image (should fail)
  const bad = buildMultipart({}, {
    field: 'logo',
    filename: 'notimage.txt',
    contentType: 'text/plain',
    content: Buffer.from('Hello, world!')
  });
  const badRes = await httpRequest('POST', `${API_BASE}/admin/suppliers/${supplierId}/logo`, {
    headers: {
      'Content-Type': bad.contentType,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Length': bad.body.length
    },
    body: bad.body
  });
  if (badRes.status >= 400) {
    logResult('Reject non-image upload', 'PASS', `status=${badRes.status}`);
  } else {
    logResult('Reject non-image upload', 'FAIL', `accepted ${badRes.status} ${badRes.body.slice(0, 200)}`);
  }

  // Delete logo
  const delRes = await httpRequest('DELETE', `${API_BASE}/admin/suppliers/${supplierId}/logo`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  if (delRes.status >= 200 && delRes.status < 300) {
    logResult('Delete supplier logo', 'PASS', `status=${delRes.status}`);
  } else {
    logResult('Delete supplier logo', 'FAIL', `${delRes.status} ${delRes.body}`);
  }

  // Cleanup supplier
  await httpRequest('DELETE', `${API_BASE}/admin/suppliers/${supplierId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
}

// 3. DRIVER CRUD -------------------------------------------------------------
async function testDriverFlow(token) {
  console.log('\n--- DRIVER PHOTO FLOW ---');
  const createRes = await httpRequest('POST', `${API_BASE}/admin/drivers`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: {
      full_name: 'E2E Driver ' + Date.now(),
      email: `e2e-driver-${Date.now()}@test.com`,
      phone: '+8612345678999',
      password: 'E2EP@ssw0rd!'
    }
  });
  if (createRes.status !== 200 && createRes.status !== 201) {
    logResult('Create driver', 'FAIL', `${createRes.status} ${createRes.body}`);
    return;
  }
  const driverData = JSON.parse(createRes.body);
  const driverId = driverData.id || driverData.data?.id;
  logResult('Create driver', 'PASS', `id=${driverId}`);

  // Upload photo
  const { body, contentType } = buildMultipart({}, {
    field: 'photo',
    filename: 'photo.jpg',
    contentType: 'image/jpeg',
    content: TINY_JPG
  });
  const uploadRes = await httpRequest('POST', `${API_BASE}/admin/drivers/${driverId}/photo`, {
    headers: {
      'Content-Type': contentType,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Length': body.length
    },
    body
  });
  if (uploadRes.status !== 200 && uploadRes.status !== 201) {
    logResult('Upload driver photo', 'FAIL', `${uploadRes.status} ${uploadRes.body}`);
  } else {
    const udata = JSON.parse(uploadRes.body);
    const photoUrl = udata.photo_url || udata.url || udata.data?.photo_url;
    logResult('Upload driver photo', 'PASS', `photo_url=${photoUrl ? photoUrl.slice(0, 60) : 'none'}`);

    // Get driver
    const getRes = await httpRequest('GET', `${API_BASE}/admin/drivers/${driverId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const gdata = JSON.parse(getRes.body);
    const gUrl = gdata.photo_url || gdata.data?.photo_url;
    if (gUrl) logResult('Photo persisted in DB', 'PASS', gUrl.slice(0, 60));
    else logResult('Photo persisted in DB', 'FAIL', 'no photo_url in driver detail');
  }

  // Delete photo
  const delRes = await httpRequest('DELETE', `${API_BASE}/admin/drivers/${driverId}/photo`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  if (delRes.status >= 200 && delRes.status < 300) {
    logResult('Delete driver photo', 'PASS', `status=${delRes.status}`);
  } else {
    logResult('Delete driver photo', 'FAIL', `${delRes.status} ${delRes.body}`);
  }

  // Cleanup driver
  await httpRequest('DELETE', `${API_BASE}/admin/drivers/${driverId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
}

// 4. Auth check ------------------------------------------------------------
async function testAuth(token) {
  console.log('\n--- AUTH CHECK ---');
  const res = await httpRequest('POST', `${API_BASE}/admin/suppliers/1/logo`, {
    headers: { 'Content-Type': 'application/json' }
  });
  if (res.status === 401 || res.status === 403) {
    logResult('Logo endpoint requires auth', 'PASS', `status=${res.status}`);
  } else {
    logResult('Logo endpoint requires auth', 'FAIL', `status=${res.status}`);
  }

  // Buyer should be forbidden
  let buyerToken;
  try {
    buyerToken = await login('buyer');
  } catch (e) {
    logResult('Login buyer (for role check)', 'WARN', e.message);
    return;
  }
  const { body, contentType } = buildMultipart({}, {
    field: 'logo', filename: 'logo.png', contentType: 'image/png', content: TINY_PNG
  });
  const fb = await httpRequest('POST', `${API_BASE}/admin/suppliers/1/logo`, {
    headers: {
      'Content-Type': contentType,
      'Authorization': `Bearer ${buyerToken}`,
      'Content-Length': body.length
    },
    body
  });
  if (fb.status === 401 || fb.status === 403) {
    logResult('Buyer cannot upload supplier logo', 'PASS', `status=${fb.status}`);
  } else {
    logResult('Buyer cannot upload supplier logo', 'FAIL', `status=${fb.status} ${fb.body.slice(0, 200)}`);
  }
}

// MAIN ----------------------------------------------------------------------
(async () => {
  console.log('=================================================');
  console.log('IMAGE CRUD E2E TEST');
  console.log('=================================================');

  // Frontend smoke
  try {
    const front = await httpRequest('GET', FRONTEND_BASE);
    logResult('Frontend reachable', front.status === 200 ? 'PASS' : 'FAIL', `status=${front.status}`);
  } catch (e) {
    logResult('Frontend reachable', 'FAIL', e.message);
  }

  // Backend health
  try {
    const api = await httpRequest('GET', `${API_BASE}/health`);
    logResult('Backend reachable', api.status < 500 ? 'PASS' : 'WARN', `status=${api.status}`);
  } catch (e) {
    logResult('Backend reachable', 'WARN', e.message);
  }

  let token;
  try {
    token = await loginAdmin();
    logResult('Admin login', 'PASS');
  } catch (e) {
    logResult('Admin login', 'FAIL', e.message);
    process.exit(1);
  }

  await testSupplierFlow(token);
  await testDriverFlow(token);
  await testAuth(token);

  console.log('\n=================================================');
  console.log(`SUMMARY: ${STATS.passed} passed, ${STATS.failed} failed, ${STATS.warnings} warnings`);
  console.log('=================================================');
  process.exit(STATS.failed > 0 ? 1 : 0);
})();
