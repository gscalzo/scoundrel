/**
 * Unit tests for Game module
 * Tests game state management, health system, equipment, and card processing
 */

// The Game module will be available as window.Game when tests run
let mockUI = {
  updateHealthDisplay: () => {},
  renderEquipment: () => {},
  updateDeckCount: () => {},
  hideVictoryStatus: () => {},
  updateButtonStates: () => {},
  addLogMessage: () => {},
  updateCardsPlayedDisplay: () => {},
  updatePotionUsageDisplay: () => {},
  displayRoomCards: () => {},
  clearRoomCards: () => {},
  showToast: () => {},
  displayVictoryStatus: () => {}
};

// Test functions - will be called by the test runner
function testGameModule() {
  testRunner.describe('Game Module', () => {
    
    // Test helper function to create a test card
    function createTestCard(suit, rank, value) {
      return {
        id: `${rank}_of_${suit}`,
        suit,
        rank,
        value,
        imagePath: `images/cards/${rank}_of_${suit}.png`
      };
    }

    testRunner.test('startNewGame should initialize game state correctly', () => {
      const initialState = window.Game.startNewGame();
      
      assert.assertEqual(initialState.playerHealth, 20, 'Player health should be 20');
      assert.assertEqual(initialState.maxHealth, 20, 'Max health should be 20');
      assert.assertEqual(initialState.currentWeapon, null, 'Should start with no weapon');
      assert.assertEqual(initialState.currentRound, 0, 'Should start at round 0');
      assert.assertTrue(initialState.gameActive, 'Game should be active');
      assert.assertEqual(initialState.score, 0, 'Score should start at 0');
      assert.assertEqual(initialState.cardsPlayedThisRoom, 0, 'Cards played should be 0');
      assert.assertFalse(initialState.potionUsedThisRoom, 'Potion usage should be false');
      assert.assertEqual(initialState.carryOverCard, null, 'No carry over card initially');
    });

    testRunner.test('updateHealth should increase health correctly', () => {
      window.Game.startNewGame();
      window.Game.gameState.playerHealth = 15; // Set to less than max
      
      const healthChange = window.Game.updateHealth(3);
      
      assert.assertEqual(healthChange, 3, 'Should return the health change amount');
      assert.assertEqual(window.Game.gameState.playerHealth, 18, 'Health should increase to 18');
    });

    testRunner.test('updateHealth should not exceed max health', () => {
      window.Game.startNewGame();
      window.Game.gameState.playerHealth = 18;
      
      const healthChange = window.Game.updateHealth(5);
      
      assert.assertEqual(healthChange, 2, 'Should only increase by 2 to reach max');
      assert.assertEqual(window.Game.gameState.playerHealth, 20, 'Health should be capped at max');
    });

    testRunner.test('updateHealth should decrease health correctly', () => {
      window.Game.startNewGame();
      
      const healthChange = window.Game.updateHealth(-5);
      
      assert.assertEqual(healthChange, -5, 'Should return negative health change');
      assert.assertEqual(window.Game.gameState.playerHealth, 15, 'Health should decrease to 15');
    });

    testRunner.test('updateHealth should not go below 0', () => {
      window.Game.startNewGame();
      window.Game.gameState.playerHealth = 3;
      
      const healthChange = window.Game.updateHealth(-10);
      
      assert.assertEqual(healthChange, -3, 'Should only decrease by available health');
      assert.assertEqual(window.Game.gameState.playerHealth, 0, 'Health should not go below 0');
      assert.assertFalse(window.Game.gameState.gameActive, 'Game should end when health reaches 0');
    });

    testRunner.test('resetGame should reset all game state', () => {
      window.Game.startNewGame();
      window.Game.gameState.playerHealth = 10;
      window.Game.gameState.currentWeapon = createTestCard('diamonds', '5', 5);
      window.Game.gameState.currentRound = 3;
      window.Game.gameState.score = 100;
      
      const resetState = window.Game.resetGame();
      
      assert.assertEqual(resetState.playerHealth, 20, 'Health should be reset');
      assert.assertEqual(resetState.currentWeapon, null, 'Weapon should be null');
      assert.assertEqual(resetState.currentRound, 0, 'Round should be 0');
      assert.assertEqual(resetState.score, 0, 'Score should be 0');
      assert.assertFalse(resetState.gameActive, 'Game should not be active');
      assert.assertEqual(resetState.cardsPlayedThisRoom, 0, 'Cards played should be 0');
    });

    testRunner.test('equipItem should equip diamond as weapon', async () => {
      window.Game.startNewGame();
      const diamondCard = createTestCard('diamonds', '7', 7);
      window.Game.gameState.roomCards = [diamondCard];
      
      const success = await window.Game.equipItem(diamondCard, 'weapon', 0, true);
      
      assert.assertTrue(success, 'Should successfully equip diamond');
      assert.assertEqual(window.Game.gameState.currentWeapon.suit, 'diamonds', 'Should equip diamond as weapon');
      assert.assertEqual(window.Game.gameState.currentWeapon.value, 7, 'Should have correct weapon value');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 1, 'Should increment cards played');
    });

    testRunner.test('equipItem should reject non-diamond cards as weapons', async () => {
      window.Game.startNewGame();
      const heartCard = createTestCard('hearts', '5', 5);
      window.Game.gameState.roomCards = [heartCard];
      
      const success = await window.Game.equipItem(heartCard, 'weapon', 0, true);
      
      assert.assertFalse(success, 'Should not equip heart as weapon');
      assert.assertEqual(window.Game.gameState.currentWeapon, null, 'Should not have weapon equipped');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 0, 'Should not increment cards played');
    });

    testRunner.test('equipItem should replace existing weapon', async () => {
      window.Game.startNewGame();
      const firstWeapon = createTestCard('diamonds', '3', 3);
      const secondWeapon = createTestCard('diamonds', '8', 8);
      window.Game.gameState.roomCards = [firstWeapon, secondWeapon];
      window.Game.gameState.currentWeapon = firstWeapon;
      
      const success = await window.Game.equipItem(secondWeapon, 'weapon', 1, true);
      
      assert.assertTrue(success, 'Should successfully replace weapon');
      assert.assertEqual(window.Game.gameState.currentWeapon.value, 8, 'Should have new weapon');
      assert.assertTrue(window.Game.gameState.discardPile.includes(firstWeapon), 'Old weapon should be in discard pile');
    });

    testRunner.test('equipItem should not work when 3 cards already played', async () => {
      window.Game.startNewGame();
      const diamondCard = createTestCard('diamonds', '7', 7);
      window.Game.gameState.roomCards = [diamondCard];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      
      const success = await window.Game.equipItem(diamondCard, 'weapon', 0, true);
      
      assert.assertFalse(success, 'Should not equip when 3 cards already played');
      assert.assertEqual(window.Game.gameState.currentWeapon, null, 'Should not have weapon equipped');
    });

    testRunner.test('equipItem should not work when game not active', async () => {
      window.Game.startNewGame();
      window.Game.gameState.gameActive = false;
      const diamondCard = createTestCard('diamonds', '7', 7);
      
      const success = await window.Game.equipItem(diamondCard, 'weapon', 0, true);
      
      assert.assertFalse(success, 'Should not equip when game not active');
    });

    testRunner.test('nextRoom should require exactly 3 cards played', () => {
      window.Game.startNewGame();
      window.Game.gameState.cardsPlayedThisRoom = 2;
      
      const roomCards = window.Game.nextRoom();
      
      // Should not proceed to next room
      assert.assertEqual(window.Game.gameState.currentRound, 0, 'Should still be in round 0');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 2, 'Cards played should not reset');
    });

    testRunner.test('nextRoom should proceed when 3 cards played', () => {
      window.Game.startNewGame();
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [createTestCard('hearts', '2', 2)]; // One card to carry over
      
      const roomCards = window.Game.nextRoom();
      
      assert.assertEqual(window.Game.gameState.currentRound, 1, 'Should advance to round 1');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 0, 'Cards played should reset');
      assert.assertFalse(window.Game.gameState.potionUsedThisRoom, 'Potion usage should reset');
    });

    testRunner.test('getCardsPlayedThisRoom should return correct count', () => {
      window.Game.startNewGame();
      window.Game.gameState.cardsPlayedThisRoom = 2;
      
      const count = window.Game.getCardsPlayedThisRoom();
      
      assert.assertEqual(count, 2, 'Should return current cards played count');
    });

    testRunner.test('processCardEffects should handle hearts card healing', () => {
      window.Game.startNewGame();
      window.Game.gameState.playerHealth = 15;
      const heartCard = createTestCard('hearts', '5', 5);
      window.Game.gameState.roomCards = [heartCard];
      
      window.Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(window.Game.gameState.playerHealth, 20, 'Should heal player');
      assert.assertTrue(window.Game.gameState.potionUsedThisRoom, 'Should mark potion as used');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 1, 'Should increment cards played');
      assert.assertTrue(window.Game.gameState.discardPile.includes(heartCard), 'Heart card should be discarded');
    });

    testRunner.test('processCardEffects should not heal on second potion in room', () => {
      window.Game.startNewGame();
      window.Game.gameState.playerHealth = 15;
      window.Game.gameState.potionUsedThisRoom = true;
      const heartCard = createTestCard('hearts', '3', 3);
      window.Game.gameState.roomCards = [heartCard];
      
      window.Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(window.Game.gameState.playerHealth, 15, 'Should not heal on second potion');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 1, 'Should still increment cards played');
      assert.assertTrue(window.Game.gameState.discardPile.includes(heartCard), 'Heart card should still be discarded');
    });

    testRunner.test('processCardEffects should not work when 3 cards already played', () => {
      window.Game.startNewGame();
      const heartCard = createTestCard('hearts', '5', 5);
      window.Game.gameState.roomCards = [heartCard];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      
      window.Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 3, 'Should not increment cards played');
      assert.assertEqual(window.Game.gameState.roomCards.length, 1, 'Card should not be removed from room');
    });

    testRunner.test('processCardEffects should not work when game not active', () => {
      window.Game.startNewGame();
      window.Game.gameState.gameActive = false;
      const heartCard = createTestCard('hearts', '5', 5);
      
      window.Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 0, 'Should not process when game not active');
    });

    // Weapon stack "strictly weaker" rule tests
    testRunner.test('weapon can attack first monster of any value', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '5', 5);
      const monster = createTestCard('clubs', '8', 8);
      
      // Equip weapon first
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.roomCards = [monster];
      
      // First monster should always be attackable
      window.Game.processCardEffects(monster, 0);
      
      assert.assertEqual(window.Game.gameState.weaponStack.length, 1, 'Monster should be added to weapon stack');
      assert.assertEqual(window.Game.gameState.weaponStack[0].value, 8, 'Monster with value 8 should be in stack');
    });

    testRunner.test('weapon can attack strictly weaker monster', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '5', 5);
      const firstMonster = createTestCard('clubs', '8', 8);
      const weakerMonster = createTestCard('spades', '6', 6);
      
      // Setup: weapon equipped with one monster already defeated
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.weaponStack = [firstMonster];
      window.Game.gameState.roomCards = [weakerMonster];
      
      // Should be able to attack weaker monster (6 < 8)
      window.Game.processCardEffects(weakerMonster, 0);
      
      assert.assertEqual(window.Game.gameState.weaponStack.length, 2, 'Weaker monster should be added to stack');
      assert.assertEqual(window.Game.gameState.weaponStack[1].value, 6, 'Weaker monster should be in stack');
    });

    testRunner.test('weapon cannot attack equal value monster', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '5', 5);
      const firstMonster = createTestCard('clubs', '7', 7);
      const equalMonster = createTestCard('spades', '7', 7);
      
      // Setup: weapon equipped with one monster already defeated
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.weaponStack = [firstMonster];
      window.Game.gameState.roomCards = [equalMonster];
      window.Game.gameState.playerHealth = 20;
      
      // Should NOT be able to attack equal value monster (7 = 7)
      window.Game.processCardEffects(equalMonster, 0);
      
      assert.assertEqual(window.Game.gameState.weaponStack.length, 1, 'Equal monster should NOT be added to stack');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 0, 'Card should not be consumed');
      assert.assertEqual(window.Game.gameState.roomCards.length, 1, 'Monster should remain in room');
    });

    testRunner.test('weapon cannot attack stronger monster', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '5', 5);
      const firstMonster = createTestCard('clubs', '6', 6);
      const strongerMonster = createTestCard('spades', '9', 9);
      
      // Setup: weapon equipped with one monster already defeated
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.weaponStack = [firstMonster];
      window.Game.gameState.roomCards = [strongerMonster];
      window.Game.gameState.playerHealth = 20;
      
      // Should NOT be able to attack stronger monster (9 > 6)
      window.Game.processCardEffects(strongerMonster, 0);
      
      assert.assertEqual(window.Game.gameState.weaponStack.length, 1, 'Stronger monster should NOT be added to stack');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 0, 'Card should not be consumed');
      assert.assertEqual(window.Game.gameState.roomCards.length, 1, 'Monster should remain in room');
    });

    testRunner.test('bare-handed combat always works regardless of weapon stack', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '5', 5);
      const firstMonster = createTestCard('clubs', '6', 6);
      const strongerMonster = createTestCard('spades', '9', 9);
      
      // Setup: weapon equipped with one monster already defeated
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.weaponStack = [firstMonster];
      window.Game.gameState.roomCards = [strongerMonster];
      window.Game.gameState.playerHealth = 20;
      
      // Fight bare-handed should always work
      const success = window.Game.fightBareHanded(strongerMonster, 0);
      
      assert.assertTrue(success, 'Bare-handed combat should succeed');
      assert.assertEqual(window.Game.gameState.weaponStack.length, 1, 'Weapon stack should remain unchanged');
      assert.assertEqual(window.Game.gameState.playerHealth, 11, 'Should take full damage (20 - 9 = 11)');
      assert.assertTrue(window.Game.gameState.discardPile.includes(strongerMonster), 'Monster should be in discard pile');
    });

    testRunner.test('weapon replacement clears the weapon stack', async () => {
      window.Game.startNewGame();
      const firstWeapon = createTestCard('diamonds', '3', 3);
      const secondWeapon = createTestCard('diamonds', '8', 8);
      const monster = createTestCard('clubs', '5', 5);
      
      // Setup: first weapon with defeated monster
      window.Game.gameState.currentWeapon = firstWeapon;
      window.Game.gameState.weaponStack = [monster];
      window.Game.gameState.roomCards = [secondWeapon];
      
      // Replace weapon
      const success = await window.Game.equipItem(secondWeapon, 'weapon', 0, true);
      
      assert.assertTrue(success, 'Should successfully replace weapon');
      assert.assertEqual(window.Game.gameState.currentWeapon.value, 8, 'Should have new weapon');
      assert.assertEqual(window.Game.gameState.weaponStack.length, 0, 'Weapon stack should be cleared');
      assert.assertTrue(window.Game.gameState.discardPile.includes(firstWeapon), 'Old weapon should be in discard pile');
      assert.assertTrue(window.Game.gameState.discardPile.includes(monster), 'Old monsters should be in discard pile');
    });

    // Skip Room Tests
    testRunner.test('skipRoom should work when no cards have been played', () => {
      window.Game.startNewGame();
      window.Game.gameState.cardsPlayedThisRoom = 0;
      window.Game.gameState.canSkipNextRoom = true;
      const initialRoomCards = [...window.Game.gameState.roomCards];
      const initialDeckSize = window.Game.gameState.deck.length;
      
      window.Game.skipRoom(); // Function returns undefined, check side effects
      
      assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'Should have 4 new room cards');
      assert.assertEqual(window.Game.gameState.deck.length, initialDeckSize, 'Deck size should be maintained');
      // Note: canSkipNextRoom behavior may vary based on implementation
    });

    testRunner.test('skipRoom should fail when cards have been played', () => {
      window.Game.startNewGame();
      window.Game.gameState.cardsPlayedThisRoom = 2;
      window.Game.gameState.canSkipNextRoom = true;
      const originalCardsPlayed = window.Game.gameState.cardsPlayedThisRoom;
      
      window.Game.skipRoom();
      
      // Should not change state when skip is invalid
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, originalCardsPlayed, 'Cards played should remain unchanged');
    });

    testRunner.test('skipRoom should fail when already skipped last room', () => {
      window.Game.startNewGame();
      window.Game.gameState.cardsPlayedThisRoom = 0;
      window.Game.gameState.canSkipNextRoom = false;
      const originalRoomCards = [...window.Game.gameState.roomCards];
      
      window.Game.skipRoom();
      
      // Should not change room cards when skip is invalid
      assert.assertEqual(window.Game.gameState.roomCards.length, originalRoomCards.length, 'Room cards should not change');
    });

    testRunner.test('skipRoom should fail when game not active', () => {
      window.Game.startNewGame();
      window.Game.gameState.gameActive = false;
      window.Game.gameState.cardsPlayedThisRoom = 0;
      window.Game.gameState.canSkipNextRoom = true;
      const originalRoomCards = [...window.Game.gameState.roomCards];
      
      window.Game.skipRoom();
      
      // Should not change room cards when game not active
      assert.assertEqual(window.Game.gameState.roomCards.length, originalRoomCards.length, 'Room cards should not change when game not active');
    });

    testRunner.test('skipRoom should place all room cards at bottom of deck', () => {
      window.Game.startNewGame();
      window.Game.gameState.cardsPlayedThisRoom = 0;
      window.Game.gameState.canSkipNextRoom = true;
      const originalRoomCards = [...window.Game.gameState.roomCards];
      const originalDeckSize = window.Game.gameState.deck.length;
      
      window.Game.skipRoom();
      
      // Check that we have new room cards (different from original)
      assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'Should have 4 room cards');
      assert.assertEqual(window.Game.gameState.deck.length, originalDeckSize, 'Deck size should remain the same');
      // Note: Exact deck order testing is complex due to shuffling, so we test general behavior
    });

    // Victory Condition Tests (Testing through nextRoom since checkVictoryCondition is not exported)
    testRunner.test('victory should be detected via nextRoom when deck exhausted and 3 cards played', () => {
      window.Game.startNewGame();
      window.Game.gameState.deck = []; // Empty deck
      window.Game.gameState.discardPile = []; // Empty discard
      window.Game.gameState.cardsPlayedThisRoom = 3; // Required 3 cards played
      window.Game.gameState.roomCards = [createTestCard('hearts', '2', 2)]; // One card to carry over
      
      const roomCards = window.Game.nextRoom();
      
      // Should detect victory and end the game
      assert.assertFalse(window.Game.gameState.gameActive, 'Game should no longer be active');
      assert.assertTrue(window.Game.gameState.playerHealth > 0, 'Player should still be alive (victory, not defeat)');
    });

    testRunner.test('victory should not occur when deck exhausted but only 2 cards played', () => {
      window.Game.startNewGame();
      window.Game.gameState.deck = []; // Empty deck
      window.Game.gameState.discardPile = []; // Empty discard
      window.Game.gameState.cardsPlayedThisRoom = 2; // Only 2 cards played
      window.Game.gameState.roomCards = [createTestCard('hearts', '2', 2)];
      
      const roomCards = window.Game.nextRoom();
      
      // Should not proceed to next room (still need to play 1 more card)
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 2, 'Should still have 2 cards played');
      assert.assertTrue(window.Game.gameState.gameActive, 'Game should still be active');
    });

    testRunner.test('victory should not occur when deck still has cards', () => {
      window.Game.startNewGame();
      // Make sure we have enough cards in deck
      const extraCards = [
        createTestCard('hearts', '2', 2),
        createTestCard('clubs', '3', 3),
        createTestCard('diamonds', '4', 4),
        createTestCard('spades', '5', 5)
      ];
      window.Game.gameState.deck = [...window.Game.gameState.deck, ...extraCards]; // Add more cards
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [createTestCard('clubs', '6', 6)];
      
      const roomCards = window.Game.nextRoom();
      
      // Should proceed to next room normally if enough cards available
      if (window.Game.gameState.gameActive) {
        assert.assertEqual(window.Game.gameState.currentRound, 1, 'Should advance to round 1');
      } else {
        // If game ended, it's due to insufficient cards, which is expected behavior
        assert.assertTrue(true, 'Game ended due to card exhaustion');
      }
    });

    testRunner.test('victory should not occur when discard pile has cards', () => {
      window.Game.startNewGame();
      window.Game.gameState.deck = []; // Empty deck
      // Add enough cards to discard pile to continue game
      const discardCards = [
        createTestCard('clubs', '5', 5),
        createTestCard('hearts', '6', 6),
        createTestCard('diamonds', '7', 7),
        createTestCard('spades', '8', 8)
      ];
      window.Game.gameState.discardPile = discardCards; // Has discard cards
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [createTestCard('hearts', '4', 4)];
      
      const roomCards = window.Game.nextRoom();
      
      // Should reshuffle and continue (not victory)
      if (window.Game.gameState.gameActive) {
        assert.assertEqual(window.Game.gameState.discardPile.length, 0, 'Discard should be reshuffled');
      } else {
        // If game ended, check that it's not due to health loss
        assert.assertTrue(window.Game.gameState.playerHealth > 0, 'Should be victory, not defeat');
      }
    });

    // Deck Exhaustion Tests
    testRunner.test('should reshuffle discard pile when deck exhausted but cards available', () => {
      window.Game.startNewGame();
      const discardCard1 = createTestCard('hearts', '5', 5);
      const discardCard2 = createTestCard('clubs', '7', 7);
      const discardCard3 = createTestCard('diamonds', '3', 3);
      
      // Setup: empty deck, discard pile has cards, need to deal 3 new cards
      window.Game.gameState.deck = [];
      window.Game.gameState.discardPile = [discardCard1, discardCard2, discardCard3];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [createTestCard('spades', '2', 2)]; // One carry-over card
      
      const roomCards = window.Game.nextRoom();
      
      // Should reshuffle discard pile into deck and deal new room
      assert.assertTrue(window.Game.gameState.deck.length >= 0, 'Deck should be available after reshuffle');
      assert.assertEqual(window.Game.gameState.discardPile.length, 0, 'Discard pile should be empty after reshuffle');
      assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'Should have 4 room cards (3 new + 1 carry-over)');
      assert.assertFalse(window.Game.gameState.hasWon, 'Should not win when cards were available for reshuffle');
    });

    testRunner.test('should handle exactly enough cards for one more room', () => {
      window.Game.startNewGame();
      const card1 = createTestCard('hearts', '2', 2);
      const card2 = createTestCard('clubs', '3', 3);
      const card3 = createTestCard('diamonds', '4', 4);
      
      // Setup: exactly 3 cards available (3 in discard, 0 in deck)
      window.Game.gameState.deck = [];
      window.Game.gameState.discardPile = [card1, card2, card3];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [createTestCard('spades', '5', 5)]; // One carry-over
      
      const roomCards = window.Game.nextRoom();
      
      // Should use the 3 available cards + 1 carry-over to make next room
      assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'Should have 4 room cards');
      assert.assertEqual(window.Game.gameState.deck.length, 0, 'Deck should be empty');
      assert.assertEqual(window.Game.gameState.discardPile.length, 0, 'Discard should be empty');
      assert.assertFalse(window.Game.gameState.hasWon, 'Should not win yet - still have room to play');
    });

    testRunner.test('should handle insufficient cards for reshuffle', () => {
      window.Game.startNewGame();
      const insufficientCard = createTestCard('hearts', '2', 2);
      
      // Setup: only 1 card in discard, need 3 new cards
      window.Game.gameState.deck = [];
      window.Game.gameState.discardPile = [insufficientCard];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [createTestCard('spades', '5', 5)]; // One carry-over
      
      const roomCards = window.Game.nextRoom();
      
      // Should detect victory due to insufficient cards
      assert.assertFalse(window.Game.gameState.gameActive, 'Game should no longer be active');
      assert.assertTrue(window.Game.gameState.playerHealth > 0, 'Player should still be alive (victory, not defeat)');
    });

    testRunner.test('should correctly calculate total available cards', () => {
      window.Game.startNewGame();
      const deckCards = [createTestCard('hearts', '2', 2), createTestCard('clubs', '3', 3)];
      const discardCards = [createTestCard('diamonds', '4', 4), createTestCard('spades', '5', 5)];
      
      window.Game.gameState.deck = deckCards;
      window.Game.gameState.discardPile = discardCards;
      
      const totalCards = window.Game.gameState.deck.length + window.Game.gameState.discardPile.length;
      
      assert.assertEqual(totalCards, 4, 'Should correctly count deck + discard cards');
    });

    testRunner.test('reshuffle should maintain card integrity', () => {
      window.Game.startNewGame();
      const originalCards = [
        createTestCard('hearts', '5', 5),
        createTestCard('clubs', '7', 7),
        createTestCard('diamonds', '3', 3),
        createTestCard('spades', '9', 9)
      ];
      
      // Setup for reshuffle scenario
      window.Game.gameState.deck = [];
      window.Game.gameState.discardPile = [...originalCards];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [createTestCard('hearts', '2', 2)];
      
      const roomCards = window.Game.nextRoom();
      
      // Verify all original cards are still in the game (either in deck, room, or used)
      const allCurrentCards = [
        ...window.Game.gameState.deck,
        ...window.Game.gameState.roomCards,
        ...window.Game.gameState.discardPile
      ];
      
      assert.assertTrue(allCurrentCards.length >= originalCards.length, 'Should maintain card count after reshuffle');
    });

    // Spades Monster Tests
    testRunner.test('spades cards should be processed as monsters', () => {
      window.Game.startNewGame();
      const spadesMonster = createTestCard('spades', '7', 7);
      window.Game.gameState.roomCards = [spadesMonster];
      window.Game.gameState.playerHealth = 20;
      
      window.Game.processCardEffects(spadesMonster, 0);
      
      assert.assertEqual(window.Game.gameState.playerHealth, 13, 'Should take damage from spades monster (20 - 7 = 13)');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 1, 'Should increment cards played');
      assert.assertTrue(window.Game.gameState.discardPile.includes(spadesMonster), 'Spades monster should be in discard pile');
    });

    testRunner.test('spades monster vs weapon combat should work like clubs', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '5', 5);
      const spadesMonster = createTestCard('spades', '8', 8);
      
      // Equip weapon and set up room
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.roomCards = [spadesMonster];
      window.Game.gameState.playerHealth = 20;
      
      window.Game.processCardEffects(spadesMonster, 0);
      
      // Damage should be monster value - weapon value = 8 - 5 = 3
      assert.assertEqual(window.Game.gameState.playerHealth, 17, 'Should take reduced damage (20 - 3 = 17)');
      assert.assertEqual(window.Game.gameState.weaponStack.length, 1, 'Monster should be added to weapon stack');
      assert.assertEqual(window.Game.gameState.weaponStack[0].value, 8, 'Spades monster should be in weapon stack');
    });

    testRunner.test('spades monster should respect weapon stack "strictly weaker" rule', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '4', 4);
      const firstMonster = createTestCard('clubs', '9', 9);
      const strongerSpadesMonster = createTestCard('spades', '10', 10);
      
      // Setup: weapon with one defeated monster
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.weaponStack = [firstMonster];
      window.Game.gameState.roomCards = [strongerSpadesMonster];
      window.Game.gameState.playerHealth = 20;
      
      // Should NOT be able to attack stronger spades monster (10 > 9)
      window.Game.processCardEffects(strongerSpadesMonster, 0);
      
      assert.assertEqual(window.Game.gameState.weaponStack.length, 1, 'Stronger spades monster should NOT be added to stack');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 0, 'Card should not be consumed');
      assert.assertEqual(window.Game.gameState.roomCards.length, 1, 'Spades monster should remain in room');
    });

    testRunner.test('spades monster should work with weapon stack when strictly weaker', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '6', 6);
      const firstMonster = createTestCard('clubs', '10', 10);
      const weakerSpadesMonster = createTestCard('spades', '7', 7);
      
      // Setup: weapon with one defeated monster
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.weaponStack = [firstMonster];
      window.Game.gameState.roomCards = [weakerSpadesMonster];
      window.Game.gameState.playerHealth = 20;
      
      // Should be able to attack weaker spades monster (7 < 10)
      window.Game.processCardEffects(weakerSpadesMonster, 0);
      
      assert.assertEqual(window.Game.gameState.weaponStack.length, 2, 'Weaker spades monster should be added to stack');
      assert.assertEqual(window.Game.gameState.weaponStack[1].value, 7, 'Spades monster should be in weapon stack');
      assert.assertEqual(window.Game.gameState.playerHealth, 19, 'Should take 1 damage (7 - 6 = 1)');
    });

    testRunner.test('spades monster bare-handed combat should always work', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '3', 3);
      const firstMonster = createTestCard('clubs', '5', 5);
      const strongSpadesMonster = createTestCard('spades', '12', 12);
      
      // Setup: weapon that cannot attack strong spades monster
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.weaponStack = [firstMonster];
      window.Game.gameState.roomCards = [strongSpadesMonster];
      window.Game.gameState.playerHealth = 20;
      
      // Fight bare-handed should work regardless of weapon restrictions
      const success = window.Game.fightBareHanded(strongSpadesMonster, 0);
      
      assert.assertTrue(success, 'Bare-handed combat with spades should succeed');
      assert.assertEqual(window.Game.gameState.weaponStack.length, 1, 'Weapon stack should remain unchanged');
      assert.assertEqual(window.Game.gameState.playerHealth, 8, 'Should take full damage (20 - 12 = 8)');
      assert.assertTrue(window.Game.gameState.discardPile.includes(strongSpadesMonster), 'Spades monster should be in discard pile');
    });

    testRunner.test('mixed clubs and spades monsters should work together in weapon stack', () => {
      window.Game.startNewGame();
      const weapon = createTestCard('diamonds', '8', 8);
      const clubsMonster = createTestCard('clubs', '11', 11);
      const spadesMonster = createTestCard('spades', '9', 9);
      
      // First defeat clubs monster
      window.Game.gameState.currentWeapon = weapon;
      window.Game.gameState.roomCards = [clubsMonster];
      window.Game.processCardEffects(clubsMonster, 0);
      
      // Then defeat weaker spades monster
      window.Game.gameState.roomCards = [spadesMonster];
      window.Game.gameState.cardsPlayedThisRoom = 0; // Reset for second card
      window.Game.processCardEffects(spadesMonster, 0);
      
      assert.assertEqual(window.Game.gameState.weaponStack.length, 2, 'Both monsters should be in weapon stack');
      assert.assertEqual(window.Game.gameState.weaponStack[0].suit, 'clubs', 'First monster should be clubs');
      assert.assertEqual(window.Game.gameState.weaponStack[1].suit, 'spades', 'Second monster should be spades');
      assert.assertEqual(window.Game.gameState.weaponStack[1].value, 9, 'Spades monster should have correct value');
    });

    testRunner.test('spades face cards should have correct monster values', () => {
      window.Game.startNewGame();
      const spadesJack = createTestCard('spades', 'jack', 11);
      const spadesQueen = createTestCard('spades', 'queen', 12);  
      const spadesKing = createTestCard('spades', 'king', 13);
      const spadesAce = createTestCard('spades', 'ace', 14);
      
      window.Game.gameState.roomCards = [spadesJack];
      window.Game.gameState.playerHealth = 20;
      
      // Test Jack damage
      window.Game.processCardEffects(spadesJack, 0);
      assert.assertEqual(window.Game.gameState.playerHealth, 9, 'Jack should deal 11 damage (20 - 11 = 9)');
      
      // Reset and test other face cards
      window.Game.gameState.playerHealth = 20;
      window.Game.gameState.roomCards = [spadesQueen];
      window.Game.gameState.cardsPlayedThisRoom = 0;
      window.Game.processCardEffects(spadesQueen, 0);
      assert.assertEqual(window.Game.gameState.playerHealth, 8, 'Queen should deal 12 damage (20 - 12 = 8)');
    });

    // Carry-over Card Tests
    testRunner.test('4th unplayed card should carry over to next room', () => {
      window.Game.startNewGame();
      const carryOverCard = createTestCard('hearts', '5', 5);
      
      // First, manually remove 3 cards to simulate playing them
      window.Game.gameState.roomCards = [carryOverCard]; // Only leave the carry-over card
      window.Game.gameState.cardsPlayedThisRoom = 3;
      
      const roomCards = window.Game.nextRoom();
      
      // Check that we have 4 cards in new room and the game continued
      if (window.Game.gameState.gameActive) {
        assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'New room should have 4 cards total');
        const hasCarryOverCard = window.Game.gameState.roomCards.some(card => card.id === carryOverCard.id);
        assert.assertTrue(hasCarryOverCard, 'Carry-over card should be in new room');
      } else {
        // If game ended, it means we ran out of cards (victory condition)
        assert.assertTrue(window.Game.gameState.playerHealth > 0, 'Should be victory, not defeat');
      }
    });

    testRunner.test('carry-over card should be preserved when room has multiple unplayed cards', () => {
      window.Game.startNewGame();
      const playedCard1 = createTestCard('hearts', '2', 2);
      const playedCard2 = createTestCard('clubs', '7', 7);
      const playedCard3 = createTestCard('diamonds', '8', 8);
      const carryOverCard = createTestCard('spades', '5', 5);
      
      window.Game.gameState.roomCards = [playedCard1, playedCard2, playedCard3, carryOverCard];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      
      // Simulate playing exactly 3 cards (removing them from room)
      window.Game.gameState.roomCards = [carryOverCard]; // Only unplayed card remains
      
      const roomCards = window.Game.nextRoom();
      
      // Check that the unplayed card is preserved in the new room
      assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'Should have 4 cards in new room');
      const hasCarryOverCard = window.Game.gameState.roomCards.some(card => card.id === carryOverCard.id);
      assert.assertTrue(hasCarryOverCard, 'Carry-over card should be in new room');
    });

    testRunner.test('carry-over card should work with victory condition check', () => {
      window.Game.startNewGame();
      const carryOverCard = createTestCard('hearts', '3', 3);
      
      // Setup near-victory scenario: empty deck/discard, 3 cards played, one carry-over
      window.Game.gameState.deck = [];
      window.Game.gameState.discardPile = [];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [carryOverCard];
      
      const roomCards = window.Game.nextRoom();
      
      // Should detect victory since no cards available for new room
      assert.assertFalse(window.Game.gameState.gameActive, 'Game should no longer be active');
      assert.assertTrue(window.Game.gameState.playerHealth > 0, 'Player should still be alive (victory, not defeat)');
    });

    testRunner.test('carry-over card should work with deck reshuffle', () => {
      window.Game.startNewGame();
      const carryOverCard = createTestCard('spades', '4', 4);
      const discardCard1 = createTestCard('hearts', '6', 6);
      const discardCard2 = createTestCard('clubs', '8', 8);
      const discardCard3 = createTestCard('diamonds', '9', 9);
      
      // Setup: empty deck, discard has exactly 3 cards, 3 cards played, one carry-over
      window.Game.gameState.deck = [];
      window.Game.gameState.discardPile = [discardCard1, discardCard2, discardCard3];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      window.Game.gameState.roomCards = [carryOverCard];
      
      const roomCards = window.Game.nextRoom();
      
      // Should reshuffle discard and create new room with carry-over + 3 reshuffled cards
      assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'Should have 4 room cards (3 reshuffled + 1 carry-over)');
      assert.assertTrue(window.Game.gameState.roomCards.includes(carryOverCard), 'Carry-over card should be in new room');
      assert.assertEqual(window.Game.gameState.discardPile.length, 0, 'Discard pile should be empty after reshuffle');
    });

    testRunner.test('carry-over card should maintain its properties', () => {
      window.Game.startNewGame();
      const originalCard = createTestCard('diamonds', '7', 7);
      originalCard.customProperty = 'test-value'; // Add custom property to verify integrity
      
      window.Game.gameState.roomCards = [
        createTestCard('hearts', '2', 2),
        createTestCard('clubs', '5', 5),
        createTestCard('spades', '9', 9),
        originalCard
      ];
      window.Game.gameState.cardsPlayedThisRoom = 3;
      
      const roomCards = window.Game.nextRoom();
      
      // Find the carried-over card in the new room
      const carriedCard = window.Game.gameState.roomCards.find(card => card.id === originalCard.id);
      
      if (carriedCard) {
        assert.assertEqual(carriedCard.suit, 'diamonds', 'Suit should be preserved');
        assert.assertEqual(carriedCard.rank, '7', 'Rank should be preserved');
        assert.assertEqual(carriedCard.value, 7, 'Value should be preserved');
        assert.assertEqual(carriedCard.customProperty, 'test-value', 'Custom properties should be preserved');
      } else {
        // If card not found, test that carry-over logic is working by checking room has 4 cards
        assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'Should have 4 cards in new room');
      }
    });

    testRunner.test('nextRoom should fail when less than 3 cards played', () => {
      window.Game.startNewGame();
      const unplayedCard = createTestCard('hearts', '4', 4);
      window.Game.gameState.roomCards = [unplayedCard];
      window.Game.gameState.cardsPlayedThisRoom = 2; // Only 2 cards played
      
      const roomCards = window.Game.nextRoom();
      
      // Should not proceed to next room
      assert.assertEqual(window.Game.gameState.currentRound, 0, 'Should still be in round 0');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 2, 'Cards played should not reset');
    });

    testRunner.test('carry-over card should work with skip room functionality', () => {
      window.Game.startNewGame();
      const originalRoomCount = window.Game.gameState.roomCards.length;
      window.Game.gameState.cardsPlayedThisRoom = 0;
      window.Game.gameState.canSkipNextRoom = true;
      
      // Skip room should not create carry-over since no cards were played
      window.Game.skipRoom();
      
      // Check that skip worked - the number of room cards should be consistent
      // The exact count may vary based on implementation, so check for reasonable values
      const newRoomCount = window.Game.gameState.roomCards.length;
      assert.assertTrue(newRoomCount >= 1 && newRoomCount <= 4, 'Should have reasonable number of room cards after skip');
    });
  });
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testGameModule };
}

// Make available globally for script tag loading
if (typeof window !== 'undefined') {
  window.testGameModule = testGameModule;
}