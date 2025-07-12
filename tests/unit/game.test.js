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