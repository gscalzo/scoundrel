/**
 * Unit tests for Deck module
 * Tests card creation, shuffling, dealing, and Scoundrel-specific deck operations
 */

// Mock the Deck module for testing - we'll import it in the test HTML
let Deck;

// Test functions - will be called by the test runner
function testDeckModule() {
  testRunner.describe('Deck Module', () => {
    
    testRunner.test('createDeck should create a standard 52-card deck', () => {
      const deck = Deck.createDeck();
      
      assert.assertEqual(deck.length, 52, 'Deck should have 52 cards');
      
      // Check that all suits are present
      const suits = [...new Set(deck.map(card => card.suit))];
      assert.assertEqual(suits.length, 4, 'Should have 4 different suits');
      assert.assertTrue(suits.includes('hearts'), 'Should include hearts');
      assert.assertTrue(suits.includes('diamonds'), 'Should include diamonds');
      assert.assertTrue(suits.includes('clubs'), 'Should include clubs');
      assert.assertTrue(suits.includes('spades'), 'Should include spades');
      
      // Check that all ranks are present
      const ranks = [...new Set(deck.map(card => card.rank))];
      assert.assertEqual(ranks.length, 13, 'Should have 13 different ranks');
      assert.assertTrue(ranks.includes('ace'), 'Should include ace');
      assert.assertTrue(ranks.includes('king'), 'Should include king');
      assert.assertTrue(ranks.includes('queen'), 'Should include queen');
      assert.assertTrue(ranks.includes('jack'), 'Should include jack');
      assert.assertTrue(ranks.includes('2'), 'Should include numbered cards');
    });

    testRunner.test('each card should have correct properties', () => {
      const deck = Deck.createDeck();
      const aceOfSpades = deck.find(card => card.rank === 'ace' && card.suit === 'spades');
      
      assert.assertNotNull(aceOfSpades, 'Ace of spades should exist');
      assert.assertEqual(aceOfSpades.id, 'ace_of_spades', 'Should have correct ID');
      assert.assertEqual(aceOfSpades.value, 1, 'Ace should have value 1');
      assert.assertEqual(aceOfSpades.imagePath, 'images/cards/ace_of_spades.png', 'Should have correct image path');
      
      const kingOfHearts = deck.find(card => card.rank === 'king' && card.suit === 'hearts');
      assert.assertEqual(kingOfHearts.value, 13, 'King should have value 13');
    });

    testRunner.test('shuffle should randomize card order', () => {
      const originalDeck = Deck.createDeck();
      const shuffledDeck = Deck.shuffle(originalDeck);
      
      assert.assertEqual(shuffledDeck.length, originalDeck.length, 'Shuffled deck should have same length');
      
      // Check that it's still the same cards (just reordered)
      const originalIds = originalDeck.map(card => card.id).sort();
      const shuffledIds = shuffledDeck.map(card => card.id).sort();
      assert.assertArrayEqual(shuffledIds, originalIds, 'Should contain same cards after shuffle');
      
      // Original deck should not be modified
      assert.assertEqual(originalDeck[0].id, 'ace_of_clubs', 'Original deck should not be modified');
    });

    testRunner.test('dealCards should deal correct number of cards', () => {
      const deck = Deck.createDeck();
      const result = Deck.dealCards(deck, 5);
      
      assert.assertEqual(result.dealtCards.length, 5, 'Should deal 5 cards');
      assert.assertEqual(result.remainingDeck.length, 47, 'Should have 47 cards remaining');
      
      // Verify dealt cards are from the top of the deck
      for (let i = 0; i < 5; i++) {
        assert.assertEqual(result.dealtCards[i].id, deck[i].id, `Dealt card ${i} should match deck position`);
      }
    });

    testRunner.test('dealCards should throw error when dealing more cards than available', () => {
      const deck = Deck.createDeck();
      
      assert.assertThrows(() => {
        Deck.dealCards(deck, 53);
      }, 'Cannot deal 53 cards from a deck of 52', 'Should throw error when dealing too many cards');
    });

    testRunner.test('trimDeckForScoundrel should remove red face cards and aces', () => {
      const fullDeck = Deck.createDeck();
      const trimmedDeck = Deck.trimDeckForScoundrel(fullDeck);
      
      // Should remove 8 cards: 4 red aces + 4 red face cards (J, Q, K of hearts and diamonds each)
      // Actually it's 8 cards: ace, jack, queen, king of hearts and diamonds = 8 cards
      assert.assertEqual(trimmedDeck.length, 44, 'Trimmed deck should have 44 cards (52 - 8 removed)');
      
      // Check that no red face cards or aces remain
      const redFaceOrAce = trimmedDeck.find(card => {
        const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
        const isFaceOrAce = ['ace', 'jack', 'queen', 'king'].includes(card.rank);
        return isRed && isFaceOrAce;
      });
      
      assert.assertEqual(redFaceOrAce, undefined, 'Should not contain any red face cards or aces');
      
      // Check that black face cards and aces are still present
      const blackAce = trimmedDeck.find(card => card.rank === 'ace' && card.suit === 'spades');
      assert.assertNotNull(blackAce, 'Should still contain black aces');
      
      const blackKing = trimmedDeck.find(card => card.rank === 'king' && card.suit === 'clubs');
      assert.assertNotNull(blackKing, 'Should still contain black face cards');
      
      // Check that numbered red cards are still present
      const redTwo = trimmedDeck.find(card => card.rank === '2' && card.suit === 'hearts');
      assert.assertNotNull(redTwo, 'Should still contain numbered red cards');
    });

    testRunner.test('CARD_VALUES should have correct mappings', () => {
      assert.assertEqual(Deck.CARD_VALUES.ace, 1, 'Ace should have value 1');
      assert.assertEqual(Deck.CARD_VALUES['2'], 2, 'Two should have value 2');
      assert.assertEqual(Deck.CARD_VALUES['10'], 10, 'Ten should have value 10');
      assert.assertEqual(Deck.CARD_VALUES.jack, 11, 'Jack should have value 11');
      assert.assertEqual(Deck.CARD_VALUES.queen, 12, 'Queen should have value 12');
      assert.assertEqual(Deck.CARD_VALUES.king, 13, 'King should have value 13');
    });

    testRunner.test('getCardBackImagePath should return correct path', () => {
      const backPath = Deck.getCardBackImagePath();
      assert.assertEqual(backPath, 'card_back.png', 'Should return correct card back path');
    });

    testRunner.test('SUITS and RANKS constants should be correct', () => {
      assert.assertArrayEqual(Deck.SUITS, ['clubs', 'diamonds', 'hearts', 'spades'], 'SUITS should be correct');
      assert.assertEqual(Deck.RANKS.length, 13, 'Should have 13 ranks');
      assert.assertTrue(Deck.RANKS.includes('ace'), 'RANKS should include ace');
      assert.assertTrue(Deck.RANKS.includes('king'), 'RANKS should include king');
    });
  });
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testDeckModule };
}

// Make available globally for script tag loading
if (typeof window !== 'undefined') {
  window.testDeckModule = testDeckModule;
}