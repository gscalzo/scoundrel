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
- [ ] Implement logic to play any 3 of the 4 cards, resolving each fully. <!-- NOT DONE: Current logic does not enforce this rule. -->
- [ ] Carry over the unused 4th card and deal 3 new cards to form the next room. <!-- NOT DONE: No logic for carrying over a card. -->

## [ ] 5. Combat System
- [ ] Implement combat without a weapon (take damage equal to monster's value, discard monster). <!-- PARTIALLY DONE: Combat exists, but not as per Scoundrel rules. -->
- [ ] Implement weapon equipping and logic (only one weapon at a time, discard old weapon and stacked monsters when equipping new one). <!-- NOT DONE: No stacking of defeated monsters, no discard logic as per rules. -->
- [ ] Implement combat with a weapon (damage = monster value - weapon value, min 0). <!-- NOT DONE: No weapon vs. monster logic as per Scoundrel. -->
- [ ] Track defeated monsters under the weapon and enforce the strictly weaker monster rule. <!-- NOT DONE: No stacking or rule enforcement. -->
- [ ] Allow bare-handed combat even if a weapon is equipped. <!-- NOT DONE: Not present. -->

## [ ] 6. Potion System
- [ ] Implement logic for drinking potions (first potion heals, others do not in the same turn). <!-- NOT DONE: All hearts heal, no 'first only' logic. -->
- [ ] Allow multiple potions to be played in a turn, but only the first heals. <!-- NOT DONE: Not enforced. -->

## [x] 7. Health Tracking
- [x] Update health counter after each combat and potion use. (DONE)
- [x] End game if health reaches 0 or lower. (DONE)

## [ ] 8. Endgame Conditions
- [ ] Implement win condition (dungeon deck fully used up). <!-- NOT DONE: Game ends if deck is empty, but not as a win. -->
- [x] Implement lose condition (health reaches 0 or lower at any time). (DONE)

## [~] 9. User Interface (if applicable)
- [~] Display current room, health, equipped weapon, and defeated monsters. <!-- PARTIALLY DONE: Defeated monsters under weapon not shown. -->
- [~] Show available actions (play, skip, equip, drink, etc.). <!-- PARTIALLY DONE: Skip not present. -->
- [ ] Provide feedback for invalid actions (e.g., skipping twice in a row). <!-- NOT DONE: No skip logic, so no feedback. -->

## [ ] 10. Testing & Validation
- [ ] Write unit tests for deck creation, shuffling, and trimming. <!-- NOT DONE: No tests found. -->
- [ ] Test all game rules and edge cases (combat, potions, skipping, endgame). <!-- NOT DONE: No tests found. -->
- [ ] Validate that the game flow matches the rules in rules.md. <!-- NOT DONE: Not validated. --> 