import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { login, changePassword } from '../controllers/authController.js';
import { generateTempPassword } from '../controllers/adminController.js';

describe('Admin Temporary Password Flow & Authentication', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'testsecretkey12345';
    process.env.TEMP_PASSWORD_EXPIRY_HOURS = '24';
  });

  it('Admin endpoint generates valid 12-char temp password and sets 24h expiry', async () => {
    const mockUserId = '11111111-1111-1111-1111-111111111111';
    let updateQueryCalled = false;

    pool.query = async (queryText, params) => {
      const q = String(queryText || '').toLowerCase();
      if (q.includes('users') && q.includes('select')) {
        return { rows: [{ id: mockUserId, email: 'buyer@example.com', full_name: 'John Buyer' }] };
      }
      if (q.includes('users') && q.includes('update')) {
        updateQueryCalled = true;
        return { rows: [] };
      }
      return { rows: [] };
    };

    const req = {
      params: { userId: mockUserId },
      userId: 'admin-id-123'
    };

    let jsonResult = null;
    let errorCaught = null;

    const res = {
      json: (data) => { jsonResult = data; }
    };
    const next = (err) => { errorCaught = err; };

    await generateTempPassword(req, res, next);

    if (errorCaught) throw errorCaught;

    assert.ok(jsonResult, 'jsonResult should be defined');
    assert.equal(jsonResult.message, 'Temporary password generated successfully');
    assert.ok(jsonResult.tempPassword);
    assert.equal(jsonResult.tempPassword.length, 12);
    assert.ok(updateQueryCalled, 'UPDATE query should have been executed');
  });

  it('Buyer login with valid temporary password succeeds and flags mustChangePassword: true', async () => {
    const tempPasswordPlaintext = 'a1b2c3d4e5f6';
    const tempHash = await bcrypt.hash(tempPasswordPlaintext, 10);
    const futureExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const mockUser = {
      id: 'buyer-uuid-999',
      full_name: 'Buyer User',
      email: 'buyer@example.com',
      role: 'buyer',
      password_hash: '$2b$10$UnmatchingPermanentHashValueHere',
      temp_password_hash: tempHash,
      temp_password_expires_at: futureExpiry
    };

    pool.query = async () => ({ rows: [mockUser] });

    const req = {
      body: {
        email: 'buyer@example.com',
        password: tempPasswordPlaintext
      }
    };

    let responsePayload = null;
    let errorCaught = null;

    const res = {
      cookie: () => {},
      json: (data) => { responsePayload = data; }
    };
    const next = (err) => { errorCaught = err; };

    await login(req, res, next);

    if (errorCaught) throw errorCaught;

    assert.ok(responsePayload, 'responsePayload should be defined');
    assert.equal(responsePayload.user.mustChangePassword, true);
    assert.ok(responsePayload.token);
  });

  it('Buyer changePassword updates permanent hash and clears temp fields', async () => {
    const mockUserId = 'buyer-uuid-999';
    const newPassword = 'newSecretPassword123';
    let updateQueryExecuted = false;

    pool.query = async (queryText) => {
      const q = String(queryText || '').toLowerCase();
      if (q.includes('users') && q.includes('update')) {
        updateQueryExecuted = true;
        return { rows: [] };
      }
      if (q.includes('users') && q.includes('select')) {
        return { rows: [{ id: mockUserId, full_name: 'Buyer User', email: 'buyer@example.com', role: 'buyer' }] };
      }
      return { rows: [] };
    };

    const req = {
      userId: mockUserId,
      body: { newPassword }
    };

    let resData = null;
    let errorCaught = null;

    const res = {
      cookie: () => {},
      json: (data) => { resData = data; }
    };
    const next = (err) => { errorCaught = err; };

    await changePassword(req, res, next);

    if (errorCaught) throw errorCaught;

    assert.ok(updateQueryExecuted, 'UPDATE query should be executed');
    assert.ok(resData, 'resData should be defined');
    assert.equal(resData.user.mustChangePassword, false);
  });
});
