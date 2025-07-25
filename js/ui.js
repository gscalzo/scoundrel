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
 * @param {boolean} animate - Whether to apply card-dealt animation
 * @returns {HTMLElement} The created card image element or empty slot element
 */
export function renderCard(cardElement, cardObject, showBack = false, animate = true) {
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

    // Add to DOM with optional animation
    cardElement.appendChild(cardImg);
    if (animate) {
      cardImg.classList.add("card-dealt");
    }

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

// Animation state tracking
let isAnimating = false;

/**
 * Display cards in the room card slots
 * @param {Array} cardsArray - Array of card objects to display
 * @param {boolean} animate - Whether to animate card dealing
 */
export function displayRoomCards(cardsArray, animate = false) {
  console.log('displayRoomCards called with', cardsArray.length, 'cards, animate:', animate);
  
  // Get how many cards have been played and check for carry-over
  let playedCount = 0;
  let hasCarryOver = false;
  try {
    // Import gameState dynamically to avoid circular import
    const gameModule = require("./game.js");
    playedCount = gameModule.gameState.cardsPlayedThisRoom;
    // Check if this is a new room with carry-over (4 cards but one should stay in slot 1)
    hasCarryOver = cardsArray.length === 4 && gameModule.gameState.currentRound > 1 && playedCount === 0;
  } catch (e) {
    playedCount = 0;
  }
  
  // Handle different scenarios for clearing
  if (animate) {
    if (hasCarryOver) {
      // Don't clear slot 1 - the carry-over card should stay there
      console.log('Preserving carry-over card in slot 1');
      for (let i = 2; i <= 4; i++) {
        const slot = document.getElementById(`room-card-${i}`);
        slot.innerHTML = '<div class="empty-slot-text">Empty</div>';
      }
    } else {
      // Clear all slots for normal new room
      clearRoomCards();
    }
  }

  if (animate && cardsArray.length > 0) {
    console.log('Taking animation path');
    isAnimating = true;
    // Import animations dynamically to avoid circular import
    console.log('Importing animations module...');
    import('./animations.js').then(Animations => {
      console.log('Animations module loaded successfully');
      const deckElement = document.getElementById('deck-card');
      const roomSlots = [];
      const cardsToAnimate = [];
      
      // Determine which cards to animate and which slots to target
      if (hasCarryOver) {
        console.log('Carry-over detected: animating only 3 new cards to slots 2-4');
        // Skip the first card (carry-over), animate only the new cards
        for (let i = 1; i < Math.min(cardsArray.length, 4); i++) {
          const slot = document.getElementById(`room-card-${i + 1}`);
          if (slot) {
            roomSlots.push(slot);
            cardsToAnimate.push(cardsArray[i]);
          }
        }
        // Update slot 1 with carry-over immediately (no animation)
        updateSingleCardSlot(0, cardsArray[0], false);
      } else {
        // Normal animation for all cards
        for (let i = 0; i < Math.min(cardsArray.length, 4); i++) {
          const slot = document.getElementById(`room-card-${i + 1}`);
          if (slot) {
            roomSlots.push(slot);
            cardsToAnimate.push(cardsArray[i]);
          }
        }
      }
      
      // Animate cards being dealt
      if (deckElement && roomSlots.length > 0) {
        console.log('Starting card dealing animation for', cardsToAnimate.length, 'cards');
        Animations.animateCardDealing(
          deckElement,
          roomSlots,
          cardsToAnimate,
          () => {
            console.log('Card dealing animation completed');
            isAnimating = false;
            // After animation, render the cards normally
            renderRoomCardsImmediate(cardsArray, playedCount);
          }
        );
      } else {
        // Fallback to immediate rendering
        isAnimating = false;
        renderRoomCardsImmediate(cardsArray, playedCount);
      }
    }).catch(() => {
      // Fallback if animations module fails to load
      isAnimating = false;
      renderRoomCardsImmediate(cardsArray, playedCount);
    });
  } else {
    console.log('Taking immediate rendering path (animate:', animate, ', cards:', cardsArray.length, ')');
    // Immediate rendering without animation - update existing layout
    updateRoomCardsLayout(cardsArray, playedCount);
  }
}

/**
 * Update room cards layout without clearing (for card removal)
 * @param {Array} cardsArray - Array of card objects to display
 * @param {number} playedCount - Number of cards already played
 */
function updateRoomCardsLayout(cardsArray, playedCount) {
  // Clear all slots first
  for (let i = 1; i <= 4; i++) {
    const slot = document.getElementById(`room-card-${i}`)
    slot.innerHTML = '<div class="empty-slot-text">Empty</div>';
  }
  
  // Then render each card in its respective slot (with animation for card updates)
  for (let i = 0; i < Math.min(cardsArray.length, 4); i++) {
    const slotId = `room-card-${i + 1}`;
    const slot = document.getElementById(slotId);
    if (slot && cardsArray[i]) {
      const cardImg = renderCard(slot, cardsArray[i], false, true); // animate = true for regular updates
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
 * Render room cards immediately without animation
 * @param {Array} cardsArray - Array of card objects to display
 * @param {number} playedCount - Number of cards already played
 */
function renderRoomCardsImmediate(cardsArray, playedCount) {
  // Check if cards are already properly positioned from animation and just update their properties
  for (let i = 0; i < Math.min(cardsArray.length, 4); i++) {
    const slotId = `room-card-${i + 1}`;
    const slot = document.getElementById(slotId);
    if (slot && cardsArray[i]) {
      // Check if the slot already has the correct card from the flying animation
      const existingCard = slot.querySelector('.card, .flying-card');
      const expectedCardId = cardsArray[i].id;
      
      if (existingCard && existingCard.alt === expectedCardId) {
        // Card is already correctly positioned from animation, just update properties
        existingCard.classList.remove('flying-card');
        existingCard.classList.add('card');
        existingCard.dataset.index = i;
        existingCard.style.cssText = ''; // Clear any animation styles
        existingCard.setAttribute("draggable", "false");
        existingCard.classList.add("non-draggable");
        existingCard.style.cursor = "pointer";
        
        // Visually mark played cards
        if (i < playedCount) {
          existingCard.classList.add("card-played");
        }
      } else {
        // Fallback to normal rendering if card isn't properly positioned
        const cardImg = renderCard(slot, cardsArray[i], false, false); // animate = false
        cardImg.dataset.index = i;
        setupCardDragEvents(cardImg);
        // Visually mark played cards
        if (i < playedCount) {
          cardImg.classList.add("card-played");
        }
      }
    }
  }
  updateCardsPlayedDisplay(playedCount);
}

/**
 * Update a single card slot without affecting other slots
 * @param {number} slotIndex - The index of the slot to update (0-3)
 * @param {Object|null} cardObject - Card object to display, or null for empty
 * @param {boolean} markAsPlayed - Whether to mark the card as played
 */
export function updateSingleCardSlot(slotIndex, cardObject = null, markAsPlayed = false) {
  const slotId = `room-card-${slotIndex + 1}`;
  const slot = document.getElementById(slotId);
  
  if (!slot) {
    console.warn(`Slot ${slotId} not found`);
    return;
  }
  
  if (cardObject) {
    // Render the card in the slot
    const cardImg = renderCard(slot, cardObject, false, false); // no animation for updates
    cardImg.dataset.index = slotIndex;
    setupCardDragEvents(cardImg);
    
    // Mark as played if specified
    if (markAsPlayed) {
      cardImg.classList.add("card-played");
    }
  } else {
    // Empty the slot
    slot.innerHTML = '<div class="empty-slot-text">Empty</div>';
  }
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

/**
 * Update the discard pile display
 * @param {Array} discardPile - Array of cards in discard pile
 */
export function updateDiscardPile(discardPile) {
  const discardElement = document.getElementById('discard-pile');
  if (!discardElement) {
    console.warn('Discard pile element not found');
    return;
  }
  
  console.log('Updating discard pile with', discardPile.length, 'cards');

  // Clear existing content
  discardElement.innerHTML = '';

  if (discardPile.length > 0) {
    // Show the top (most recent) card
    const topCard = discardPile[discardPile.length - 1];
    const cardImg = document.createElement('img');
    cardImg.src = topCard.imagePath;
    cardImg.alt = `${topCard.rank} of ${topCard.suit}`;
    cardImg.classList.add('card');
    discardElement.appendChild(cardImg);
    
    // Add updated animation
    discardElement.classList.add('updated');
    setTimeout(() => {
      discardElement.classList.remove('updated');
    }, 500);
  } else {
    // Show empty state
    const emptyText = document.createElement('div');
    emptyText.classList.add('empty-slot-text');
    emptyText.textContent = 'Empty';
    discardElement.appendChild(emptyText);
  }
  
  // Update discard count
  updateDiscardCount(discardPile.length);
}

/**
 * Update the discard pile count display
 * @param {number} count - Number of cards in discard pile
 */
export function updateDiscardCount(count) {
  let discardCount = document.getElementById('discard-count');
  if (!discardCount) {
    // Create the count display if it doesn't exist
    const discardArea = document.querySelector('.discard-area');
    if (discardArea) {
      discardCount = document.createElement('div');
      discardCount.id = 'discard-count';
      discardCount.className = 'discard-count';
      discardArea.appendChild(discardCount);
    } else {
      console.warn('Discard area not found');
      return;
    }
  }
  
  if (count === 0) {
    discardCount.textContent = 'No cards';
  } else if (count === 1) {
    discardCount.textContent = '1 card';
  } else {
    discardCount.textContent = `${count} cards`;
  }
}

/**
 * Show a visual effect when cards are added to discard pile
 * @param {number} cardsAdded - Number of cards added
 */
export function showDiscardEffect(cardsAdded = 1) {
  const discardElement = document.getElementById('discard-pile');
  if (discardElement) {
    // Create a floating text effect
    const effect = document.createElement('div');
    effect.textContent = `+${cardsAdded}`;
    effect.style.cssText = `
      position: absolute;
      top: -10px;
      right: -10px;
      background: var(--btn-primary);
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: bold;
      z-index: 10;
      animation: cardCountEffect 1s ease-out forwards;
    `;
    
    discardElement.style.position = 'relative';
    discardElement.appendChild(effect);
    
    // Remove effect after animation
    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    }, 1000);
  }
}

/**
 * Clear the discard pile display (for game reset)
 */
export function clearDiscardPile() {
  updateDiscardPile([]);
}
