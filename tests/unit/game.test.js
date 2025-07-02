/**
 * Unit tests for Game module
 * Tests game state management, health system, equipment, and card processing
 */

// Mock the Game module for testing - we'll import it in the test HTML
let Game;
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
      const initialState = Game.startNewGame();
      
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
      Game.startNewGame();
      Game.gameState.playerHealth = 15; // Set to less than max
      
      const healthChange = Game.updateHealth(3);
      
      assert.assertEqual(healthChange, 3, 'Should return the health change amount');
      assert.assertEqual(Game.gameState.playerHealth, 18, 'Health should increase to 18');
    });

    testRunner.test('updateHealth should not exceed max health', () => {
      Game.startNewGame();
      Game.gameState.playerHealth = 18;
      
      const healthChange = Game.updateHealth(5);
      
      assert.assertEqual(healthChange, 2, 'Should only increase by 2 to reach max');
      assert.assertEqual(Game.gameState.playerHealth, 20, 'Health should be capped at max');
    });

    testRunner.test('updateHealth should decrease health correctly', () => {
      Game.startNewGame();
      
      const healthChange = Game.updateHealth(-5);
      
      assert.assertEqual(healthChange, -5, 'Should return negative health change');
      assert.assertEqual(Game.gameState.playerHealth, 15, 'Health should decrease to 15');
    });

    testRunner.test('updateHealth should not go below 0', () => {
      Game.startNewGame();
      Game.gameState.playerHealth = 3;
      
      const healthChange = Game.updateHealth(-10);
      
      assert.assertEqual(healthChange, -3, 'Should only decrease by available health');
      assert.assertEqual(Game.gameState.playerHealth, 0, 'Health should not go below 0');
      assert.assertFalse(Game.gameState.gameActive, 'Game should end when health reaches 0');
    });

    testRunner.test('resetGame should reset all game state', () => {
      Game.startNewGame();
      Game.gameState.playerHealth = 10;
      Game.gameState.currentWeapon = createTestCard('diamonds', '5', 5);
      Game.gameState.currentRound = 3;
      Game.gameState.score = 100;
      
      const resetState = Game.resetGame();
      
      assert.assertEqual(resetState.playerHealth, 20, 'Health should be reset');
      assert.assertEqual(resetState.currentWeapon, null, 'Weapon should be null');
      assert.assertEqual(resetState.currentRound, 0, 'Round should be 0');
      assert.assertEqual(resetState.score, 0, 'Score should be 0');
      assert.assertFalse(resetState.gameActive, 'Game should not be active');
      assert.assertEqual(resetState.cardsPlayedThisRoom, 0, 'Cards played should be 0');
    });

    testRunner.test('equipItem should equip diamond as weapon', () => {
      Game.startNewGame();
      const diamondCard = createTestCard('diamonds', '7', 7);
      Game.gameState.roomCards = [diamondCard];
      
      const success = Game.equipItem(diamondCard, 'weapon', 0);
      
      assert.assertTrue(success, 'Should successfully equip diamond');
      assert.assertEqual(Game.gameState.currentWeapon.suit, 'diamonds', 'Should equip diamond as weapon');
      assert.assertEqual(Game.gameState.currentWeapon.value, 7, 'Should have correct weapon value');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 1, 'Should increment cards played');
    });

    testRunner.test('equipItem should reject non-diamond cards as weapons', () => {
      Game.startNewGame();
      const heartCard = createTestCard('hearts', '5', 5);
      Game.gameState.roomCards = [heartCard];
      
      const success = Game.equipItem(heartCard, 'weapon', 0);
      
      assert.assertFalse(success, 'Should not equip heart as weapon');
      assert.assertEqual(Game.gameState.currentWeapon, null, 'Should not have weapon equipped');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 0, 'Should not increment cards played');
    });

    testRunner.test('equipItem should replace existing weapon', () => {
      Game.startNewGame();
      const firstWeapon = createTestCard('diamonds', '3', 3);
      const secondWeapon = createTestCard('diamonds', '8', 8);
      Game.gameState.roomCards = [firstWeapon, secondWeapon];
      Game.gameState.currentWeapon = firstWeapon;
      
      const success = Game.equipItem(secondWeapon, 'weapon', 1);
      
      assert.assertTrue(success, 'Should successfully replace weapon');
      assert.assertEqual(Game.gameState.currentWeapon.value, 8, 'Should have new weapon');
      assert.assertTrue(Game.gameState.discardPile.includes(firstWeapon), 'Old weapon should be in discard pile');
    });

    testRunner.test('equipItem should not work when 3 cards already played', () => {
      Game.startNewGame();
      const diamondCard = createTestCard('diamonds', '7', 7);
      Game.gameState.roomCards = [diamondCard];
      Game.gameState.cardsPlayedThisRoom = 3;
      
      const success = Game.equipItem(diamondCard, 'weapon', 0);
      
      assert.assertFalse(success, 'Should not equip when 3 cards already played');
      assert.assertEqual(Game.gameState.currentWeapon, null, 'Should not have weapon equipped');
    });

    testRunner.test('equipItem should not work when game not active', () => {
      Game.startNewGame();
      Game.gameState.gameActive = false;
      const diamondCard = createTestCard('diamonds', '7', 7);
      
      const success = Game.equipItem(diamondCard, 'weapon', 0);
      
      assert.assertFalse(success, 'Should not equip when game not active');
    });

    testRunner.test('nextRoom should require exactly 3 cards played', () => {
      Game.startNewGame();
      Game.gameState.cardsPlayedThisRoom = 2;
      
      const roomCards = Game.nextRoom();
      
      // Should not proceed to next room
      assert.assertEqual(Game.gameState.currentRound, 0, 'Should still be in round 0');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 2, 'Cards played should not reset');
    });

    testRunner.test('nextRoom should proceed when 3 cards played', () => {
      Game.startNewGame();
      Game.gameState.cardsPlayedThisRoom = 3;
      Game.gameState.roomCards = [createTestCard('hearts', '2', 2)]; // One card to carry over
      
      const roomCards = Game.nextRoom();
      
      assert.assertEqual(Game.gameState.currentRound, 1, 'Should advance to round 1');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 0, 'Cards played should reset');
      assert.assertFalse(Game.gameState.potionUsedThisRoom, 'Potion usage should reset');
    });

    testRunner.test('getCardsPlayedThisRoom should return correct count', () => {
      Game.startNewGame();
      Game.gameState.cardsPlayedThisRoom = 2;
      
      const count = Game.getCardsPlayedThisRoom();
      
      assert.assertEqual(count, 2, 'Should return current cards played count');
    });

    testRunner.test('processCardEffects should handle hearts card healing', () => {
      Game.startNewGame();
      Game.gameState.playerHealth = 15;
      const heartCard = createTestCard('hearts', '5', 5);
      Game.gameState.roomCards = [heartCard];
      
      Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(Game.gameState.playerHealth, 20, 'Should heal player');
      assert.assertTrue(Game.gameState.potionUsedThisRoom, 'Should mark potion as used');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 1, 'Should increment cards played');
      assert.assertTrue(Game.gameState.discardPile.includes(heartCard), 'Heart card should be discarded');
    });

    testRunner.test('processCardEffects should not heal on second potion in room', () => {
      Game.startNewGame();
      Game.gameState.playerHealth = 15;
      Game.gameState.potionUsedThisRoom = true;
      const heartCard = createTestCard('hearts', '3', 3);
      Game.gameState.roomCards = [heartCard];
      
      Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(Game.gameState.playerHealth, 15, 'Should not heal on second potion');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 1, 'Should still increment cards played');
      assert.assertTrue(Game.gameState.discardPile.includes(heartCard), 'Heart card should still be discarded');
    });

    testRunner.test('processCardEffects should not work when 3 cards already played', () => {
      Game.startNewGame();
      const heartCard = createTestCard('hearts', '5', 5);
      Game.gameState.roomCards = [heartCard];
      Game.gameState.cardsPlayedThisRoom = 3;
      
      Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 3, 'Should not increment cards played');
      assert.assertEqual(Game.gameState.roomCards.length, 1, 'Card should not be removed from room');
    });

    testRunner.test('processCardEffects should not work when game not active', () => {
      Game.startNewGame();
      Game.gameState.gameActive = false;
      const heartCard = createTestCard('hearts', '5', 5);
      
      Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 0, 'Should not process when game not active');
    });
  });
}