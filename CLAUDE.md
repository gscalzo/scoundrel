# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Game
- `./start_game.sh` - Starts a local HTTP server on port 8000 using Python or npx
- Open `index.html` directly in a browser for quick testing
- No build process required - vanilla JavaScript/HTML/CSS project

### Testing
- No formal test framework configured
- Manual testing by opening the game in browser and playing through scenarios
- Test scenarios should cover: game start, room navigation, card interactions, equipment, health system, and edge cases

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

### Known Incomplete Features
According to plan.md, several Scoundrel rules are not fully implemented:
- Win condition when deck is fully used

### Recently Completed Features
- ✅ 3-of-4 card play enforcement per room
- ✅ Carrying over unused 4th card to next room
- ✅ UI feedback for cards played counter and room progression
- ✅ Full Scoundrel combat system with weapon vs bare-handed choices
- ✅ "Strictly weaker" monster rule for weapon usage
- ✅ Defeated monster stacking under weapons
- ✅ Proper card type handling: ♦️ weapons, ♣️♠️ monsters, ♥️ potions
- ✅ First-potion-only healing rule per room
- ✅ Visual indicators for potion usage status