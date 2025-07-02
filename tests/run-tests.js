#!/usr/bin/env node
/**
 * Command line test runner for Scoundrel Card Game
 * Can be used in CI/CD pipelines for automated testing
 * 
 * Usage:
 *   node run-tests.js [--headless] [--port=3000]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

// Configuration
const DEFAULT_PORT = 3000;
const TEST_TIMEOUT = 30000; // 30 seconds

// Parse command line arguments
const args = process.argv.slice(2);
const headless = args.includes('--headless');
const portArg = args.find(arg => arg.startsWith('--port='));
const port = portArg ? parseInt(portArg.split('=')[1]) : DEFAULT_PORT;

console.log('🧪 Scoundrel Card Game - Automated Test Runner');
console.log('===============================================\n');

/**
 * Simple HTTP server to serve the test files
 */
function createTestServer() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '..', req.url);
    
    // Default to test.html for root requests
    if (req.url === '/' || req.url === '/tests' || req.url === '/tests/') {
      filePath = path.join(__dirname, 'test.html');
    }
    
    // Ensure we don't serve files outside the project directory
    const projectRoot = path.join(__dirname, '..');
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(projectRoot)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(500);
          res.end('Internal server error');
        }
        return;
      }
      
      // Set appropriate content type
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };
      
      const contentType = contentTypes[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
  
  return server;
}

/**
 * Run tests using a headless browser (requires Puppeteer)
 */
async function runHeadlessTests() {
  try {
    // Try to require Puppeteer
    const puppeteer = require('puppeteer');
    
    console.log('🚀 Starting headless browser tests...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages from the page
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('✅') || text.includes('❌') || text.includes('📊')) {
        console.log(text);
      }
    });
    
    // Navigate to test page
    await page.goto(`http://localhost:${port}/tests/test.html`);
    
    // Wait for the page to load and click run tests
    await page.waitForSelector('#run-all-tests');
    await page.click('#run-all-tests');
    
    // Wait for tests to complete (look for test summary)
    await page.waitForFunction(() => {
      const status = document.getElementById('test-status');
      return status && (status.textContent.includes('All tests passed') || status.textContent.includes('failed'));
    }, { timeout: TEST_TIMEOUT });
    
    // Get final test results
    const testResults = await page.evaluate(() => {
      const status = document.getElementById('test-status');
      const output = document.getElementById('test-output');
      return {
        status: status ? status.textContent : 'Unknown',
        passed: status && status.textContent.includes('All tests passed'),
        output: output ? output.textContent : 'No output'
      };
    });
    
    await browser.close();
    
    console.log('\n📊 Test Results:');
    console.log(testResults.status);
    
    if (testResults.passed) {
      console.log('\n🎉 All tests passed successfully!');
      return true;
    } else {
      console.log('\n💥 Some tests failed!');
      console.log('\nTest output snippet:');
      console.log(testResults.output.split('\n').slice(-10).join('\n'));
      return false;
    }
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
      console.log('❌ Puppeteer not found.');
      console.log('💡 To install Puppeteer for headless testing:');
      console.log('   echo \'{"name": "test-deps", "version": "1.0.0"}\' > package.json');
      console.log('   npm install puppeteer');
      console.log('');
      console.log('💡 Falling back to manual test instructions...');
      return runManualTests();
    } else {
      console.error('❌ Error running headless tests:', error.message);
      return false;
    }
  }
}

/**
 * Provide instructions for manual testing
 */
function runManualTests() {
  console.log('\n📖 Manual Testing Instructions:');
  console.log('===============================');
  console.log(`1. Open your browser and navigate to: http://localhost:${port}/tests/test.html`);
  console.log('2. Click "🚀 Run All Tests" button');
  console.log('3. Wait for all tests to complete');
  console.log('4. Verify that all tests pass (green checkmarks)');
  console.log('5. If any tests fail (red X), review the error messages');
  console.log('\n⚠️  All tests must pass before deployment!');
  
  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    console.log('\nPress any key to continue once testing is complete...');
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      resolve(true);
    });
  });
}

/**
 * Main execution function
 */
async function main() {
  // Check if test files exist
  const testFiles = [
    'test.html',
    'test-runner.js',
    'unit/deck.test.js',
    'unit/game.test.js',
    'integration/integration.test.js'
  ];
  
  for (const file of testFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Test file not found: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ All test files found');
  
  // Start test server
  const server = createTestServer();
  
  return new Promise((resolve) => {
    server.listen(port, async () => {
      console.log(`🌐 Test server running at http://localhost:${port}`);
      console.log(`📁 Serving tests from: ${__dirname}`);
      
      let success = false;
      
      try {
        if (headless) {
          success = await runHeadlessTests();
        } else {
          success = await runManualTests();
        }
      } catch (error) {
        console.error('❌ Error during testing:', error.message);
      } finally {
        server.close();
        console.log('\n🔚 Test server stopped');
        
        if (success) {
          console.log('✅ Testing completed successfully');
          process.exit(0);
        } else {
          console.log('❌ Testing failed or incomplete');
          process.exit(1);
        }
      }
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Try a different port with --port=<number>`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
  });
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test runner interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Test runner terminated');
  process.exit(1);
});

// Run the test runner
main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});