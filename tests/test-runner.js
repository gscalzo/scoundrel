/**
 * Simple Test Runner for Scoundrel Card Game
 * A lightweight testing framework for vanilla JavaScript
 */

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
  }

  /**
   * Add a test case
   * @param {string} description - Test description
   * @param {Function} testFn - Test function
   */
  test(description, testFn) {
    this.tests.push({ description, testFn, type: 'test' });
  }

  /**
   * Add a test suite
   * @param {string} description - Suite description
   * @param {Function} suiteFn - Suite function containing tests
   */
  describe(description, suiteFn) {
    this.tests.push({ description, testFn: suiteFn, type: 'suite' });
  }

  /**
   * Run all tests
   */
  async run() {
    console.log('🧪 Starting Test Runner...\n');
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;

    for (const test of this.tests) {
      if (test.type === 'suite') {
        console.log(`📂 ${test.description}`);
        await this.runSuite(test.testFn);
      } else {
        await this.runTest(test.description, test.testFn);
      }
    }

    this.printSummary();
  }

  /**
   * Run a test suite
   * @param {Function} suiteFn - Suite function
   */
  async runSuite(suiteFn) {
    const originalTests = this.tests.length;
    suiteFn();
    const newTests = this.tests.slice(originalTests);
    
    for (const test of newTests) {
      if (test.type === 'test') {
        await this.runTest(`  ${test.description}`, test.testFn);
      }
    }
    
    // Remove the tests we just ran from the main tests array
    this.tests = this.tests.slice(0, originalTests);
  }

  /**
   * Run a single test
   * @param {string} description - Test description
   * @param {Function} testFn - Test function
   */
  async runTest(description, testFn) {
    try {
      await testFn();
      console.log(`✅ ${description}`);
      this.passed++;
    } catch (error) {
      console.error(`❌ ${description}`);
      console.error(`   Error: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
      }
      this.failed++;
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    const total = this.passed + this.failed + this.skipped;
    console.log('\n📊 Test Summary:');
    console.log(`   Total: ${total}`);
    console.log(`   ✅ Passed: ${this.passed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   ⏭️  Skipped: ${this.skipped}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n💥 ${this.failed} test(s) failed!`);
    }
  }
}

/**
 * Assertion utilities
 */
class Assert {
  static assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
    }
  }

  static assertTrue(condition, message = '') {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}\n  Expected: true\n  Actual: ${condition}`);
    }
  }

  static assertFalse(condition, message = '') {
    if (condition) {
      throw new Error(`Assertion failed: ${message}\n  Expected: false\n  Actual: ${condition}`);
    }
  }

  static assertNotNull(value, message = '') {
    if (value === null || value === undefined) {
      throw new Error(`Assertion failed: ${message}\n  Expected: not null/undefined\n  Actual: ${value}`);
    }
  }

  static assertThrows(fn, expectedError = null, message = '') {
    try {
      fn();
      throw new Error(`Assertion failed: ${message}\n  Expected function to throw an error`);
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(`Assertion failed: ${message}\n  Expected error containing: ${expectedError}\n  Actual error: ${error.message}`);
      }
    }
  }

  static assertArrayEqual(actual, expected, message = '') {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      throw new Error(`Assertion failed: ${message}\n  Both values must be arrays`);
    }
    if (actual.length !== expected.length) {
      throw new Error(`Assertion failed: ${message}\n  Array lengths differ\n  Expected: ${expected.length}\n  Actual: ${actual.length}`);
    }
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) {
        throw new Error(`Assertion failed: ${message}\n  Arrays differ at index ${i}\n  Expected: ${expected[i]}\n  Actual: ${actual[i]}`);
      }
    }
  }

  static assertObjectEqual(actual, expected, message = '') {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    
    this.assertArrayEqual(actualKeys, expectedKeys, `${message} - Object keys differ`);
    
    for (const key of actualKeys) {
      this.assertEqual(actual[key], expected[key], `${message} - Property '${key}' differs`);
    }
  }
}

// Create global instances
const testRunner = new TestRunner();
const assert = Assert;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, Assert };
}