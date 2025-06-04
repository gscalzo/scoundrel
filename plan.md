# Scoundrel Implementation Plan

---

## [ ] 1. Deck Preparation
- [ ] Implement logic to create a standard 52-card deck.
- [ ] Remove all red face cards (J, Q, K) and red aces from the deck.
- [ ] Shuffle the trimmed deck to form the dungeon.

## [ ] 2. Game Setup
- [ ] Set up the health counter, starting at 20.
- [ ] Deal 4 cards face-up to create the first room.

## [ ] 3. Card Representation
- [ ] Define data structures for cards, including suit, value, and type (monster, weapon, potion).
- [ ] Implement logic to display cards and their types/values.

## [ ] 4. Room Cycle Logic
- [ ] Implement the option to skip a room (collect all 4 cards, place under dungeon, deal new 4).
- [ ] Enforce the rule: may not skip twice in a row.
- [ ] Implement logic to play any 3 of the 4 cards, resolving each fully.
- [ ] Carry over the unused 4th card and deal 3 new cards to form the next room.

## [ ] 5. Combat System
- [ ] Implement combat without a weapon (take damage equal to monster's value, discard monster).
- [ ] Implement weapon equipping and logic (only one weapon at a time, discard old weapon and stacked monsters when equipping new one).
- [ ] Implement combat with a weapon (damage = monster value - weapon value, min 0).
- [ ] Track defeated monsters under the weapon and enforce the strictly weaker monster rule.
- [ ] Allow bare-handed combat even if a weapon is equipped.

## [ ] 6. Potion System
- [ ] Implement logic for drinking potions (first potion heals, others do not in the same turn).
- [ ] Allow multiple potions to be played in a turn, but only the first heals.

## [ ] 7. Health Tracking
- [ ] Update health counter after each combat and potion use.
- [ ] End game if health reaches 0 or lower.

## [ ] 8. Endgame Conditions
- [ ] Implement win condition (dungeon deck fully used up).
- [ ] Implement lose condition (health reaches 0 or lower at any time).

## [ ] 9. User Interface (if applicable)
- [ ] Display current room, health, equipped weapon, and defeated monsters.
- [ ] Show available actions (play, skip, equip, drink, etc.).
- [ ] Provide feedback for invalid actions (e.g., skipping twice in a row).

## [ ] 10. Testing & Validation
- [ ] Write unit tests for deck creation, shuffling, and trimming.
- [ ] Test all game rules and edge cases (combat, potions, skipping, endgame).
- [ ] Validate that the game flow matches the rules in rules.md. 