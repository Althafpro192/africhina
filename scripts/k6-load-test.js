// k6 Performance Test Script
// For AfriChina Bridge API
// Run with: k6 run scripts/k6-load-test.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const requestCreationDuration = new Trend('request_creation_duration');
const requestListDuration = new Trend('request_list_duration');

// Test configuration
export const options = {
  scenarios: {
    // Warmup
    warmup: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
      ],
      preAllocatedVUs: 5,
    },
    // Load test
    load: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      preAllocatedVUs: 20,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
    'login_duration': ['p(95)<1000'],
    'request_creation_duration': ['p(95)<2000'],
    'request_list_duration': ['p(95)<500'],
    errors: ['rate<0.1'],
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const TEST_USERS = [
  { email: 'buyer1@africhina.com', password: 'password123' },
  { email: 'buyer2@africhina.com', password: 'password123' },
  { email: 'buyer3@africhina.com', password: 'password123' },
  { email: 'buyer4@africhina.com', password: 'password123' },
  { email: 'buyer5@africhina.com', password: 'password123' },
];

function getRandomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

function login(email, password) {
  const loginStart = Date.now();
  
  const res = http.post(`${BASE_URL}/api/auth/login`, 
    JSON.stringify({ email: email, password: password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  loginDuration.add(Date.now() - loginStart);
  
  const success = check(res, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => r.json('token') !== undefined,
    'login response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!success);
  
  if (success) {
    return { token: res.json('token'), user: res.json('user') };
  }
  return null;
}

function authGet(token, url) {
  const res = http.get(`${BASE_URL}${url}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const success = check(res, {
    'GET status 200': (r) => r.status === 200,
  });
  
  errorRate.add(!success);
  return res;
}

function authPost(token, url, body) {
  const res = http.post(`${BASE_URL}${url}`, 
    JSON.stringify(body),
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const success = check(res, {
    'POST status 200/201': (r) => r.status === 200 || r.status === 201,
  });
  
  errorRate.add(!success);
  return res;
}

export default function () {
  const user = getRandomUser();
  
  group('Authentication', () => {
    const loginResult = login(user.email, user.password);
    
    if (!loginResult) {
      console.log(`Login failed for ${user.email}`);
      errorRate.add(1);
      return;
    }
    
    const { token, user: userData } = loginResult;
    
    check(token, {
      'token received': (t) => t !== undefined,
    });
    
    const profileRes = authGet(token, '/api/auth/me');
    check(profileRes, {
      'profile fetched': (r) => r.status === 200,
    });
  });
  
  sleep(1);
  
  group('RFQ Operations', () => {
    const loginResult = login(user.email, user.password);
    if (!loginResult) return;
    
    const { token } = loginResult;
    
    const listStart = Date.now();
    const listRes = authGet(token, '/api/requests');
    requestListDuration.add(Date.now() - listStart);
    
    check(listRes, {
      'request list loaded': (r) => r.status === 200,
    });
    
    const createStart = Date.now();
    const rfqData = {
      product_name: `Test Product ${Date.now()}`,
      category: 'electronics',
      specifications: 'Test specifications for performance testing',
      quantity: Math.floor(Math.random() * 1000) + 100,
      budget_range: '5k-20k',
      shipping_terms: 'FOB',
      payment_terms: 'TT',
    };
    
    const createRes = authPost(token, '/api/requests', rfqData);
    requestCreationDuration.add(Date.now() - createStart);
    
    check(createRes, {
      'RFQ created': (r) => r.status === 201,
    });
  });
  
  sleep(1);
  
  group('Admin Operations', () => {
    const adminLogin = login('admin@africhina.com', 'password123');
    if (!adminLogin) return;
    
    const { token } = adminLogin;
    
    const statsRes = authGet(token, '/api/admin/statistics');
    check(statsRes, {
      'admin stats loaded': (r) => r.status === 200,
    });
    
    const adminRequestsRes = authGet(token, '/api/admin/requests');
    check(adminRequestsRes, {
      'admin requests loaded': (r) => r.status === 200,
    });
    
    const buyersRes = authGet(token, '/api/admin/users');
    check(buyersRes, {
      'buyer list loaded': (r) => r.status === 200,
    });
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data) {
  let output = '';
  
  output += '=== AfriChina Bridge Performance Test Summary ===\n\n';
  output += `HTTP Metrics:\n`;
  output += `  Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  output += `  Request Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  output += `  Request Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  output += `  Request Duration (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  
  if (data.metrics.login_duration) {
    output += `\nLogin Duration (avg): ${data.metrics.login_duration.values.avg.toFixed(2)}ms\n`;
    output += `Login Duration (p95): ${data.metrics.login_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  if (data.metrics.request_creation_duration) {
    output += `\nRFQ Creation (avg): ${data.metrics.request_creation_duration.values.avg.toFixed(2)}ms\n`;
    output += `RFQ Creation (p95): ${data.metrics.request_creation_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  if (data.metrics.request_list_duration) {
    output += `\nRequest List (avg): ${data.metrics.request_list_duration.values.avg.toFixed(2)}ms\n`;
    output += `Request List (p95): ${data.metrics.request_list_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  
  output += `\nError Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n`;
  output += `Max VUs: ${data.metrics.vus_max.values.value}\n`;
  
  return output;
}
