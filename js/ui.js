/**
 * UI module for Scoundrel card game
 * Handles DOM manipulation and UI updates
 */

/**
 * Update the player health display
 * @param {number} currentHealth - Current health value
 * @param {number} maxHealth - Maximum health value
 */
export function updateHealthDisplay(currentHealth, maxHealth) {
  const healthBar = document.getElementById("health-bar-fill");
  const healthValue = document.getElementById("health-value");

  // Update health bar width
  const healthPercentage = Math.max(
    0,
    Math.min(100, (currentHealth / maxHealth) * 100)
  );
  healthBar.style.width = `${healthPercentage}%`;

  // Change color based on health percentage
  if (healthPercentage < 25) {
    healthBar.style.backgroundColor = "#c0392b"; // Red when health is low
  } else if (healthPercentage < 50) {
    healthBar.style.backgroundColor = "#e67e22"; // Orange when health is moderate
  } else {
    healthBar.style.backgroundColor = "#27ae60"; // Green when health is high
  }

  // Update health text
  healthValue.textContent = `${currentHealth}/${maxHealth}`;
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
 * @param {string} slotType - Type of equipment ('weapon' or 'armor')
 */
export function renderEquipment(equipmentCard, slotType) {
  const slot = document.getElementById(`${slotType}-slot`);
  const statsElement = document.getElementById(`${slotType}-stats`);

  // Clear any existing content
  slot.innerHTML = "";

  if (equipmentCard) {
    // Create equipment image
    const equipImg = document.createElement("img");
    equipImg.src = equipmentCard.imagePath;
    equipImg.alt = equipmentCard.id;
    equipImg.classList.add("equipment");

    // Add to DOM
    slot.appendChild(equipImg);

    // Update stats
    statsElement.textContent = `Power: ${equipmentCard.value}`;
  } else {
    // No equipment
    const emptyText = document.createElement("div");
    emptyText.classList.add("empty-slot-text");
    emptyText.textContent = `No ${slotType} equipped`;
    slot.appendChild(emptyText);

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

  // Then render each card in its respective slot
  for (let i = 0; i < Math.min(cardsArray.length, 4); i++) {
    const slotId = `room-card-${i + 1}`;
    const slot = document.getElementById(slotId);

    if (slot && cardsArray[i]) {
      const cardImg = renderCard(slot, cardsArray[i], false);

      // Add index data attribute for drag and drop functionality
      cardImg.dataset.index = i;

      // Set up drag events for the card
      setupCardDragEvents(cardImg, cardsArray[i], i);
    }
  }
}

/**
 * Set up drag events for a card element
 * @param {HTMLElement} cardElement - The card DOM element
 * @param {Object} cardObject - The card data object
 * @param {number} index - The index of the card in the room cards array
 */
function setupCardDragEvents(cardElement, cardObject, index) {
  // Make card draggable
  cardElement.setAttribute("draggable", "true");
  cardElement.classList.add("draggable");

  // Add dragstart event
  cardElement.addEventListener("dragstart", (event) => {
    // Create a data object with all necessary card information
    const cardData = {
      id: cardObject.id,
      suit: cardObject.suit,
      rank: cardObject.rank,
      value: cardObject.value,
      index: index,
    };

    // Set drag data
    event.dataTransfer.setData("text/plain", JSON.stringify(cardData));
    event.dataTransfer.effectAllowed = "move";

    // Add dragging class for styling
    cardElement.classList.add("dragging");
  });

  // Add dragend event
  cardElement.addEventListener("dragend", () => {
    cardElement.classList.remove("dragging");
  });
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
  nextRoomBtn.disabled = !gameState.gameActive;
  // Enable skip if game is active, last action was not skip, and 4 cards in room
  if (skipRoomBtn) {
    skipRoomBtn.disabled = !(
      gameState.gameActive &&
      !gameState.lastActionWasSkip &&
      gameState.roomCards &&
      gameState.roomCards.length === 4
    );
  }
}
