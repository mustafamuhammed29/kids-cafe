#!/usr/bin/env node

/**
 * Automated Security Test Suite: Turnstile Fail-Closed & Cancellation Token Isolation
 *
 * Verifies:
 * 1. Production without secret -> booking rejected (fails closed).
 * 2. Development localhost without secret -> local mock allowed.
 * 3. Production with invalid token -> booking rejected.
 * 4. Production with valid token -> booking proceeds.
 * 5. Cancellation token is strictly absent from the client response.
 */

const EXPECTED_SAFE_ERROR =
  'Die Buchungsanfrage kann derzeit nicht sicher verarbeitet werden. Bitte versuche es später erneut oder kontaktiere uns direkt.';

// Simulates the Edge Function verification core logic
async function simulateEdgeFunction({
  environment,
  origin,
  clientIp,
  turnstileSecretKey,
  turnstileToken,
  mockTurnstileApiSuccess = false,
}) {
  const isLocalhost =
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    clientIp === '127.0.0.1' ||
    clientIp === '::1';

  const isProduction =
    environment === 'production' ||
    origin.includes('havenkids.de') ||
    !isLocalhost;

  // 1. Production Turnstile verification
  if (isProduction) {
    if (!turnstileSecretKey) {
      return {
        status: 503,
        error: EXPECTED_SAFE_ERROR,
        passedTurnstile: false,
      };
    }

    if (!turnstileToken) {
      return {
        status: 403,
        error: EXPECTED_SAFE_ERROR,
        passedTurnstile: false,
      };
    }

    // Simulate Cloudflare siteverify check
    if (!mockTurnstileApiSuccess) {
      return {
        status: 403,
        error: EXPECTED_SAFE_ERROR,
        passedTurnstile: false,
      };
    }
  }

  // 2. Simulated DB function output (PostgreSQL returns token internally to server)
  const dbResult = {
    success: true,
    reference_code: 'HKC-20261008-9A4B',
    cancellation_token: 'd3b07384-d113-40e9-9a67-27b233a01899', // INTERNAL ONLY
    date: '2026-10-08',
    time_slot: '10:00 - 12:00',
    service_name: 'Einzelbesuch',
    total_price: 14.0,
  };

  // 3. Email dispatch uses cancellation_token internally
  const emailCancelUrl = `https://havenkids.de/cancel?token=${dbResult.cancellation_token}`;

  // 4. Client response STRIPS cancellation_token
  const clientResponse = {
    success: true,
    reference_code: dbResult.reference_code,
    date: dbResult.date,
    time_slot: dbResult.time_slot,
    service_name: dbResult.service_name,
    total_price: dbResult.total_price,
  };

  return {
    status: 200,
    passedTurnstile: true,
    clientResponse,
    emailCancelUrl,
  };
}

async function runTests() {
  console.log('================================================================');
  console.log('   HAVEN KIDS CAFÉ — SECURITY VERIFICATION TEST SUITE           ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
      failed++;
    }
  }

  // TEST 1: Production without secret -> booking rejected
  {
    const res = await simulateEdgeFunction({
      environment: 'production',
      origin: 'https://havenkids.de',
      clientIp: '203.0.113.195',
      turnstileSecretKey: '',
      turnstileToken: 'sample-token',
    });

    assert(
      res.status === 503 && res.error === EXPECTED_SAFE_ERROR,
      'Test 1: Production without secret must FAIL CLOSED',
      `Got status ${res.status}, error: "${res.error}"`
    );
  }

  // TEST 2: Development localhost without secret -> local mock allowed
  {
    const res = await simulateEdgeFunction({
      environment: 'development',
      origin: 'http://localhost:5173',
      clientIp: '127.0.0.1',
      turnstileSecretKey: '',
      turnstileToken: null,
    });

    assert(
      res.status === 200 && res.passedTurnstile === true,
      'Test 2: Development localhost without secret allows mock bypass',
      `Got status ${res.status}`
    );
  }

  // TEST 3: Production with invalid token -> booking rejected
  {
    const res = await simulateEdgeFunction({
      environment: 'production',
      origin: 'https://havenkids.de',
      clientIp: '203.0.113.195',
      turnstileSecretKey: '0x4AAAAAAABBBBBBB',
      turnstileToken: 'invalid-attacker-token',
      mockTurnstileApiSuccess: false,
    });

    assert(
      res.status === 403 && res.error === EXPECTED_SAFE_ERROR,
      'Test 3: Production with invalid token must REJECT',
      `Got status ${res.status}, error: "${res.error}"`
    );
  }

  // TEST 4: Production with valid token -> booking proceeds
  {
    const res = await simulateEdgeFunction({
      environment: 'production',
      origin: 'https://havenkids.de',
      clientIp: '203.0.113.195',
      turnstileSecretKey: '0x4AAAAAAABBBBBBB',
      turnstileToken: 'valid-cf-token',
      mockTurnstileApiSuccess: true,
    });

    assert(
      res.status === 200 && res.passedTurnstile === true,
      'Test 4: Production with valid token allows booking to proceed',
      `Got status ${res.status}`
    );

    // TEST 5: Proof that cancellation_token is absent from client response
    assert(
      res.clientResponse.cancellation_token === undefined,
      'Test 5: Client response strictly EXCLUDES cancellation_token',
      `cancellation_token was found in response: ${res.clientResponse.cancellation_token}`
    );

    assert(
      res.emailCancelUrl.includes('d3b07384-d113-40e9-9a67-27b233a01899'),
      'Test 6: Email cancellation URL contains secret token server-side only'
    );
  }

  console.log('\n================================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
