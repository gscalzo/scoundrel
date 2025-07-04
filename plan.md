# Scoundrel Implementation Plan

---

## [x] 1. Deck Preparation
- [x] Implement logic to create a standard 52-card deck. (DONE in js/deck.js)
- [x] Remove all red face cards (J, Q, K) and red aces from the deck. (DONE in js/deck.js and used in js/game.js)
- [x] Shuffle the trimmed deck to form the dungeon. (DONE in js/game.js)

## [x] 2. Game Setup
- [x] Set up the health counter, starting at 20. (DONE in js/game.js)
- [x] Deal 4 cards face-up to create the first room. (DONE in js/game.js)

## [x] 3. Card Representation
- [x] Define data structures for cards, including suit, value, and type (monster, weapon, potion). (DONE in js/deck.js)
- [x] Implement logic to display cards and their types/values. (DONE in js/ui.js)

## [x] 4. Room Cycle Logic
- [x] Implement the option to skip a room (collect all 4 cards, place under dungeon, deal new 4). (DONE in js/game.js: skipRoom)
- [x] Enforce the rule: may not skip twice in a row. (DONE in js/game.js: gameState.lastActionWasSkip)
- [x] Implement logic to play any 3 of the 4 cards, resolving each fully. (DONE in js/game.js: processCardEffects and equipItem enforce 3-card limit)
- [x] Carry over the unused 4th card and deal 3 new cards to form the next room. (DONE in js/game.js: carryOverCard state and nextRoom/dealRoomCards logic)

## [x] 5. Combat System
- [x] Implement combat without a weapon (take damage equal to monster's value, discard monster). (DONE in js/game.js: handleCombat function with bare-handed logic)
- [x] Implement weapon equipping and logic (only one weapon at a time, discard old weapon and stacked monsters when equipping new one). (DONE in js/game.js: equipItem function properly discards old weapon and stack)
- [x] Implement combat with a weapon (damage = monster value - weapon value, min 0). (DONE in js/game.js: handleCombat function with weapon damage calculation)
- [x] Track defeated monsters under the weapon and enforce the strictly weaker monster rule. (DONE in js/game.js: weaponStack tracking and canAttackMonster validation)
- [x] Allow bare-handed combat even if a weapon is equipped. (DONE in js/game.js: fightBareHanded function and js/cardInteraction.js: player choice dialog)

## [x] 6. Potion System
- [x] Implement logic for drinking potions (first potion heals, others do not in the same turn). (DONE in js/game.js: potionUsedThisRoom flag and handleHeartsCard logic)
- [x] Allow multiple potions to be played in a turn, but only the first heals. (DONE in js/game.js: subsequent potions consumed but don't heal, with UI warnings)

## [x] 7. Health Tracking
- [x] Update health counter after each combat and potion use. (DONE)
- [x] End game if health reaches 0 or lower. (DONE)

## [x] 8. Endgame Conditions
- [x] Implement win condition (dungeon deck fully used up). (DONE in js/game.js: gameWin function, checkVictoryCondition, and victory checks after card plays)
- [x] Implement lose condition (health reaches 0 or lower at any time). (DONE)

## [x] 9. User Interface (if applicable)
- [x] Display current room, health, equipped weapon, and defeated monsters. (DONE: All elements display correctly, defeated monsters show under weapons)
- [x] Show available actions (play, skip, equip, drink, etc.). (DONE: All buttons and interactions available with proper state management)
- [x] Provide feedback for invalid actions (e.g., skipping twice in a row). (DONE in js/game.js, js/ui.js, js/dragDrop.js: Toast notifications and enhanced log messages for all invalid actions)

## [ ] 10. Testing & Validation
- [ ] Write unit tests for deck creation, shuffling, and trimming. <!-- NOT DONE: No tests found. -->
- [ ] Test all game rules and edge cases (combat, potions, skipping, endgame). <!-- NOT DONE: No tests found. -->
- [ ] Validate that the game flow matches the rules in rules.md. <!-- NOT DONE: Not validated. --> 