/**
 * UI module for Scoundrel card game
 * Handles DOM manipulation and UI updates
 */

import { gameState } from "./game.js";

/**
 * Update the player health display
 * @param {number} currentHealth - Current health value
 * @param {number} maxHealth - Maximum health value
 */
export function updateHealthDisplay(currentHealth, maxHealth) {
  const healthValue = document.getElementById("health-value");

  // Calculate health percentage for color changes
  const healthPercentage = Math.max(
    0,
    Math.min(100, (currentHealth / maxHealth) * 100)
  );

  // Update health text
  healthValue.textContent = `${currentHealth}/${maxHealth}`;

  // Change color based on health percentage using CSS variables
  if (healthPercentage < 25) {
    healthValue.style.color = "var(--health-low)"; // Red when health is low
  } else if (healthPercentage < 50) {
    healthValue.style.color = "var(--health-medium)"; // Orange when health is moderate
  } else {
    healthValue.style.color = "var(--health-high)"; // Green when health is high
  }
}

/**
 * Render a card in a specific slot
 * @param {HTMLElement} cardElement - Element to render the card in
 * @param {Object} cardObject - Card object to render (null for empty/card back)
 * @param {boolean} showBack - Whether to show card back instead of empty slot
 * @returns {HTMLElement} The created card image element or empty slot element
 */
export function renderCard(cardElement, cardObject, showBack = false) {
  // Clear any existing content
  cardElement.innerHTML = "";

  if (cardObject) {
    // Create card image
    const cardImg = document.createElement("img");
    cardImg.src = cardObject.imagePath;
    cardImg.alt = cardObject.id;
    cardImg.classList.add("card");
    cardImg.dataset.cardId = cardObject.id;
    cardImg.dataset.suit = cardObject.suit;
    cardImg.dataset.rank = cardObject.rank;
    cardImg.dataset.value = cardObject.value;

    // Make card draggable
    cardImg.setAttribute("draggable", "true");
    cardImg.classList.add("draggable");

    // Add to DOM with animation
    cardElement.appendChild(cardImg);
    cardImg.classList.add("card-dealt");

    return cardImg;
  } else {
    // No card - show empty slot or card back
    if (showBack) {
      // Show card back
      const cardBack = document.createElement("img");
      const cardBackPath = "card_back.png";
      cardBack.src = cardBackPath;
      cardBack.alt = "Card back";
      cardBack.classList.add("card-back");
      cardElement.appendChild(cardBack);
      return cardBack;
    } else {
      // Empty slot
      const emptySlot = document.createElement("div");
      emptySlot.classList.add("empty-slot-text");
      emptySlot.textContent = "Empty";
      cardElement.appendChild(emptySlot);
      return emptySlot;
    }
  }
}

/**
 * Update the deck count display
 * @param {number} count - Current number of cards in deck
 */
export function updateDeckCount(count) {
  const deckCount = document.getElementById("deck-count");
  deckCount.textContent = `${count} cards left`;
}

/**
 * Render equipment in equipment slot
 * @param {Object} equipmentCard - Card object to equip
 * @param {string} slotType - Type of equipment ('weapon')
 */
export function renderEquipment(equipmentCard, slotType) {
  const slot = document.getElementById(`${slotType}-slot`);
  const statsElement = document.getElementById(`${slotType}-stats`);

  // Clear any existing content
  slot.innerHTML = "";

  if (equipmentCard) {
    // If weapon, render weapon in equipment card and stack in separate container
    if (slotType === "weapon") {
      // Create weapon image in equipment card
      const weaponImg = document.createElement("img");
      weaponImg.src = equipmentCard.imagePath;
      weaponImg.alt = equipmentCard.id;
      weaponImg.classList.add("equipment");
      slot.appendChild(weaponImg);
      
      // Use existing HTML weapon-stack-container for defeated monsters
      const stackContainer = document.getElementById("weapon-stack");
      if (stackContainer) {
        // Clear existing stack content
        stackContainer.innerHTML = "";
        
        // Add defeated monsters with progressive offsets
        if (gameState.weaponStack && gameState.weaponStack.length > 0) {
          gameState.weaponStack.forEach((monsterCard) => {
            const monsterImg = document.createElement("img");
            monsterImg.src = monsterCard.imagePath;
            monsterImg.alt = monsterCard.id;
            monsterImg.classList.add("weapon-stack-card");
            stackContainer.appendChild(monsterImg);
          });
          
          // Add overflow indicator if more than 5 monsters
          if (gameState.weaponStack.length > 5) {
            const overflowIndicator = document.createElement("div");
            overflowIndicator.classList.add("weapon-stack-overflow");
            overflowIndicator.textContent = `+${gameState.weaponStack.length - 5}`;
            stackContainer.appendChild(overflowIndicator);
          }
        }
      }
    } else {
      // Non-weapon equipment (armor, etc.)
      const equipImg = document.createElement("img");
      equipImg.src = equipmentCard.imagePath;
      equipImg.alt = equipmentCard.id;
      equipImg.classList.add("equipment");
      slot.appendChild(equipImg);
    }

    // Update stats
    statsElement.textContent = `Power: ${equipmentCard.value}`;
  } else {
    // No equipment
    const emptyText = document.createElement("div");
    emptyText.classList.add("empty-slot-text");
    emptyText.textContent = `No ${slotType} equipped`;
    slot.appendChild(emptyText);

    // Clear weapon stack if no weapon equipped
    if (slotType === "weapon") {
      const stackContainer = document.getElementById("weapon-stack");
      if (stackContainer) {
        stackContainer.innerHTML = "";
      }
    }

    statsElement.textContent = "";
  }
}

/**
 * Clear all room card slots
 */
export function clearRoomCards() {
  for (let i = 1; i <= 4; i++) {
    const slot = document.getElementById(`room-card-${i}`);
    slot.innerHTML = '<div class="empty-slot-text">Empty</div>';
  }
}

/**
 * Display cards in the room card slots
 * @param {Array} cardsArray - Array of card objects to display
 */
export function displayRoomCards(cardsArray) {
  // First clear all room cards
  clearRoomCards();
  // Get how many cards have been played
  let playedCount = 0;
  try {
    // Import gameState dynamically to avoid circular import
    playedCount = require("./game.js").gameState.cardsPlayedThisRoom;
  } catch (e) {
    playedCount = 0;
  }
  // Then render each card in its respective slot
  for (let i = 0; i < Math.min(cardsArray.length, 4); i++) {
    const slotId = `room-card-${i + 1}`;
    const slot = document.getElementById(slotId);
    if (slot && cardsArray[i]) {
      const cardImg = renderCard(slot, cardsArray[i], false);
      cardImg.dataset.index = i;
      setupCardDragEvents(cardImg);
      // Visually mark played cards
      if (i < playedCount) {
        cardImg.classList.add("card-played");
      }
    }
  }
  updateCardsPlayedDisplay(playedCount);
}

/**
 * Set up drag events for a card element
 * @param {HTMLElement} cardElement - The card DOM element
 * @param {Object} cardObject - The card data object
 * @param {number} index - The index of the card in the room cards array
 */
function setupCardDragEvents(cardElement) {
  // Diamonds are now equipped via click, so no cards are draggable in Scoundrel
  // All cards use click interactions
  cardElement.setAttribute("draggable", "false");
  cardElement.classList.add("non-draggable");
  
  // Add visual feedback that cards are clickable
  cardElement.style.cursor = "pointer";
}

/**
 * Add a message to the game log
 * @param {string} message - Message to add to log
 */
export function addLogMessage(message) {
  const logElement = document.getElementById("message-log");
  const logEntry = document.createElement("p");
  logEntry.classList.add("log-entry");

  // Check if the message contains suit names and replace with symbols
  const formattedMessage = formatMessageWithSuitSymbols(message);
  logEntry.innerHTML = formattedMessage;

  // Add the new entry at the top
  logElement.prepend(logEntry);

  // Keep the log size reasonable
  const logEntries = logElement.querySelectorAll(".log-entry");
  if (logEntries.length > 50) {
    logElement.removeChild(logEntries[logEntries.length - 1]);
  }
}

/**
 * Format message text to replace suit names with suit symbols
 * @param {string} message - The original message
 * @returns {string} Formatted message with suit symbols
 */
function formatMessageWithSuitSymbols(message) {
  return message
    .replace(/clubs/gi, "♣️ clubs")
    .replace(/diamonds/gi, "♦️ diamonds")
    .replace(/hearts/gi, "♥️ hearts")
    .replace(/spades/gi, "♠️ spades");
}

/**
 * Update button states based on game state
 * @param {Object} gameState - Current game state
 */
export function updateButtonStates(gameState) {
  const startBtn = document.getElementById("start-game-btn");
  const nextRoomBtn = document.getElementById("next-room-btn");
  const skipRoomBtn = document.getElementById("skip-room-btn");
  
  startBtn.disabled = gameState.gameActive;
  
  // Enable Next Room only when exactly 3 cards have been played
  nextRoomBtn.disabled = !(gameState.gameActive && gameState.cardsPlayedThisRoom === 3);
  
  // Enable skip if game is active, last action was not skip, 4 cards in room, and no cards played yet
  if (skipRoomBtn) {
    skipRoomBtn.disabled = !(
      gameState.gameActive &&
      !gameState.lastActionWasSkip &&
      gameState.roomCards &&
      gameState.roomCards.length === 4 &&
      gameState.cardsPlayedThisRoom === 0
    );
  }
}

export function updateCardsPlayedDisplay(count) {
  let display = document.getElementById("cards-played-display");
  if (!display) {
    // Create the display if it doesn't exist
    const roomCardsSection = document.querySelector(".room-cards");
    display = document.createElement("div");
    display.id = "cards-played-display";
    display.className = "cards-played-display";
    roomCardsSection.insertBefore(display, roomCardsSection.firstChild);
  }
  
  if (count === 3) {
    display.textContent = `Cards played: ${count}/3 - Ready for next room!`;
    display.style.color = "#27ae60"; // Green when ready
  } else {
    display.textContent = `Cards played: ${count}/3`;
    display.style.color = "#2c3e50"; // Default color
  }
}

/**
 * Update potion usage display
 * @param {boolean} potionUsed - Whether a potion has been used this room
 */
export function updatePotionUsageDisplay(potionUsed) {
  let display = document.getElementById("potion-usage-display");
  if (!display) {
    // Create the display if it doesn't exist
    const roomCardsSection = document.querySelector(".room-cards");
    display = document.createElement("div");
    display.id = "potion-usage-display";
    display.className = "potion-usage-display";
    roomCardsSection.insertBefore(display, roomCardsSection.firstChild);
  }
  
  if (potionUsed) {
    display.textContent = "🧪 Potion used this room (additional potions won't heal)";
    display.style.color = "#e67e22"; // Orange warning
  } else {
    display.textContent = "🧪 Next potion will heal";
    display.style.color = "#27ae60"; // Green ready
  }
}

/**
 * Display game victory status
 */
export function displayVictoryStatus() {
  // Create a prominent victory banner
  let banner = document.getElementById("victory-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "victory-banner";
    banner.className = "victory-banner";
    banner.style.cssText = `
      background: linear-gradient(45deg, #f1c40f, #f39c12);
      color: #2c3e50;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
      border: 3px solid #e67e22;
      border-radius: 10px;
      margin: 10px;
      animation: victoryPulse 2s ease-in-out infinite;
    `;
    
    // Insert at the top of the game container
    const gameContainer = document.querySelector(".game-container");
    gameContainer.insertBefore(banner, gameContainer.firstChild);
  }
  
  banner.innerHTML = "🎉 VICTORY! DUNGEON CONQUERED! 🎉";
  banner.style.display = "block";
}

/**
 * Hide the victory banner
 */
export function hideVictoryStatus() {
  const banner = document.getElementById("victory-banner");
  if (banner) {
    banner.style.display = "none";
  }
}

/**
 * Display game over status (defeat)
 */
export function displayGameOverStatus() {
  // Create a prominent defeat banner
  let banner = document.getElementById("game-over-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "game-over-banner";
    banner.className = "game-over-banner";
    banner.style.cssText = `
      background: linear-gradient(45deg, #c0392b, #e74c3c);
      color: #fff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
      border: 3px solid #a93226;
      border-radius: 10px;
      margin: 10px;
      animation: defeatPulse 2s ease-in-out infinite;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    `;
    
    // Insert at the top of the game container
    const gameContainer = document.querySelector(".game-container");
    gameContainer.insertBefore(banner, gameContainer.firstChild);
  }
  
  banner.innerHTML = "💀 GAME OVER! YOU PERISHED IN THE DUNGEON! 💀";
  banner.style.display = "block";
}

/**
 * Hide the game over banner
 */
export function hideGameOverStatus() {
  const banner = document.getElementById("game-over-banner");
  if (banner) {
    banner.style.display = "none";
  }
}

/**
 * Show a temporary toast notification for invalid actions
 * @param {string} message - Message to display
 * @param {string} type - Type of notification: 'error', 'warning', 'info'
 */
export function showToast(message, type = 'error') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
    `;
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    background: ${type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
    color: white;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-weight: bold;
    transform: translateX(320px);
    transition: transform 0.3s ease;
    cursor: pointer;
  `;
  toast.textContent = message;
  
  // Add click to dismiss
  toast.addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Slide in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 4000);
}

/**
 * Remove a toast notification
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
  if (toast && toast.parentNode) {
    toast.style.transform = 'translateX(320px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

/**
 * Update visual state of room cards based on game state
 * @param {Object} gameState - Current game state
 */
export function updateCardInteractability(gameState) {
  const cardSlots = document.querySelectorAll('.card-slot .card');
  
  cardSlots.forEach((cardElement) => {
    if (gameState.cardsPlayedThisRoom >= 3) {
      // Disable all cards when 3 have been played
      cardElement.style.opacity = '0.5';
      cardElement.style.cursor = 'not-allowed';
      cardElement.setAttribute('draggable', 'false');
      cardElement.classList.add('disabled');
    } else {
      // Enable cards when less than 3 played
      cardElement.style.opacity = '1';
      cardElement.style.cursor = 'pointer';
      cardElement.setAttribute('draggable', 'true');
      cardElement.classList.remove('disabled');
    }
  });
}
