#!/usr/bin/env node
/**
 * Quick verification script to check if the testing setup is working
 * This can be run to verify CI/CD configuration without full test execution
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Scoundrel Card Game Testing Setup...\n');

// Check if we're in the right directory
const expectedFiles = [
    '../index.html',
    '../js/game.js',
    '../js/deck.js',
    'test.html',
    'test-runner.js',
    'run-tests.js'
];

let allFilesPresent = true;

console.log('📁 Checking required files...');
expectedFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        allFilesPresent = false;
    }
});

if (!allFilesPresent) {
    console.log('\n❌ Some required files are missing. Please check the project structure.');
    process.exit(1);
}

console.log('\n🧪 Checking test files...');
const testDirs = ['unit', 'integration'];
testDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.test.js'));
        console.log(`  ✅ ${dir}/ - ${files.length} test files`);
        files.forEach(file => {
            console.log(`    • ${file}`);
        });
    } else {
        console.log(`  ❌ ${dir}/ - MISSING`);
        allFilesPresent = false;
    }
});

console.log('\n🔧 Checking GitHub Actions workflows...');
const workflowPath = path.join(__dirname, '..', '.github', 'workflows');
if (fs.existsSync(workflowPath)) {
    const workflows = fs.readdirSync(workflowPath).filter(f => f.endsWith('.yml'));
    workflows.forEach(workflow => {
        console.log(`  ✅ .github/workflows/${workflow}`);
    });
} else {
    console.log('  ❌ .github/workflows/ - MISSING');
    allFilesPresent = false;
}

console.log('\n📋 Checking documentation...');
const docs = [
    '../README.md',
    'README.md',
    '../.github/branch-protection.md',
    '../TESTING_SETUP.md'
];

docs.forEach(doc => {
    const docPath = path.join(__dirname, doc);
    if (fs.existsSync(docPath)) {
        console.log(`  ✅ ${doc}`);
    } else {
        console.log(`  ❌ ${doc} - MISSING`);
    }
});

console.log('\n🎯 Testing basic Node.js functionality...');
try {
    // Test that we can run basic Node.js operations
    const testObj = { test: true };
    const testJson = JSON.stringify(testObj);
    const parsed = JSON.parse(testJson);
    
    if (parsed.test === true) {
        console.log('  ✅ JSON operations working');
    } else {
        console.log('  ❌ JSON operations failed');
        process.exit(1);
    }
    
    // Test file system operations
    const tempFile = path.join(__dirname, 'temp-test.json');
    fs.writeFileSync(tempFile, testJson);
    const readBack = fs.readFileSync(tempFile, 'utf8');
    fs.unlinkSync(tempFile);
    
    if (readBack === testJson) {
        console.log('  ✅ File system operations working');
    } else {
        console.log('  ❌ File system operations failed');
        process.exit(1);
    }
    
} catch (error) {
    console.log(`  ❌ Node.js basic operations failed: ${error.message}`);
    process.exit(1);
}

console.log('\n🚀 Testing package.json creation (CI/CD simulation)...');
try {
    // Simulate what the CI/CD pipeline does
    const packageJson = '{"name": "scoundrel-tests", "version": "1.0.0", "description": "Test dependencies"}';
    const tempPackage = path.join(__dirname, '..', 'temp-package.json');
    
    fs.writeFileSync(tempPackage, packageJson);
    const readPackage = fs.readFileSync(tempPackage, 'utf8');
    fs.unlinkSync(tempPackage);
    
    const parsed = JSON.parse(readPackage);
    if (parsed.name === 'scoundrel-tests') {
        console.log('  ✅ Package.json creation simulation successful');
    } else {
        console.log('  ❌ Package.json creation simulation failed');
        process.exit(1);
    }
    
} catch (error) {
    console.log(`  ❌ Package.json simulation failed: ${error.message}`);
    process.exit(1);
}

if (allFilesPresent) {
    console.log('\n🎉 Setup Verification Complete!');
    console.log('');
    console.log('✅ All required files are present');
    console.log('✅ Test structure is correct');
    console.log('✅ GitHub Actions workflows are configured');
    console.log('✅ Node.js operations are working');
    console.log('✅ CI/CD package management simulation successful');
    console.log('');
    console.log('🚀 Your testing setup is ready!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Set up GitHub branch protection rules (see .github/branch-protection.md)');
    console.log('2. Create a test PR to verify the CI/CD pipeline');
    console.log('3. Run local tests: node run-tests.js');
    console.log('');
} else {
    console.log('\n❌ Setup verification failed!');
    console.log('Please check the missing files and try again.');
    process.exit(1);
}