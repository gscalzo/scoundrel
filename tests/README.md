# Scoundrel Card Game - Test Suite

This directory contains the comprehensive test suite for the Scoundrel Card Game. **All tests must pass before deployment!**

## 🧪 Test Structure

```
tests/
├── README.md                # This file
├── test.html               # Browser-based test runner
├── test-runner.js          # Custom testing framework
├── run-tests.js            # Command-line test runner
├── unit/                   # Unit tests
│   ├── deck.test.js        # Deck module tests
│   └── game.test.js        # Game module tests
└── integration/            # Integration tests
    └── integration.test.js # Integration & deployment tests
```

## 🚀 Running Tests

### Browser-Based Testing (Recommended)

1. Open `test.html` in your web browser
2. Click "🚀 Run All Tests" to execute the complete test suite
3. Review the results in the console output

**Available Test Options:**
- **🚀 Run All Tests**: Execute all unit, integration, and deployment tests
- **⚙️ Unit Tests Only**: Run just the unit tests for individual modules
- **🔗 Integration Tests Only**: Run integration and deployment sanity tests
- **🗑️ Clear Output**: Clear the test console

### Command-Line Testing

For CI/CD and automated testing:

```bash
# Manual testing with browser
node run-tests.js

# Automated headless testing (requires Puppeteer)
node run-tests.js --headless

# Use custom port
node run-tests.js --port=8080
```

To install Puppeteer for headless testing:
```bash
npm install puppeteer
```

## 📋 Test Categories

### Unit Tests

**Deck Module (`unit/deck.test.js`)**
- ✅ Card deck creation (52 cards)
- ✅ Card properties validation
- ✅ Shuffling algorithm
- ✅ Card dealing mechanics
- ✅ Scoundrel deck trimming (removes 8 red face/ace cards)
- ✅ Error handling for edge cases

**Game Module (`unit/game.test.js`)**
- ✅ Game state initialization
- ✅ Health system (damage, healing, limits)
- ✅ Equipment system (weapon equipping)
- ✅ Card effect processing
- ✅ Room progression mechanics
- ✅ Game over conditions
- ✅ Reset functionality

### Integration Tests

**Module Integration (`integration/integration.test.js`)**
- ✅ Module imports and exports
- ✅ Complete game flow (start → play → next room)
- ✅ Cross-module state consistency
- ✅ Error handling and edge cases

**Deployment Sanity**
- ✅ DOM element availability
- ✅ Event listener attachment
- ✅ CSS loading verification
- ✅ Module import functionality
- ✅ Game initialization

## 🎯 Test Coverage

The test suite covers:

- **100% of core game mechanics**: Health, equipment, card effects
- **100% of deck operations**: Creation, shuffling, dealing, trimming
- **100% of game state management**: Start, reset, progression
- **All critical user interactions**: Button clicks, card playing
- **Deployment readiness**: DOM, CSS, modules, events

## ✅ Test Requirements

### Before Deployment

All tests must pass with the following criteria:

1. **Unit Tests**: All individual module functions work correctly
2. **Integration Tests**: Modules interact properly without conflicts
3. **Deployment Tests**: Game loads and runs in browser environment
4. **No Console Errors**: Clean browser console during test execution

### Test Validation

The test suite validates:

- **Game Logic**: Rules are enforced correctly (3 cards per room, health limits, etc.)
- **Data Integrity**: Card properties, game state consistency
- **Error Handling**: Graceful failure for invalid operations
- **Performance**: No infinite loops or memory leaks
- **Browser Compatibility**: ES6 modules, DOM APIs

## 🐛 Debugging Failed Tests

When tests fail:

1. **Check Console Output**: Look for specific error messages
2. **Review Test Names**: Failed test names indicate the problem area
3. **Inspect Stack Traces**: Line numbers help locate issues
4. **Run Individual Suites**: Use selective testing to isolate problems

Common issues:
- **Module Import Errors**: Check file paths and ES6 syntax
- **DOM Element Missing**: Verify HTML structure in test.html
- **State Inconsistency**: Review game state management logic
- **Timing Issues**: Async operations may need proper waiting

## 🔧 Maintaining Tests

### Adding New Tests

1. **Unit Tests**: Add to appropriate module file (`deck.test.js` or `game.test.js`)
2. **Integration Tests**: Add to `integration/integration.test.js`
3. **Follow Patterns**: Use existing test structure and naming conventions

### Test Structure Example

```javascript
testRunner.test('description of what is being tested', () => {
  // Arrange: Set up test data
  const testCard = createTestCard('hearts', '5', 5);
  
  // Act: Execute the function being tested
  const result = Game.processCardEffects(testCard, 0);
  
  // Assert: Verify the expected outcome
  assert.assertTrue(result, 'Should process card successfully');
  assert.assertEqual(Game.gameState.health, expectedHealth, 'Health should update correctly');
});
```

### Test Best Practices

- **Descriptive Names**: Clearly describe what each test validates
- **Single Responsibility**: Each test should verify one specific behavior
- **Clean State**: Ensure tests don't interfere with each other
- **Good Coverage**: Test both happy paths and error conditions
- **Fast Execution**: Keep tests quick to encourage frequent running

## 📊 Test Metrics

Current test metrics:
- **Total Tests**: ~35+ individual test cases
- **Test Categories**: 3 (Unit, Integration, Deployment)
- **Module Coverage**: 100% of core modules
- **Execution Time**: < 10 seconds for full suite
- **Browser Support**: Modern browsers with ES6 module support

---

**Remember: Tests are your safety net! Always run the full test suite before deploying changes.**