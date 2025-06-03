/**
 * Card management module for Scoundrel game
 * Contains card definitions, deck operations, and related utilities
 * 
 * Note: This module uses the enhanced version of face cards (originally suffixed with '2')
 * which feature more detailed artwork.
 */

// Card definitions
export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
export const RANKS = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

// Mapping of card ranks to their numeric values
export const CARD_VALUES = {
  'ace': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'jack': 11,
  'queen': 12,
  'king': 13
};

/**
 * Creates a standard 52-card deck
 * @returns {Array} Array of card objects
 */
export function createDeck() {
  const deck = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}_of_${suit}`,
        suit,
        rank,
        value: CARD_VALUES[rank],
        imagePath: `images/cards/${rank}_of_${suit}.png`
      });
    }
  }
  
  return deck;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal a specified number of cards from a deck
 * @param {Array} deck - The deck to deal from
 * @param {number} count - Number of cards to deal
 * @returns {Object} Object containing dealt cards and remaining deck
 */
export function dealCards(deck, count) {
  if (count > deck.length) {
    throw new Error(`Cannot deal ${count} cards from a deck of ${deck.length}`);
  }
  
  const dealtCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  
  return { dealtCards, remainingDeck };
}

/**
 * Get image path for card back
 * @returns {string} Path to card back image
 */
export function getCardBackImagePath() {
  return 'card_back.png'; // Using the root-relative path
}
