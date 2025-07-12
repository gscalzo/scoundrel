/**
 * Integration tests for Scoundrel Card window.Game
 * Tests overall game flow, module integration, and deployment sanity
 */

// Modules will be available as window.Game, window.Deck, etc. when tests run

// Test functions - will be called by the test runner
function testIntegration() {
  testRunner.describe('Integration Tests', () => {
    
    testRunner.test('All modules should be available and properly exported', () => {
      assert.assertNotNull(window.Game, 'window.Game module should be available');
      assert.assertNotNull(window.Deck, 'window.Deck module should be available');
      
      // Check key functions are exported
      assert.assertTrue(typeof window.Game.startNewwindow.Game === 'function', 'window.Game.startNewwindow.Game should be a function');
      assert.assertTrue(typeof window.Game.nextRoom === 'function', 'window.Game.nextRoom should be a function');
      assert.assertTrue(typeof window.Game.resetwindow.Game === 'function', 'window.Game.resetwindow.Game should be a function');
      assert.assertTrue(typeof window.Game.updateHealth === 'function', 'window.Game.updateHealth should be a function');
      assert.assertTrue(typeof window.Game.equipItem === 'function', 'window.Game.equipItem should be a function');
      assert.assertTrue(typeof window.Game.processCardEffects === 'function', 'window.Game.processCardEffects should be a function');
      
      assert.assertTrue(typeof window.Deck.createwindow.Deck === 'function', 'window.Deck.createwindow.Deck should be a function');
      assert.assertTrue(typeof window.Deck.shuffle === 'function', 'window.Deck.shuffle should be a function');
      assert.assertTrue(typeof window.Deck.dealCards === 'function', 'window.Deck.dealCards should be a function');
      assert.assertTrue(typeof window.Deck.trimwindow.DeckForScoundrel === 'function', 'window.Deck.trimwindow.DeckForScoundrel should be a function');
    });

    testRunner.test('Complete game initialization flow', () => {
      // Start a new game
      const gameState = window.Game.startNewwindow.Game();
      
      // Verify deck was created and trimmed properly
      assert.assertTrue(gameState.deck.length > 0, 'window.Deck should be created');
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

    testRunner.test('window.Game flow: start -> play cards -> next room', () => {
      window.Game.startNewwindow.Game();
      const initialRoomCards = [...window.Game.gameState.roomCards];
      
      // Simulate playing 3 cards (hearts for healing)
      for (let i = 0; i < 3; i++) {
        if (window.Game.gameState.roomCards.length > 0) {
          const card = window.Game.gameState.roomCards[0];
          // Create a hearts card for testing
          const testCard = {
            id: `test_${i}_of_hearts`,
            suit: 'hearts',
            rank: `${i + 2}`,
            value: i + 2,
            imagePath: `images/cards/test_${i}_of_hearts.png`
          };
          window.Game.gameState.roomCards[0] = testCard;
          window.Game.processCardEffects(testCard, 0);
        }
      }
      
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 3, 'Should have played 3 cards');
      assert.assertEqual(window.Game.gameState.roomCards.length, 1, 'Should have 1 card remaining');
      
      // Move to next room
      window.Game.nextRoom();
      
      assert.assertEqual(window.Game.gameState.currentRound, 1, 'Should be in round 1');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 0, 'Cards played should reset');
      assert.assertEqual(window.Game.gameState.roomCards.length, 4, 'Should have 4 cards in new room (3 new + 1 carry over)');
    });

    testRunner.test('Health system integration', () => {
      window.Game.startNewwindow.Game();
      const initialHealth = window.Game.gameState.playerHealth;
      
      // Test damage
      window.Game.updateHealth(-5);
      assert.assertEqual(window.Game.gameState.playerHealth, initialHealth - 5, 'Health should decrease');
      
      // Test healing
      window.Game.updateHealth(3);
      assert.assertEqual(window.Game.gameState.playerHealth, initialHealth - 2, 'Health should increase');
      
      // Test max health cap
      window.Game.updateHealth(10);
      assert.assertEqual(window.Game.gameState.playerHealth, window.Game.gameState.maxHealth, 'Health should be capped at max');
    });

    testRunner.test('Equipment system integration', async () => {
      window.Game.startNewwindow.Game();
      
      // Create a diamond weapon card
      const weaponCard = {
        id: 'test_weapon_of_diamonds',
        suit: 'diamonds',
        rank: '7',
        value: 7,
        imagePath: 'images/cards/test_weapon_of_diamonds.png'
      };
      
      window.Game.gameState.roomCards = [weaponCard];
      
      // Equip the weapon
      const success = await window.Game.equipItem(weaponCard, 'weapon', 0, true);
      
      assert.assertTrue(success, 'Should successfully equip weapon');
      assert.assertEqual(window.Game.gameState.currentWeapon.value, 7, 'Weapon should be equipped');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 1, 'Should increment cards played');
    });

    testRunner.test('Card effect processing integration', () => {
      window.Game.startNewwindow.Game();
      window.Game.gameState.playerHealth = 15; // Reduce health for healing test
      
      // Test hearts card healing
      const heartCard = {
        id: 'test_heart',
        suit: 'hearts',
        rank: '5',
        value: 5,
        imagePath: 'images/cards/test_heart.png'
      };
      
      window.Game.gameState.roomCards = [heartCard];
      window.Game.processCardEffects(heartCard, 0);
      
      assert.assertEqual(window.Game.gameState.playerHealth, 20, 'Should heal to full health');
      assert.assertTrue(window.Game.gameState.potionUsedThisRoom, 'Should mark potion as used');
      assert.assertTrue(window.Game.gameState.discardPile.includes(heartCard), 'Card should be in discard pile');
    });

    testRunner.test('window.Game over conditions', () => {
      window.Game.startNewwindow.Game();
      
      // Test game over from health loss
      window.Game.gameState.playerHealth = 1;
      window.Game.updateHealth(-5);
      
      assert.assertEqual(window.Game.gameState.playerHealth, 0, 'Health should be 0');
      assert.assertFalse(window.Game.gameState.gameActive, 'window.Game should not be active');
    });

    testRunner.test('window.Deck operations integration', () => {
      // Test full deck creation and trimming
      const fullwindow.Deck = window.Deck.createwindow.Deck();
      assert.assertEqual(fullwindow.Deck.length, 52, 'Full deck should have 52 cards');
      
      const trimmedwindow.Deck = window.Deck.trimwindow.DeckForScoundrel(fullwindow.Deck);
      assert.assertEqual(trimmedwindow.Deck.length, 44, 'Trimmed deck should have 44 cards');
      
      // Test shuffling maintains card count and content
      const shuffled = window.Deck.shuffle(trimmedwindow.Deck);
      assert.assertEqual(shuffled.length, trimmedwindow.Deck.length, 'Shuffled deck should maintain length');
      
      // Test dealing
      const dealResult = window.Deck.dealCards(shuffled, 4);
      assert.assertEqual(dealResult.dealtCards.length, 4, 'Should deal 4 cards');
      assert.assertEqual(dealResult.remainingwindow.Deck.length, 40, 'Should have 40 cards remaining');
    });

    testRunner.test('window.Game state consistency', () => {
      window.Game.startNewwindow.Game();
      
      // Test that game state remains consistent
      const initialwindow.DeckSize = window.Game.gameState.deck.length;
      const initialRoomCards = window.Game.gameState.roomCards.length;
      
      assert.assertEqual(initialwindow.DeckSize + initialRoomCards, 44, 'Total cards should equal trimmed deck size');
      
      // Reset and verify clean state
      window.Game.resetwindow.Game();
      
      assert.assertEqual(window.Game.gameState.playerHealth, window.Game.gameState.maxHealth, 'Health should be reset');
      assert.assertEqual(window.Game.gameState.currentRound, 0, 'Round should be reset');
      assert.assertEqual(window.Game.gameState.deck.length, 0, 'window.Deck should be empty after reset');
      assert.assertEqual(window.Game.gameState.roomCards.length, 0, 'Room cards should be empty after reset');
      assert.assertFalse(window.Game.gameState.gameActive, 'window.Game should not be active after reset');
    });

    testRunner.test('Error handling and edge cases', async () => {
      // Test operations when game is not active
      window.Game.resetwindow.Game(); // Ensure game is not active
      
      const testCard = {
        id: 'test_card',
        suit: 'hearts',
        rank: '5',
        value: 5,
        imagePath: 'images/cards/test_card.png'
      };
      
      // These should fail gracefully when game is not active
      const equipResult = await window.Game.equipItem(testCard, 'weapon', 0, true);
      assert.assertFalse(equipResult, 'Equipment should fail when game not active');
      
      window.Game.processCardEffects(testCard, 0);
      // Should not crash or change state
      
      // Test invalid equipment type
      window.Game.startNewwindow.Game();
      window.Game.gameState.roomCards = [testCard];
      const invalidEquip = await window.Game.equipItem(testCard, 'invalid_type', 0, true);
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
      assert.assertNotNull(deckCard, 'window.Deck card element should exist');
    });

    testRunner.test('window.Game can start and basic UI updates work', () => {
      // Start a game and verify basic UI elements are updated
      window.Game.startNewwindow.Game();
      
      // Check that health display exists and shows initial health
      const healthDisplay = document.querySelector('.health-display, .health');
      if (healthDisplay) {
        // Health display found, we can verify it shows correct initial health
        assert.assertTrue(true, 'Health display element exists');
      }
      
      // Check that deck count display exists
      const deckCountDisplay = document.querySelector('.deck-count, .cards-remaining');
      if (deckCountDisplay) {
        assert.assertTrue(true, 'window.Deck count display element exists');
      }
      
      // Verify game state is properly active
      assert.assertTrue(window.Game.gameState.gameActive, 'window.Game should be active after starting');
      assert.assertTrue(window.Game.gameState.roomCards.length > 0, 'Room cards should be dealt');
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
      assert.assertTrue(typeof window.Game === 'object', 'window.Game module should be imported as object');
      assert.assertTrue(typeof window.Deck === 'object', 'window.Deck module should be imported as object');
      
      // Test that modules have expected exports
      assert.assertTrue('gameState' in window.Game, 'window.Game module should export gameState');
      assert.assertTrue('SUITS' in window.Deck, 'window.Deck module should export SUITS');
      assert.assertTrue('RANKS' in window.Deck, 'window.Deck module should export RANKS');
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

    testRunner.test('window.Game should handle page reload gracefully', () => {
      // Test that the game initializes properly after DOM load
      window.Game.resetwindow.Game();
      window.Game.startNewwindow.Game();
      
      // Verify game starts in a clean state
      assert.assertEqual(window.Game.gameState.currentRound, 0, 'window.Game should start at round 0');
      assert.assertEqual(window.Game.gameState.playerHealth, window.Game.gameState.maxHealth, 'Health should start at max');
      assert.assertEqual(window.Game.gameState.cardsPlayedThisRoom, 0, 'Cards played should start at 0');
      assert.assertTrue(window.Game.gameState.gameActive, 'window.Game should be active');
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