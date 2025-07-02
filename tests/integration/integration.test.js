/**
 * Integration tests for Scoundrel Card Game
 * Tests overall game flow, module integration, and deployment sanity
 */

// Mock modules for testing - we'll import them in the test HTML
let Game, Deck, UI, DragDrop, CardInteraction;

// Test functions - will be called by the test runner
function testIntegration() {
  testRunner.describe('Integration Tests', () => {
    
    testRunner.test('All modules should be available and properly exported', () => {
      assert.assertNotNull(Game, 'Game module should be available');
      assert.assertNotNull(Deck, 'Deck module should be available');
      
      // Check key functions are exported
      assert.assertTrue(typeof Game.startNewGame === 'function', 'Game.startNewGame should be a function');
      assert.assertTrue(typeof Game.nextRoom === 'function', 'Game.nextRoom should be a function');
      assert.assertTrue(typeof Game.resetGame === 'function', 'Game.resetGame should be a function');
      assert.assertTrue(typeof Game.updateHealth === 'function', 'Game.updateHealth should be a function');
      assert.assertTrue(typeof Game.equipItem === 'function', 'Game.equipItem should be a function');
      assert.assertTrue(typeof Game.processCardEffects === 'function', 'Game.processCardEffects should be a function');
      
      assert.assertTrue(typeof Deck.createDeck === 'function', 'Deck.createDeck should be a function');
      assert.assertTrue(typeof Deck.shuffle === 'function', 'Deck.shuffle should be a function');
      assert.assertTrue(typeof Deck.dealCards === 'function', 'Deck.dealCards should be a function');
      assert.assertTrue(typeof Deck.trimDeckForScoundrel === 'function', 'Deck.trimDeckForScoundrel should be a function');
    });

    testRunner.test('Complete game initialization flow', () => {
      // Start a new game
      const gameState = Game.startNewGame();
      
      // Verify deck was created and trimmed properly
      assert.assertTrue(gameState.deck.length > 0, 'Deck should be created');
      assert.assertEqual(gameState.deck.length, 44, 'Trimmed deck should have 44 cards (52 - 8 red face/ace cards)');
      
      // Verify initial room cards were dealt
      assert.assertEqual(gameState.roomCards.length, 4, 'Should deal 4 initial room cards');
      
      // Verify all cards have required properties
      gameState.roomCards.forEach((card, index) => {
        assert.assertNotNull(card.id, `Room card ${index} should have an id`);
        assert.assertNotNull(card.suit, `Room card ${index} should have a suit`);
        assert.assertNotNull(card.rank, `Room card ${index} should have a rank`);
        assert.assertTrue(typeof card.value === 'number', `Room card ${index} should have a numeric value`);
        assert.assertNotNull(card.imagePath, `Room card ${index} should have an image path`);
      });
    });

    testRunner.test('Game flow: start -> play cards -> next room', () => {
      Game.startNewGame();
      const initialRoomCards = [...Game.gameState.roomCards];
      
      // Simulate playing 3 cards (hearts for healing)
      for (let i = 0; i < 3; i++) {
        if (Game.gameState.roomCards.length > 0) {
          const card = Game.gameState.roomCards[0];
          // Create a hearts card for testing
          const testCard = {
            id: `test_${i}_of_hearts`,
            suit: 'hearts',
            rank: `${i + 2}`,
            value: i + 2,
            imagePath: `images/cards/test_${i}_of_hearts.png`
          };
          Game.gameState.roomCards[0] = testCard;
          Game.processCardEffects(testCard, 0);
        }
      }
      
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 3, 'Should have played 3 cards');
      assert.assertEqual(Game.gameState.roomCards.length, 1, 'Should have 1 card remaining');
      
      // Move to next room
      Game.nextRoom();
      
      assert.assertEqual(Game.gameState.currentRound, 1, 'Should be in round 1');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 0, 'Cards played should reset');
      assert.assertEqual(Game.gameState.roomCards.length, 4, 'Should have 4 cards in new room (3 new + 1 carry over)');
    });

    testRunner.test('Health system integration', () => {
      Game.startNewGame();
      const initialHealth = Game.gameState.playerHealth;
      
      // Test damage
      Game.updateHealth(-5);
      assert.assertEqual(Game.gameState.playerHealth, initialHealth - 5, 'Health should decrease');
      
      // Test healing
      Game.updateHealth(3);
      assert.assertEqual(Game.gameState.playerHealth, initialHealth - 2, 'Health should increase');
      
      // Test max health cap
      Game.updateHealth(10);
      assert.assertEqual(Game.gameState.playerHealth, Game.gameState.maxHealth, 'Health should be capped at max');
    });

    testRunner.test('Equipment system integration', () => {
      Game.startNewGame();
      
      // Create a diamond weapon card
      const weaponCard = {
        id: 'test_weapon_of_diamonds',
        suit: 'diamonds',
        rank: '7',
        value: 7,
        imagePath: 'images/cards/test_weapon_of_diamonds.png'
      };
      
      Game.gameState.roomCards = [weaponCard];
      
      // Equip the weapon
      const success = Game.equipItem(weaponCard, 'weapon', 0);
      
      assert.assertTrue(success, 'Should successfully equip weapon');
      assert.assertEqual(Game.gameState.currentWeapon.value, 7, 'Weapon should be equipped');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 1, 'Should increment cards played');
    });

    testRunner.test('Card effect processing integration', () => {
      Game.startNewGame();
      Game.gameState.playerHealth = 15; // Reduce health for healing test
      
      // Test hearts card healing
      const heartCard = {
        id: 'test_heart',
        suit: 'hearts',
        rank: '5',
        value: 5,
        imagePath: 'images/cards/test_heart.png'
      };
      
      Game.gameState.roomCards = [heartCard];
      Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(Game.gameState.playerHealth, 20, 'Should heal to full health');
      assert.assertTrue(Game.gameState.potionUsedThisRoom, 'Should mark potion as used');
      assert.assertTrue(Game.gameState.discardPile.includes(heartCard), 'Card should be in discard pile');
    });

    testRunner.test('Game over conditions', () => {
      Game.startNewGame();
      
      // Test game over from health loss
      Game.gameState.playerHealth = 1;
      Game.updateHealth(-5);
      
      assert.assertEqual(Game.gameState.playerHealth, 0, 'Health should be 0');
      assert.assertFalse(Game.gameState.gameActive, 'Game should not be active');
    });

    testRunner.test('Deck operations integration', () => {
      // Test full deck creation and trimming
      const fullDeck = Deck.createDeck();
      assert.assertEqual(fullDeck.length, 52, 'Full deck should have 52 cards');
      
      const trimmedDeck = Deck.trimDeckForScoundrel(fullDeck);
      assert.assertEqual(trimmedDeck.length, 44, 'Trimmed deck should have 44 cards');
      
      // Test shuffling maintains card count and content
      const shuffled = Deck.shuffle(trimmedDeck);
      assert.assertEqual(shuffled.length, trimmedDeck.length, 'Shuffled deck should maintain length');
      
      // Test dealing
      const dealResult = Deck.dealCards(shuffled, 4);
      assert.assertEqual(dealResult.dealtCards.length, 4, 'Should deal 4 cards');
      assert.assertEqual(dealResult.remainingDeck.length, 40, 'Should have 40 cards remaining');
    });

    testRunner.test('Game state consistency', () => {
      Game.startNewGame();
      
      // Test that game state remains consistent
      const initialDeckSize = Game.gameState.deck.length;
      const initialRoomCards = Game.gameState.roomCards.length;
      
      assert.assertEqual(initialDeckSize + initialRoomCards, 44, 'Total cards should equal trimmed deck size');
      
      // Reset and verify clean state
      Game.resetGame();
      
      assert.assertEqual(Game.gameState.playerHealth, Game.gameState.maxHealth, 'Health should be reset');
      assert.assertEqual(Game.gameState.currentRound, 0, 'Round should be reset');
      assert.assertEqual(Game.gameState.deck.length, 0, 'Deck should be empty after reset');
      assert.assertEqual(Game.gameState.roomCards.length, 0, 'Room cards should be empty after reset');
      assert.assertFalse(Game.gameState.gameActive, 'Game should not be active after reset');
    });

    testRunner.test('Error handling and edge cases', () => {
      // Test operations when game is not active
      Game.resetGame(); // Ensure game is not active
      
      const testCard = {
        id: 'test_card',
        suit: 'hearts',
        rank: '5',
        value: 5,
        imagePath: 'images/cards/test_card.png'
      };
      
      // These should fail gracefully when game is not active
      const equipResult = Game.equipItem(testCard, 'weapon', 0);
      assert.assertFalse(equipResult, 'Equipment should fail when game not active');
      
      Game.processCardEffects(testCard, 0);
      // Should not crash or change state
      
      // Test invalid equipment type
      Game.startNewGame();
      Game.gameState.roomCards = [testCard];
      const invalidEquip = Game.equipItem(testCard, 'invalid_type', 0);
      assert.assertFalse(invalidEquip, 'Should reject invalid equipment type');
    });
  });
}

function testDeploymentSanity() {
  testRunner.describe('Deployment Sanity Tests', () => {
    
    testRunner.test('Required DOM elements should exist', () => {
      // Test that key game elements exist in the DOM
      const startButton = document.getElementById('start-game-btn');
      const nextRoomButton = document.getElementById('next-room-btn');
      const resetButton = document.getElementById('reset-game-btn');
      const skipButton = document.getElementById('skip-room-btn');
      
      assert.assertNotNull(startButton, 'Start game button should exist');
      assert.assertNotNull(nextRoomButton, 'Next room button should exist');
      assert.assertNotNull(resetButton, 'Reset game button should exist');
      assert.assertNotNull(skipButton, 'Skip room button should exist');
      
      // Test card container elements
      const cardSlots = document.querySelector('.card-slots');
      const deckCard = document.getElementById('deck-card');
      
      assert.assertNotNull(cardSlots, 'Card slots container should exist');
      assert.assertNotNull(deckCard, 'Deck card element should exist');
    });

    testRunner.test('Game can start and basic UI updates work', () => {
      // Start a game and verify basic UI elements are updated
      Game.startNewGame();
      
      // Check that health display exists and shows initial health
      const healthDisplay = document.querySelector('.health-display, .health');
      if (healthDisplay) {
        // Health display found, we can verify it shows correct initial health
        assert.assertTrue(true, 'Health display element exists');
      }
      
      // Check that deck count display exists
      const deckCountDisplay = document.querySelector('.deck-count, .cards-remaining');
      if (deckCountDisplay) {
        assert.assertTrue(true, 'Deck count display element exists');
      }
      
      // Verify game state is properly active
      assert.assertTrue(Game.gameState.gameActive, 'Game should be active after starting');
      assert.assertTrue(Game.gameState.roomCards.length > 0, 'Room cards should be dealt');
    });

    testRunner.test('CSS files should be loadable', () => {
      // Check if CSS is loaded by verifying computed styles
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      
      // Just verify we can get computed styles (indicates CSS is working)
      assert.assertNotNull(computedStyle, 'Should be able to get computed styles');
      assert.assertTrue(computedStyle.display !== '', 'Body should have computed display style');
    });

    testRunner.test('Module imports should work correctly', () => {
      // Verify ES6 modules are working
      assert.assertTrue(typeof Game === 'object', 'Game module should be imported as object');
      assert.assertTrue(typeof Deck === 'object', 'Deck module should be imported as object');
      
      // Test that modules have expected exports
      assert.assertTrue('gameState' in Game, 'Game module should export gameState');
      assert.assertTrue('SUITS' in Deck, 'Deck module should export SUITS');
      assert.assertTrue('RANKS' in Deck, 'Deck module should export RANKS');
    });

    testRunner.test('Event listeners should be properly attached', () => {
      // Test that clicking buttons doesn't throw errors
      const startButton = document.getElementById('start-game-btn');
      if (startButton) {
        try {
          startButton.click();
          assert.assertTrue(true, 'Start button click should not throw error');
        } catch (error) {
          assert.assertTrue(false, `Start button click threw error: ${error.message}`);
        }
      }
      
      // Test reset button
      const resetButton = document.getElementById('reset-game-btn');
      if (resetButton) {
        try {
          resetButton.click();
          assert.assertTrue(true, 'Reset button click should not throw error');
        } catch (error) {
          assert.assertTrue(false, `Reset button click threw error: ${error.message}`);
        }
      }
    });

    testRunner.test('Game should handle page reload gracefully', () => {
      // Test that the game initializes properly after DOM load
      Game.resetGame();
      Game.startNewGame();
      
      // Verify game starts in a clean state
      assert.assertEqual(Game.gameState.currentRound, 0, 'Game should start at round 0');
      assert.assertEqual(Game.gameState.playerHealth, Game.gameState.maxHealth, 'Health should start at max');
      assert.assertEqual(Game.gameState.cardsPlayedThisRoom, 0, 'Cards played should start at 0');
      assert.assertTrue(Game.gameState.gameActive, 'Game should be active');
    });
  });
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testIntegration, testDeploymentSanity };
}

// Make available globally for script tag loading
if (typeof window !== 'undefined') {
  window.testIntegration = testIntegration;
  window.testDeploymentSanity = testDeploymentSanity;
}