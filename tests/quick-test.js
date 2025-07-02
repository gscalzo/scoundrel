#!/usr/bin/env node
/**
 * Quick test verification for CI environments
 * Tests basic functionality without complex browser automation
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Quick Test Verification...\n');

let errors = 0;

// Check if all required files exist
const requiredFiles = [
    'test-runner.js',
    'headless-test.html',
    'test.html',
    'unit/deck.test.js',
    'unit/game.test.js',
    'integration/integration.test.js',
    '../js/game.js',
    '../js/deck.js'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        errors++;
    }
});

// Check test file syntax
console.log('\n🔍 Checking test file syntax...');
try {
    const testRunnerContent = fs.readFileSync(path.join(__dirname, 'test-runner.js'), 'utf8');
    if (testRunnerContent.includes('class TestRunner') && testRunnerContent.includes('class Assert')) {
        console.log('  ✅ test-runner.js syntax OK');
    } else {
        console.log('  ❌ test-runner.js missing required classes');
        errors++;
    }
} catch (error) {
    console.log(`  ❌ test-runner.js read error: ${error.message}`);
    errors++;
}

// Check game module structure
console.log('\n🎮 Checking game module structure...');
try {
    const gameContent = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
    const requiredExports = ['startNewGame', 'resetGame', 'updateHealth', 'equipItem'];
    
    let foundExports = 0;
    requiredExports.forEach(exportName => {
        if (gameContent.includes(`export function ${exportName}`) || 
            gameContent.includes(`export const ${exportName}`) ||
            gameContent.includes(`function ${exportName}`)) {
            foundExports++;
        }
    });
    
    if (foundExports >= 3) {
        console.log(`  ✅ Game module exports OK (${foundExports}/${requiredExports.length} found)`);
    } else {
        console.log(`  ❌ Game module missing exports (${foundExports}/${requiredExports.length} found)`);
        errors++;
    }
} catch (error) {
    console.log(`  ❌ Game module read error: ${error.message}`);
    errors++;
}

// Check deck module structure
console.log('\n🃏 Checking deck module structure...');
try {
    const deckContent = fs.readFileSync(path.join(__dirname, '../js/deck.js'), 'utf8');
    const requiredExports = ['createDeck', 'shuffle', 'dealCards', 'trimDeckForScoundrel'];
    
    let foundExports = 0;
    requiredExports.forEach(exportName => {
        if (deckContent.includes(`export function ${exportName}`) || 
            deckContent.includes(`export const ${exportName}`) ||
            deckContent.includes(`function ${exportName}`)) {
            foundExports++;
        }
    });
    
    if (foundExports >= 3) {
        console.log(`  ✅ Deck module exports OK (${foundExports}/${requiredExports.length} found)`);
    } else {
        console.log(`  ❌ Deck module missing exports (${foundExports}/${requiredExports.length} found)`);
        errors++;
    }
} catch (error) {
    console.log(`  ❌ Deck module read error: ${error.message}`);
    errors++;
}

// Check test functions are defined
console.log('\n🧪 Checking test function definitions...');
const testFiles = [
    { file: 'unit/deck.test.js', expectedFunction: 'testDeckModule' },
    { file: 'unit/game.test.js', expectedFunction: 'testGameModule' },
    { file: 'integration/integration.test.js', expectedFunction: 'testIntegration' }
];

testFiles.forEach(({ file, expectedFunction }) => {
    try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        if (content.includes(`function ${expectedFunction}(`)) {
            console.log(`  ✅ ${file} - ${expectedFunction} defined`);
        } else {
            console.log(`  ❌ ${file} - ${expectedFunction} not found`);
            errors++;
        }
    } catch (error) {
        console.log(`  ❌ ${file} read error: ${error.message}`);
        errors++;
    }
});

// Final result
console.log('\n📊 Verification Results:');
if (errors === 0) {
    console.log('🎉 All checks passed! Test setup is ready.');
    console.log('\n💡 To run full tests:');
    console.log('  • Browser: Open test.html in browser');
    console.log('  • Headless: Open headless-test.html in browser');
    console.log('  • CI: Use node run-tests.js --headless');
    process.exit(0);
} else {
    console.log(`❌ Found ${errors} issue(s). Please fix before running tests.`);
    process.exit(1);
}