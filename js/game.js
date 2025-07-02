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
  deck: [],
  roomCards: [],
  discardPile: [],
  currentRound: 0,
  gameActive: false,
  score: 0,
  lastActionWasSkip: false,
  weaponStack: [], // Stack of defeated monsters under the weapon
  cardsPlayedThisRoom: 0, // Track how many cards have been played in the current room
  carryOverCard: null, // Card carried over from previous room
  potionUsedThisRoom: false, // Track if a potion has healed this room (Scoundrel rule)
};

/**
 * Start a new game
 */
export function startNewGame() {
  console.log("Game logic: Starting new game");

  // Reset game state
  gameState.playerHealth = gameState.maxHealth;
  gameState.currentWeapon = null;
  gameState.currentRound = 0;
  gameState.score = 0;
  gameState.discardPile = [];
  gameState.carryOverCard = null;
  gameState.weaponStack = [];
  gameState.potionUsedThisRoom = false;

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
  UI.updateDeckCount(gameState.deck.length);
  UI.hideVictoryStatus();
  UI.updateButtonStates(gameState);

  // Add game start message
  UI.addLogMessage("Game started! Deal with the cards in front of you.");
  UI.updateCardsPlayedDisplay(gameState.cardsPlayedThisRoom);
  UI.updatePotionUsageDisplay(gameState.potionUsedThisRoom);

  return gameState;
}

/**
 * Deal cards for a new room
 * @returns {Array} The cards dealt for the room
 */
export function dealRoomCards() {
  // Calculate how many new cards we need to deal
  const newCardsNeeded = gameState.carryOverCard ? 3 : 4;
  
  if (gameState.deck.length < newCardsNeeded) {
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
      // Victory - dungeon deck fully used up!
      gameWin();
      return [];
    }
  }

  // Deal new cards to the room
  const result = Deck.dealCards(gameState.deck, newCardsNeeded);
  let newRoomCards = result.dealtCards;
  gameState.deck = result.remainingDeck;
  
  // Add carry-over card if it exists
  if (gameState.carryOverCard) {
    newRoomCards.unshift(gameState.carryOverCard); // Add at the beginning
    UI.addLogMessage(`Carried over ${gameState.carryOverCard.rank} of ${gameState.carryOverCard.suit} from previous room.`);
    gameState.carryOverCard = null;
  }
  
  gameState.roomCards = newRoomCards;

  // Update deck count in UI
  UI.updateDeckCount(gameState.deck.length);

  // Display the room cards
  UI.displayRoomCards(gameState.roomCards);
  // Reset room counters
  gameState.cardsPlayedThisRoom = 0;
  gameState.potionUsedThisRoom = false; // Reset potion usage for new room
  UI.updateCardsPlayedDisplay(gameState.cardsPlayedThisRoom);
  UI.updatePotionUsageDisplay(gameState.potionUsedThisRoom);
  UI.updateButtonStates(gameState);
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

  // Check if exactly 3 cards have been played (Scoundrel rule)
  if (gameState.cardsPlayedThisRoom !== 3) {
    UI.addLogMessage(`You must play exactly 3 cards before moving to the next room. (Played: ${gameState.cardsPlayedThisRoom}/3)`);
    UI.showToast(`Must play exactly 3 cards! (${gameState.cardsPlayedThisRoom}/3)`, "warning");
    return;
  }

  // Store the remaining unplayed card as carry-over
  if (gameState.roomCards.length === 1) {
    gameState.carryOverCard = gameState.roomCards[0];
    UI.addLogMessage(`Carrying over ${gameState.carryOverCard.rank} of ${gameState.carryOverCard.suit} to the next room.`);
  } else if (gameState.roomCards.length > 1) {
    // This shouldn't happen if we enforce the 3-card rule correctly
    console.warn("More than 1 card remaining after playing 3 cards. This shouldn't happen.");
    gameState.discardPile.push(...gameState.roomCards);
  }

  // Clear current room cards
  gameState.roomCards = [];

  // Increment round counter
  gameState.currentRound++;

  // Deal new room cards (which will include the carry-over)
  dealRoomCards();

  // Reset skip flag
  gameState.lastActionWasSkip = false;

  // Update UI
  UI.addLogMessage(`Entered room ${gameState.currentRound}. Be careful!`);
  UI.updateButtonStates(gameState);

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
  gameState.deck = [];
  gameState.roomCards = [];
  gameState.discardPile = [];
  gameState.currentRound = 0;
  gameState.gameActive = false;
  gameState.score = 0;
  gameState.carryOverCard = null;
  gameState.weaponStack = [];
  gameState.potionUsedThisRoom = false;

  // Clear UI
  UI.updateHealthDisplay(gameState.playerHealth, gameState.maxHealth);
  UI.renderEquipment(null, "weapon");
  UI.updateDeckCount(0);
  UI.clearRoomCards();
  UI.hideVictoryStatus();
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
 * Handle game over (loss)
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
 * Handle winning the game (deck fully used up)
 */
function gameWin() {
  gameState.gameActive = false;

  // Show victory banner
  UI.displayVictoryStatus();

  UI.addLogMessage(
    `🎉 VICTORY! You have conquered the entire dungeon! 🎉`
  );
  UI.addLogMessage(
    `Final stats: Survived ${gameState.currentRound} rooms, scored ${gameState.score} points, health remaining: ${gameState.playerHealth}/${gameState.maxHealth}`
  );
  
  // Show additional victory details
  const weaponInfo = gameState.currentWeapon 
    ? `Armed with ${gameState.currentWeapon.rank} of ${gameState.currentWeapon.suit}`
    : "Completed unarmed";
  const monstersDefeated = gameState.weaponStack.length;
  
  UI.addLogMessage(
    `${weaponInfo}. Monsters defeated with current weapon: ${monstersDefeated}.`
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
 * Equip an item (weapon)
 * @param {Object} card - Card to equip
 * @param {string} type - Type of equipment ('weapon')
 * @param {number} cardIndex - Index of the card in roomCards array
 * @returns {boolean} Whether the operation was successful
 */
export function equipItem(card, type, cardIndex) {
  console.log(`Game logic: Equipping ${card.id} as ${type}`);

  if (!gameState.gameActive) {
    UI.addLogMessage("Cannot equip items when game is not active.");
    return false;
  }

  // Check if we've already played 3 cards in this room
  if (gameState.cardsPlayedThisRoom >= 3) {
    UI.addLogMessage("You have already played 3 cards in this room. Use 'Next Room' to continue.");
    UI.showToast("Already played 3 cards! Click Next Room.", "warning");
    return false;
  }

  // Validate card can be equipped as the specified type
  let isValid = false;

  switch (type) {
    case "weapon":
      // Only diamonds can be weapons according to Scoundrel rules
      isValid = card.suit === "diamonds";
      break;
    default:
      console.error(`Invalid equipment type: ${type}. Only weapons are supported in Scoundrel.`);
      return false;
  }

  if (!isValid) {
    UI.addLogMessage(`Cannot equip ${card.rank} of ${card.suit} as ${type}!`);
    UI.showToast(`${card.suit === 'diamonds' ? 'Diamonds are weapons!' : card.suit === 'hearts' ? 'Hearts are potions!' : 'Only diamonds can be weapons!'}`, "error");
    return false;
  }

  // Add current weapon to discard pile if any, and clear defeated monsters stack
  if (type === "weapon" && gameState.currentWeapon !== null) {
    const monstersDiscarded = gameState.weaponStack.length;
    gameState.discardPile.push(gameState.currentWeapon);
    // Add stacked monsters to discard pile too
    gameState.discardPile.push(...gameState.weaponStack);
    gameState.weaponStack = []; // Clear defeated monsters stack
    if (monstersDiscarded > 0) {
      UI.addLogMessage(`Discarded previous weapon and ${monstersDiscarded} defeated monsters.`);
    } else {
      UI.addLogMessage(`Discarded previous weapon.`);
    }
  }

  // Set new weapon
  gameState.currentWeapon = card;

  // Remove equipped card from room cards
  if (
    cardIndex !== undefined &&
    cardIndex >= 0 &&
    cardIndex < gameState.roomCards.length
  ) {
    gameState.roomCards.splice(cardIndex, 1);
    UI.displayRoomCards(gameState.roomCards);
    // Increment cards played counter
    gameState.cardsPlayedThisRoom++;
    UI.updateCardsPlayedDisplay(gameState.cardsPlayedThisRoom);
    
    // Check for victory after equipping
    if (checkVictoryCondition()) {
      // Update UI first
      UI.renderEquipment(card, type);
      UI.addLogMessage(`Equipped ${card.rank} of ${card.suit} as ${type}.`);
      gameWin();
      return true;
    }
  }

  // Update UI
  UI.renderEquipment(card, type);
  UI.addLogMessage(`Equipped ${card.rank} of ${card.suit} as ${type}.`);
  UI.updateButtonStates(gameState);

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

  // Check if we've already played 3 cards in this room
  if (gameState.cardsPlayedThisRoom >= 3) {
    UI.addLogMessage("You have already played 3 cards in this room. Use 'Next Room' to continue.");
    UI.showToast("Already played 3 cards! Click Next Room.", "warning");
    return;
  }

  // Process effects based on suit
  let cardWasConsumed = false;
  
  switch (card.suit) {
    case "hearts":
      // Hearts are healing potions
      handleHeartsCard(card);
      cardWasConsumed = true;
      break;

    case "diamonds":
      // Diamonds are weapons - just show message, don't consume
      handleDiamondsCard(card);
      cardWasConsumed = false;
      break;

    case "clubs":
      // Clubs are monsters
      const clubResult = handleClubsCard(card, cardIndex);
      cardWasConsumed = clubResult !== false;
      break;

    case "spades":
      // Spades are monsters
      const spadeResult = handleSpadesCard(card, cardIndex);
      cardWasConsumed = spadeResult !== false;
      break;

    default:
      console.error("Unknown card suit:", card.suit);
  }

  // Remove the card from room cards if it was consumed
  if (cardWasConsumed && cardIndex !== undefined && cardIndex >= 0) {
    gameState.roomCards.splice(cardIndex, 1);
    UI.displayRoomCards(gameState.roomCards);
    // Increment cards played counter
    gameState.cardsPlayedThisRoom++;
    UI.updateCardsPlayedDisplay(gameState.cardsPlayedThisRoom);
    UI.updateButtonStates(gameState);
    
    // Check for victory after playing a card
    if (checkVictoryCondition()) {
      gameWin();
      return;
    }
  }

  gameState.lastActionWasSkip = false; // Reset skip flag on any card play
}

/**
 * Handle hearts card (healing)
 * @param {Object} card - Heart card to process
 */
function handleHeartsCard(card) {
  const healAmount = card.value;

  if (!gameState.potionUsedThisRoom) {
    // First potion this room - heal the player
    updateHealth(healAmount);
    gameState.potionUsedThisRoom = true;
    
    UI.addLogMessage(
      `Used ${card.rank} of hearts to heal ${healAmount} health points.`
    );
    UI.updatePotionUsageDisplay(gameState.potionUsedThisRoom);
  } else {
    // Additional potion this room - no healing effect
    UI.addLogMessage(
      `Drank ${card.rank} of hearts, but it has no effect (only first potion per room heals).`
    );
  }

  // Add to discard pile regardless of healing effect
  gameState.discardPile.push(card);
}

/**
 * Handle diamonds card (treasure)
 * @param {Object} card - Diamond card to process
 */
function handleDiamondsCard(card) {
  // Diamonds are weapons in Scoundrel - they should be equipped, not automatically used
  UI.addLogMessage(
    `Found ${card.rank} of diamonds (weapon). Drag to weapon slot to equip.`
  );
  // The card remains in the room for the player to drag to equipment slot
}

/**
 * Handle clubs card (weapons or enemies)
 * @param {Object} card - Clubs card to process
 * @param {number} cardIndex - Index of the card in roomCards array
 */
function handleClubsCard(card, cardIndex) {
  // All clubs are monsters according to Scoundrel rules
  const combatResult = handleCombat(card);
  
  return combatResult;
}

/**
 * Handle spades card (monsters)
 * @param {Object} card - Spades card to process
 * @param {number} cardIndex - Index of the card in roomCards array
 */
function handleSpadesCard(card, cardIndex) {
  // All spades are monsters according to Scoundrel rules
  const combatResult = handleCombat(card);
  
  return combatResult;
}

/**
 * Skip the current room: collect all 4 cards, place them under the dungeon, deal a fresh 4.
 * Cannot skip twice in a row.
 */
export function skipRoom() {
  if (!gameState.gameActive) {
    UI.addLogMessage("Game is not active. Press Start Game to begin.");
    UI.showToast("Game not active!", "warning");
    return;
  }
  if (gameState.lastActionWasSkip) {
    UI.addLogMessage("You cannot skip two rooms in a row!");
    UI.showToast("Cannot skip twice in a row!", "error");
    return;
  }
  if (gameState.roomCards.length !== 4) {
    UI.addLogMessage(
      "You can only skip when there are exactly 4 cards in the room."
    );
    UI.showToast("Need exactly 4 cards to skip!", "warning");
    return;
  }
  if (gameState.cardsPlayedThisRoom > 0) {
    UI.addLogMessage("You cannot skip after playing cards in this room.");
    UI.showToast("Cannot skip after playing cards!", "error");
    return;
  }
  // Place all 4 cards under the deck
  gameState.deck = [...gameState.deck, ...gameState.roomCards];
  gameState.roomCards = [];
  // Deal a fresh 4 cards
  dealRoomCards();
  // Mark that last action was a skip
  gameState.lastActionWasSkip = true;
  // Reset room counters
  gameState.cardsPlayedThisRoom = 0;
  gameState.potionUsedThisRoom = false; // Reset potion usage for new room
  UI.addLogMessage("Skipped the room. Dealt a fresh 4 cards.");
  UI.updatePotionUsageDisplay(gameState.potionUsedThisRoom);
  UI.updateButtonStates(gameState);
}

export function getCardsPlayedThisRoom() {
  return gameState.cardsPlayedThisRoom;
}

/**
 * Check if the player has won by exhausting the dungeon deck
 * @returns {boolean} Whether the game should end in victory
 */
function checkVictoryCondition() {
  // Calculate cards needed for next room
  const cardsNeededForNextRoom = gameState.carryOverCard ? 3 : 4;
  const availableCards = gameState.deck.length + gameState.discardPile.length;
  
  // Victory condition: not enough cards to form a new room AND played exactly 3 cards this room
  return gameState.cardsPlayedThisRoom === 3 && availableCards < cardsNeededForNextRoom;
}

/**
 * Fight a monster bare-handed (ignoring equipped weapon)
 * @param {Object} monster - Monster card to fight
 * @param {number} cardIndex - Index of the card in roomCards array
 * @returns {boolean} Whether combat was successful
 */
export function fightBareHanded(monster, cardIndex) {
  if (!gameState.gameActive) {
    UI.addLogMessage("Cannot fight when game is not active.");
    return false;
  }

  // Check if we've already played 3 cards in this room
  if (gameState.cardsPlayedThisRoom >= 3) {
    UI.addLogMessage("You have already played 3 cards in this room. Use 'Next Room' to continue.");
    return false;
  }

  const combatResult = handleCombat(monster, true); // true = use bare hands
  
  if (combatResult && cardIndex !== undefined && cardIndex >= 0) {
    gameState.roomCards.splice(cardIndex, 1);
    UI.displayRoomCards(gameState.roomCards);
    gameState.cardsPlayedThisRoom++;
    UI.updateCardsPlayedDisplay(gameState.cardsPlayedThisRoom);
    UI.updateButtonStates(gameState);
    
    // Check for victory after bare-handed combat
    if (checkVictoryCondition()) {
      gameWin();
      return combatResult;
    }
  }
  
  return combatResult;
}

/**
 * Check if a monster can be attacked by the current weapon based on the "strictly weaker" rule
 * @param {Object} monster - Monster card to check
 * @returns {boolean} Whether the monster can be attacked
 */
function canAttackMonster(monster) {
  if (!gameState.currentWeapon || gameState.weaponStack.length === 0) {
    return true; // First monster or no weapon equipped
  }
  
  const lastDefeatedMonster = gameState.weaponStack[gameState.weaponStack.length - 1];
  return monster.value < lastDefeatedMonster.value; // Must be strictly weaker
}

/**
 * Handle combat with a monster
 * @param {Object} monster - Monster card
 * @param {boolean} useBareHands - Whether to fight bare-handed despite having a weapon
 * @returns {boolean} Whether combat was successful
 */
function handleCombat(monster, useBareHands = false) {
  const monsterValue = monster.value;
  let actualDamage = monsterValue;
  let combatMessage = "";
  let canUseWeapon = false;
  
  // Check if weapon can be used
  if (gameState.currentWeapon && !useBareHands) {
    canUseWeapon = canAttackMonster(monster);
    
    if (canUseWeapon) {
      actualDamage = Math.max(0, monsterValue - gameState.currentWeapon.value);
      combatMessage = `Fought ${monster.rank} of ${monster.suit} with ${gameState.currentWeapon.rank} of ${gameState.currentWeapon.suit}! `;
      combatMessage += `Damage reduced from ${monsterValue} to ${actualDamage}.`;
      
      // Add defeated monster to weapon stack
      gameState.weaponStack.push(monster);
      UI.addLogMessage(combatMessage);
      UI.renderEquipment(gameState.currentWeapon, "weapon"); // Update weapon display with stack
    } else {
      // Cannot use weapon due to "strictly weaker" rule
      const lastMonster = gameState.weaponStack[gameState.weaponStack.length - 1];
      UI.addLogMessage(`Cannot attack ${monster.rank} of ${monster.suit} with current weapon - must be strictly weaker than last defeated monster (${lastMonster.rank}).`);
      UI.showToast(`Monster too strong for weapon! (${monster.value} vs ${lastMonster.value})`, "error");
      return false; // Combat failed
    }
  } else {
    // Bare-handed combat or no weapon
    if (useBareHands && gameState.currentWeapon) {
      combatMessage = `Fought ${monster.rank} of ${monster.suit} bare-handed (chose not to use weapon). Took ${actualDamage} damage.`;
    } else {
      combatMessage = `Fought ${monster.rank} of ${monster.suit} bare-handed. Took ${actualDamage} damage.`;
    }
    UI.addLogMessage(combatMessage);
  }
  
  // Apply damage
  updateHealth(-actualDamage);
  
  // Add monster to discard pile
  gameState.discardPile.push(monster);
  
  return true;
}
