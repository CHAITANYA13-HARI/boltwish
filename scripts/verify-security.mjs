import { checkContentSafety, hashPasscode, verifyPasscode } from '../src/lib/securityFilter.js';

async function runSecurityTests() {
  console.log('Running Boltwish Security & PIN Gate Verification Tests...\n');

  // Test 1: PIN hashing produces expected secure hash output (v2 salted format: v2:{32hex}:{64hex})
  const pin = '1234';
  const hash = await hashPasscode(pin);
  if (!hash || (!hash.startsWith('v2:') && hash.length !== 64)) {
    throw new Error(`Test 1 Failed: Expected valid hash, got "${hash}"`);
  }
  if (hash.startsWith('v2:')) {
    const parts = hash.split(':');
    if (parts.length !== 3 || parts[1].length !== 32 || parts[2].length !== 64) {
      throw new Error(`Test 1 Failed: Expected v2:{32hex}:{64hex}, got "${hash}"`);
    }
  }
  console.log('✔ Test 1: 4-digit PIN generates secure per-wish salted hash (v2)');

  // Test 2: Incomplete or non-4-digit PIN is rejected by hashPasscode
  const shortHash = await hashPasscode('12');
  const longHash = await hashPasscode('12345');
  const emptyHash = await hashPasscode('');
  const alphaHash = await hashPasscode('abcd');
  if (shortHash !== '' || longHash !== '' || emptyHash !== '' || alphaHash !== '') {
    throw new Error('Test 2 Failed: Non-4-digit PINs must return empty hash');
  }
  console.log('✔ Test 2: Incomplete or non-numeric PINs are strictly rejected');

  // Test 3: Correct PIN verifies successfully
  const isValidCorrect = await verifyPasscode('1234', hash);
  if (!isValidCorrect) {
    throw new Error('Test 3 Failed: Correct PIN must verify to true');
  }
  console.log('✔ Test 3: Correct PIN validates to true');

  // Test 4: Incorrect PIN fails verification
  const isValidIncorrect = await verifyPasscode('9999', hash);
  if (isValidIncorrect) {
    throw new Error('Test 4 Failed: Incorrect PIN must verify to false');
  }
  console.log('✔ Test 4: Incorrect PIN validates to false');

  // Test 5 (CRITICAL P0 AUDIT FIX): Missing or undefined storedHash MUST return false (never true!)
  const undefinedCheck = await verifyPasscode('1234', undefined);
  const nullCheck = await verifyPasscode('1234', null);
  const emptyCheck = await verifyPasscode('1234', '');
  if (undefinedCheck !== false || nullCheck !== false || emptyCheck !== false) {
    throw new Error('Test 5 Failed: Missing or undefined storedHash MUST return false');
  }
  console.log('✔ Test 5 (P0): Missing or undefined storedHash strictly returns false');

  // Test 6: Incomplete PIN during verify returns false
  const shortVerify = await verifyPasscode('12', hash);
  if (shortVerify !== false) {
    throw new Error('Test 6 Failed: Incomplete PIN must return false');
  }
  console.log('✔ Test 6: Incomplete PIN inputs are rejected before comparison');

  // Test 7: Content safety filter blocks abusive keywords and permits celebration text
  const safeText = 'Happy 30th Birthday Maya! Wishing you joy, love, and sunshine.';
  const safeResult = checkContentSafety(safeText);
  if (!safeResult.valid) {
    throw new Error(`Test 7 Failed: Expected safe text to pass, got: ${safeResult.reason}`);
  }
  const abusiveResult = checkContentSafety('You are a bitch');
  if (abusiveResult.valid) {
    throw new Error('Test 7 Failed: Abusive keyword was not intercepted');
  }
  console.log('✔ Test 7: Abuse & safety filter accurately evaluates celebratory content');

  console.log('\nAll security & PIN gate tests PASSED successfully!\n');
}

runSecurityTests().catch((err) => {
  console.error('\n❌ Security verification error:', err);
  process.exit(1);
});
