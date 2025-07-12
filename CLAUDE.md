# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Game
- `./start_game.sh` - Starts a local HTTP server on port 8000 using Python or npx
- Open `index.html` directly in a browser for quick testing
- No build process required - vanilla JavaScript/HTML/CSS project

### Testing
- Comprehensive test suite using custom testing framework
- **Browser testing**: Open `tests/test.html` and click "🚀 Run All Tests"
- **Quick validation**: `cd tests && node quick-test.js`
- **CI/CD testing**: `cd tests && node run-tests.js` (manual) or `cd tests && node run-tests.js --headless` (automated)
- **Headless testing**: Requires temporary Puppeteer installation: `echo '{"name": "test-deps", "version": "1.0.0"}' > tests/package.json && cd tests && npm install puppeteer`
- **All tests must pass before deployment** - this is enforced in the CI/CD pipeline
- Test structure: Unit tests (`unit/`), Integration tests (`integration/`), and deployment sanity checks
- **Note**: Node.js dependencies (node_modules, package.json) are temporary and excluded from repository

#### Testing Requirements for New Features
**MANDATORY**: All new features must include comprehensive unit tests that can be run in headless mode. When adding any new functionality:

1. **Add unit tests** to the appropriate test file in `tests/unit/` (e.g., `game.test.js`, `deck.test.js`)
2. **Test coverage must include**:
   - Happy path scenarios (feature works as expected)
   - Edge cases and boundary conditions
   - Error conditions and invalid inputs
   - Integration with existing game state and rules
3. **Run tests using**: `./run_test.sh` (executes headless tests via Puppeteer)
4. **All tests must pass** before the feature is considered complete
5. **Test naming convention**: Use descriptive test names that clearly state what behavior is being tested

Example test structure:
```javascript
testRunner.test('feature should handle expected case correctly', () => {
  // Setup game state
  // Execute feature
  // Assert expected outcomes
});

testRunner.test('feature should reject invalid input gracefully', () => {
  // Test error handling and validation
});
```

**Critical**: Never merge new features without corresponding unit tests. Use `./run_test.sh` to verify all tests pass in headless mode before considering the implementation complete.

## Architecture Overview

### Core Structure
This is a web-based card game built with vanilla JavaScript using ES6 modules. The architecture follows a modular design with clear separation of concerns:

- **main.js**: Application entry point, handles initialization and event listeners
- **game.js**: Core game logic and state management (exports `gameState` object)
- **deck.js**: Card definitions, deck operations, and Scoundrel-specific deck trimming
- **ui.js**: DOM manipulation and UI updates
- **dragDrop.js**: Drag and drop functionality for card interactions
- **cardInteraction.js**: Handles card click events and interactions

### Game State Management
Central game state is maintained in `game.js` as an exported object containing:
- Player health, equipment, deck, room cards, discard pile
- Game progression tracking (rounds, score, active status)
- Scoundrel-specific state (weapon stack, cards played counter, skip tracking)
- **Room cycle state**: `cardsPlayedThisRoom` counter and `carryOverCard` for 3-of-4 rule

### Card System
Cards are objects with properties: `id`, `suit`, `rank`, `value`, `imagePath`
- Standard 52-card deck creation with Scoundrel rule modifications
- `trimDeckForScoundrel()` removes red face cards (J, Q, K) and red aces
- Card effects based on suit: Hearts (healing), Diamonds (treasure), Clubs (weapons/monsters), Spades (armor/traps)

### UI Pattern
- UI updates are centralized in ui.js module
- Game logic calls UI functions after state changes
- DOM manipulation separated from game logic
- Card rendering uses dynamic image loading from `images/cards/` directory

### Scoundrel Game Rules Implementation
The game implements a card-based dungeon crawler with specific mechanics:
- Trimmed deck (no red face cards/aces) as per rules.md
- Room-based gameplay with 4-card layouts
- **3-of-4 card rule**: Players must play exactly 3 cards per room before advancing
- **Card carry-over system**: The 4th unplayed card carries to the next room
- Equipment system (weapons from clubs, armor from spades)
- Combat system with weapon/armor damage modification
- Skip room functionality (cannot skip twice in a row, only when no cards played)
- Health tracking with game over at 0 HP

### Development Notes
- Uses ES6 module imports/exports
- No external dependencies or build tools
- Card images expected in `images/cards/` with naming pattern `{rank}_of_{suit}.png`
- Game state is mutable and shared across modules via imports
- Event handling uses delegation pattern for dynamically created cards

### Development Patterns
- **ES6 modules**: All JavaScript uses import/export for modularity
- **Central state management**: `gameState` object in `game.js` holds all game data
- **Event-driven architecture**: User interactions trigger state changes and UI updates
- **Separation of concerns**: Game logic, UI updates, and DOM manipulation are separated
- **Native APIs**: Uses HTML5 Drag and Drop API, no external dependencies
- **Defensive programming**: Comprehensive error handling and validation throughout

### Key Implementation Details
- **Scoundrel deck trimming**: Removes 8 cards (red face cards and red aces) from standard 52-card deck
- **3-of-4 card rule**: Players must play exactly 3 cards per room; the 4th carries over to next room
- **Combat system**: Weapon damage calculation (monster value - weapon value, min 0) vs bare-handed combat
- **Monster stacking**: Defeated monsters stack under weapons with "strictly weaker" rule enforcement
- **Potion healing**: First potion per room heals, subsequent potions ignored
- **Skip restrictions**: Cannot skip twice in a row, only when no cards have been played
- **Win condition**: Game ends successfully when dungeon deck is fully exhausted
- **State persistence**: Game state maintained across modules via shared import pattern

### Quality Assurance
- **Test coverage**: Unit tests for all core modules, integration tests for game flow
- **Error handling**: Comprehensive validation with user-friendly error messages
- **Performance**: No build process, vanilla JS for fast loading
- **Accessibility**: Keyboard navigation and screen reader support
- **Browser compatibility**: Modern browsers with ES6 module support