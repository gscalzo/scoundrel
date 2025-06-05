/**
 * Game logic module for Scoundrel card game
 * Manages game state and rules
 */

import * as Deck from "./deck.js";
import * as UI from "./ui.js";

// Game state object
export const gameState = {
  playerHealth: 20,
  maxHealth: 20,
  currentWeapon: null,
  currentArmor: null,
  deck: [],
  roomCards: [],
  discardPile: [],
  currentRound: 0,
  gameActive: false,
  score: 0,
  lastActionWasSkip: false,
  weaponStack: [], // Stack of defeated monsters under the weapon
  cardsPlayedThisRoom: 0, // Track how many cards have been played in the current room
};

/**
 * Start a new game
 */
export function startNewGame() {
  console.log("Game logic: Starting new game");

  // Reset game state
  gameState.playerHealth = gameState.maxHealth;
  gameState.currentWeapon = null;
  gameState.currentArmor = null;
  gameState.currentRound = 0;
  gameState.score = 0;
  gameState.discardPile = [];

  // Create and shuffle a new deck
  const newDeck = Deck.createDeck();
  const trimmedDeck = Deck.trimDeckForScoundrel(newDeck);
  gameState.deck = Deck.shuffle(trimmedDeck);
  console.log(`Created shuffled deck with ${gameState.deck.length} cards`);

  // Deal initial room cards
  dealRoomCards();

  // Mark game as active
  gameState.gameActive = true;

  // Update UI elements
  UI.updateHealthDisplay(gameState.playerHealth, gameState.maxHealth);
  UI.renderEquipment(null, "weapon");
  UI.renderEquipment(null, "armor");
  UI.updateDeckCount(gameState.deck.length);
  UI.updateButtonStates(gameState);

  // Add game start message
  UI.addLogMessage("Game started! Deal with the cards in front of you.");

  return gameState;
}

/**
 * Deal cards for a new room
 * @returns {Array} The cards dealt for the room
 */
export function dealRoomCards() {
  if (gameState.deck.length < 4) {
    // Not enough cards, game over or reshuffle discard pile
    if (gameState.discardPile.length > 0) {
      // Shuffle discard pile back into deck
      gameState.deck = [
        ...gameState.deck,
        ...Deck.shuffle(gameState.discardPile),
      ];
      gameState.discardPile = [];
      UI.addLogMessage("Reshuffled discard pile back into the deck.");
    } else {
      // Game over - no more cards
      gameState.gameActive = false;
      UI.addLogMessage("No more cards! Game over.");
      return [];
    }
  }

  // Deal 4 cards to the room
  const result = Deck.dealCards(gameState.deck, 4);
  gameState.roomCards = result.dealtCards;
  gameState.deck = result.remainingDeck;

  // Update deck count in UI
  UI.updateDeckCount(gameState.deck.length);

  // Display the room cards
  UI.displayRoomCards(gameState.roomCards);
  // Reset cards played counter
  gameState.cardsPlayedThisRoom = 0;
  return gameState.roomCards;
}

/**
 * Move to the next room (deal new cards)
 */
export function nextRoom() {
  console.log("Game logic: Next room");

  // Only proceed if game is active
  if (!gameState.gameActive) {
    UI.addLogMessage("Game is not active. Press Start Game to begin.");
    return;
  }

  // Discard current room cards if any
  if (gameState.roomCards.length > 0) {
    gameState.discardPile.push(...gameState.roomCards);
    gameState.roomCards = [];
  }

  // Increment round counter
  gameState.currentRound++;

  // Deal new room cards
  dealRoomCards();

  // Reset skip flag
  gameState.lastActionWasSkip = false;

  // Update UI
  UI.addLogMessage(`Entered room ${gameState.currentRound}. Be careful!`);

  return gameState.roomCards;
}

/**
 * Reset the game state
 */
export function resetGame() {
  console.log("Game logic: Reset game");

  // Reset game state variables
  gameState.playerHealth = gameState.maxHealth;
  gameState.currentWeapon = null;
  gameState.currentArmor = null;
  gameState.deck = [];
  gameState.roomCards = [];
  gameState.discardPile = [];
  gameState.currentRound = 0;
  gameState.gameActive = false;
  gameState.score = 0;

  // Clear UI
  UI.updateHealthDisplay(gameState.playerHealth, gameState.maxHealth);
  UI.renderEquipment(null, "weapon");
  UI.renderEquipment(null, "armor");
  UI.updateDeckCount(0);
  UI.clearRoomCards();
  UI.updateButtonStates(gameState);

  // Add reset message
  UI.addLogMessage("Game reset. Press 'Start Game' to begin a new adventure.");

  return gameState;
}

/**
 * Update player health
 * @param {number} amount - Amount to change health by (negative for damage)
 */
export function updateHealth(amount) {
  console.log(`Game logic: Health changed by ${amount}`);

  // Calculate new health, clamping between 0 and max
  const newHealth = Math.max(
    0,
    Math.min(gameState.maxHealth, gameState.playerHealth + amount)
  );
  const healthChange = newHealth - gameState.playerHealth;

  // Update the game state
  gameState.playerHealth = newHealth;

  // Update UI
  UI.updateHealthDisplay(gameState.playerHealth, gameState.maxHealth);

  // Add message based on what happened
  if (healthChange > 0) {
    UI.addLogMessage(
      `Gained ${healthChange} health points. Health: ${gameState.playerHealth}/${gameState.maxHealth}`
    );
  } else if (healthChange < 0) {
    UI.addLogMessage(
      `Lost ${Math.abs(healthChange)} health points. Health: ${
        gameState.playerHealth
      }/${gameState.maxHealth}`
    );
  }

  // Check for game over
  if (gameState.playerHealth <= 0) {
    gameOver();
  }

  return healthChange;
}

/**
 * Handle game over
 */
function gameOver() {
  gameState.gameActive = false;

  UI.addLogMessage(
    `GAME OVER! You survived ${gameState.currentRound} rooms and scored ${gameState.score} points.`
  );
  UI.updateButtonStates(gameState);

  // Disable draggable cards
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.setAttribute("draggable", "false");
    card.classList.remove("draggable");
  });
}

/**
 * Equip an item (weapon or armor)
 * @param {Object} card - Card to equip
 * @param {string} type - Type of equipment ('weapon' or 'armor')
 * @param {number} cardIndex - Index of the card in roomCards array
 * @returns {boolean} Whether the operation was successful
 */
export function equipItem(card, type, cardIndex) {
  console.log(`Game logic: Equipping ${card.id} as ${type}`);

  if (!gameState.gameActive) {
    UI.addLogMessage("Cannot equip items when game is not active.");
    return false;
  }

  // Validate card can be equipped as the specified type
  let isValid = false;

  switch (type) {
    case "weapon":
      // Clubs can be weapons
      isValid = card.suit === "clubs";
      break;
    case "armor":
      // Spades can be armor
      isValid = card.suit === "spades";
      break;
    default:
      console.error(`Invalid equipment type: ${type}`);
      return false;
  }

  if (!isValid) {
    UI.addLogMessage(`Cannot equip ${card.rank} of ${card.suit} as ${type}!`);
    return false;
  }

  // Add current equipment to discard pile if any
  if (type === "weapon" && gameState.currentWeapon !== null) {
    gameState.discardPile.push(gameState.currentWeapon);
    gameState.weaponStack = []; // Clear defeated monsters stack
  } else if (type === "armor" && gameState.currentArmor !== null) {
    gameState.discardPile.push(gameState.currentArmor);
  }

  // Set new equipment
  if (type === "weapon") {
    gameState.currentWeapon = card;
  } else {
    gameState.currentArmor = card;
  }

  // Remove equipped card from room cards
  if (
    cardIndex !== undefined &&
    cardIndex >= 0 &&
    cardIndex < gameState.roomCards.length
  ) {
    gameState.roomCards.splice(cardIndex, 1);
    UI.displayRoomCards(gameState.roomCards);
  }

  // Update UI
  UI.renderEquipment(card, type);
  UI.addLogMessage(`Equipped ${card.rank} of ${card.suit} as ${type}.`);

  return true;
}

/**
 * Handle card effects when played or encountered
 * @param {Object} card - Card to process effects for
 * @param {number} cardIndex - Index of the card in roomCards array
 */
export function processCardEffects(card, cardIndex) {
  console.log("Game logic: Processing card effects for", card.id);

  if (!gameState.gameActive) {
    UI.addLogMessage("Cannot process card effects when game is not active.");
    return;
  }

  // Process effects based on suit
  switch (card.suit) {
    case "hearts":
      // Hearts are healing
      handleHeartsCard(card);
      break;

    case "diamonds":
      // Diamonds are treasure/points
      handleDiamondsCard(card);
      break;

    case "clubs":
      // Clubs are weapons or monsters depending on context
      handleClubsCard(card, cardIndex);
      break;

    case "spades":
      // Spades are armor or traps depending on context
      handleSpadesCard(card, cardIndex);
      break;

    default:
      console.error("Unknown card suit:", card.suit);
  }

  // Remove the card from room cards if it was used
  if (cardIndex !== undefined && cardIndex >= 0) {
    gameState.roomCards.splice(cardIndex, 1);
    UI.displayRoomCards(gameState.roomCards);
    // Increment cards played counter
    gameState.cardsPlayedThisRoom++;
    UI.updateCardsPlayedDisplay(gameState.cardsPlayedThisRoom);
  }

  gameState.lastActionWasSkip = false; // Reset skip flag on any card play
}

/**
 * Handle hearts card (healing)
 * @param {Object} card - Heart card to process
 */
function handleHeartsCard(card) {
  const healAmount = card.value;

  // Heal the player
  updateHealth(healAmount);

  // Add message
  UI.addLogMessage(
    `Used ${card.rank} of hearts to heal ${healAmount} health points.`
  );

  // Add to discard pile
  gameState.discardPile.push(card);
}

/**
 * Handle diamonds card (treasure)
 * @param {Object} card - Diamond card to process
 */
function handleDiamondsCard(card) {
  const treasureValue = card.value;

  // Add to score
  gameState.score += treasureValue;

  // Add message
  UI.addLogMessage(
    `Collected ${card.rank} of diamonds worth ${treasureValue} points.`
  );

  // Add to discard pile
  gameState.discardPile.push(card);
}

/**
 * Handle clubs card (weapons or enemies)
 * @param {Object} card - Clubs card to process
 * @param {number} cardIndex - Index of the card in roomCards array
 */
function handleClubsCard(card, cardIndex) {
  if (["jack", "queen", "king"].includes(card.rank)) {
    const damage = card.value;
    let actualDamage = damage;
    let defeatedWithWeapon = false;
    if (gameState.currentWeapon) {
      actualDamage = Math.max(0, damage - gameState.currentWeapon.value);
      defeatedWithWeapon = true;
      UI.addLogMessage(
        `Fought ${card.rank} of clubs with weapon! Damage reduced from ${damage} to ${actualDamage}.`
      );
    } else if (gameState.currentArmor) {
      actualDamage = Math.max(1, damage - gameState.currentArmor.value);
      UI.addLogMessage(
        `Encountered ${card.rank} of clubs! Your armor reduced damage from ${damage} to ${actualDamage}.`
      );
    } else {
      UI.addLogMessage(
        `Encountered ${card.rank} of clubs! Took ${damage} damage with no armor or weapon.`
      );
    }
    updateHealth(-actualDamage);
    if (defeatedWithWeapon) {
      gameState.weaponStack.push(card);
    }
    gameState.discardPile.push(card);
  } else {
    UI.addLogMessage(
      `Found ${card.rank} of clubs. Drag to weapon slot to equip.`
    );
  }
}

/**
 * Handle spades card (armor or traps)
 * @param {Object} card - Spades card to process
 * @param {number} cardIndex - Index of the card in roomCards array
 */
function handleSpadesCard(card, cardIndex) {
  // Face cards are traps
  if (["jack", "queen", "king"].includes(card.rank)) {
    const damage = Math.floor(card.value / 2); // Traps do less damage than monsters

    // Player takes damage, modified by armor
    let actualDamage = damage;
    if (gameState.currentArmor) {
      actualDamage = Math.max(1, damage - gameState.currentArmor.value);
      UI.addLogMessage(
        `Triggered ${card.rank} of spades trap! Your armor reduced damage from ${damage} to ${actualDamage}.`
      );
    } else {
      UI.addLogMessage(
        `Triggered ${card.rank} of spades trap! Took ${damage} damage with no armor.`
      );
    }

    // Apply damage
    updateHealth(-actualDamage);

    // Add to discard pile
    gameState.discardPile.push(card);
  } else {
    // Number cards can be equipped as armor
    UI.addLogMessage(
      `Found ${card.rank} of spades. Drag to armor slot to equip.`
    );
    // Equipping is handled by drag and drop
  }
}

/**
 * Skip the current room: collect all 4 cards, place them under the dungeon, deal a fresh 4.
 * Cannot skip twice in a row.
 */
export function skipRoom() {
  if (!gameState.gameActive) {
    UI.addLogMessage("Game is not active. Press Start Game to begin.");
    return;
  }
  if (gameState.lastActionWasSkip) {
    UI.addLogMessage("You cannot skip two rooms in a row!");
    return;
  }
  if (gameState.roomCards.length !== 4) {
    UI.addLogMessage(
      "You can only skip when there are exactly 4 cards in the room."
    );
    return;
  }
  // Place all 4 cards under the deck
  gameState.deck = [...gameState.deck, ...gameState.roomCards];
  gameState.roomCards = [];
  // Deal a fresh 4 cards
  dealRoomCards();
  // Mark that last action was a skip
  gameState.lastActionWasSkip = true;
  // Reset cards played counter
  gameState.cardsPlayedThisRoom = 0;
  UI.addLogMessage("Skipped the room. Dealt a fresh 4 cards.");
  UI.updateButtonStates(gameState);
}

export function getCardsPlayedThisRoom() {
  return gameState.cardsPlayedThisRoom;
}
