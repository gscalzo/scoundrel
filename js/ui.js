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
    const healthBar = document.getElementById('health-bar-fill');
    const healthValue = document.getElementById('health-value');
    
    // Update health bar width
    const healthPercentage = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
    healthBar.style.width = `${healthPercentage}%`;
    
    // Change color based on health percentage
    if (healthPercentage < 25) {
        healthBar.style.backgroundColor = '#c0392b'; // Red when health is low
    } else if (healthPercentage < 50) {
        healthBar.style.backgroundColor = '#e67e22'; // Orange when health is moderate
    } else {
        healthBar.style.backgroundColor = '#27ae60'; // Green when health is high
    }
    
    // Update health text
    healthValue.textContent = `${currentHealth}/${maxHealth}`;
}

/**
 * Render a card in a specific slot
 * @param {Object} card - Card object to render
 * @param {string} slotId - ID of the slot element
 */
export function renderCard(card, slotId) {
    const slot = document.getElementById(slotId);
    
    // Clear any existing content
    slot.innerHTML = '';
    
    // Create card image
    const cardImg = document.createElement('img');
    cardImg.src = card.imagePath;
    cardImg.alt = card.id;
    cardImg.classList.add('card');
    cardImg.dataset.cardId = card.id;
    
    // Add to DOM with animation
    slot.appendChild(cardImg);
    cardImg.classList.add('card-dealt');
    
    return cardImg;
}

/**
 * Update the deck count display
 * @param {number} count - Current number of cards in deck
 */
export function updateDeckCount(count) {
    const deckCount = document.getElementById('deck-count');
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
    slot.innerHTML = '';
    
    if (equipmentCard) {
        // Create equipment image
        const equipImg = document.createElement('img');
        equipImg.src = equipmentCard.imagePath;
        equipImg.alt = equipmentCard.id;
        equipImg.classList.add('equipment');
        
        // Add to DOM
        slot.appendChild(equipImg);
        
        // Update stats
        statsElement.textContent = `Power: ${equipmentCard.value}`;
    } else {
        // No equipment
        const emptyText = document.createElement('div');
        emptyText.classList.add('empty-slot-text');
        emptyText.textContent = `No ${slotType} equipped`;
        slot.appendChild(emptyText);
        
        statsElement.textContent = '';
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
 * Add a message to the game log
 * @param {string} message - Message to add to log
 */
export function addLogMessage(message) {
    const logElement = document.getElementById('message-log');
    const logEntry = document.createElement('p');
    logEntry.classList.add('log-entry');
    logEntry.textContent = message;
    
    // Add the new entry at the top
    logElement.prepend(logEntry);
    
    // Keep the log size reasonable
    const logEntries = logElement.querySelectorAll('.log-entry');
    if (logEntries.length > 50) {
        logElement.removeChild(logEntries[logEntries.length - 1]);
    }
}

/**
 * Update button states based on game state
 * @param {Object} gameState - Current game state
 */
export function updateButtonStates(gameState) {
    const startBtn = document.getElementById('start-game-btn');
    const nextRoomBtn = document.getElementById('next-room-btn');
    
    startBtn.disabled = gameState.gameActive;
    nextRoomBtn.disabled = !gameState.gameActive;
}
