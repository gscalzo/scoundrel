/**
 * Drag and Drop module for Scoundrel card game
 * Implements HTML5 Drag and Drop API
 */

import * as Game from './game.js';
import * as UI from './ui.js';

/**
 * Initialize drag and drop functionality
 * Sets up event listeners for draggable cards and drop targets
 */
export function initDragAndDrop() {
    console.log('Initializing drag and drop functionality');
    
    // Set up equipment slots as drop targets
    setupEquipmentDropZones();
    
    // Cards will be made draggable when they're rendered
}

/**
 * Set up equipment slots as drop targets
 */
function setupEquipmentDropZones() {
    const weaponSlot = document.getElementById('weapon-slot');
    const armorSlot = document.getElementById('armor-slot');
    
    // Make weapon slot a drop target (only diamonds in Scoundrel)
    makeDropTarget(weaponSlot, (cardData) => {
        if (cardData && cardData.suit === 'diamonds') {
            handleEquipmentDrop(cardData, 'weapon');
        } else {
            UI.addLogMessage('Only diamonds (♦) can be equipped as weapons in Scoundrel.');
            UI.showToast('Only diamonds are weapons!', 'error');
        }
    }, ['diamonds']);
    
    // Note: No armor in Scoundrel rules, but keeping the slot for potential future use
    if (armorSlot) {
        makeDropTarget(armorSlot, (cardData) => {
            UI.addLogMessage('No armor in Scoundrel rules. Only weapons (diamonds) can be equipped.');
            UI.showToast('No armor in Scoundrel!', 'warning');
        }, []);
    }
}

/**
 * Make an element draggable
 * @param {HTMLElement} element - Element to make draggable
 * @param {Object} data - Data to transfer when dragged
 */
export function makeDraggable(element, data) {
    if (!element) return;
    
    element.setAttribute('draggable', 'true');
    element.classList.add('draggable');
    
    element.addEventListener('dragstart', (event) => {
        // Set the drag data
        event.dataTransfer.setData('text/plain', JSON.stringify(data));
        event.dataTransfer.effectAllowed = 'move';
        
        // Add a visual class during dragging
        element.classList.add('dragging');
        
        // This helps with drag image in some browsers
        setTimeout(() => {
            element.classList.add('hidden');
        }, 0);
    });
    
    element.addEventListener('dragend', () => {
        // Remove visual classes
        element.classList.remove('dragging', 'hidden');
    });
}

/**
 * Handle equipment drop
 * @param {Object} cardData - Data of the dropped card
 * @param {string} equipmentType - Type of equipment ('weapon' or 'armor')
 */
function handleEquipmentDrop(cardData, equipmentType) {
    console.log(`Card dropped on ${equipmentType} slot:`, cardData);
    
    // Find the card object in the room cards
    const cardIndex = parseInt(cardData.index, 10);
    
    if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= Game.gameState.roomCards.length) {
        console.error('Invalid card index:', cardIndex);
        return;
    }
    
    const card = Game.gameState.roomCards[cardIndex];
    
    // Attempt to equip the item
    Game.equipItem(card, equipmentType, cardIndex);
}

/**
 * Make an element a valid drop target
 * @param {HTMLElement} element - Element to make a drop target
 * @param {Function} onDrop - Function to call when item is dropped
 * @param {Array<string>} allowedSuits - Array of allowed card suits
 */
export function makeDropTarget(element, onDrop, allowedSuits = []) {
    if (!element) return;
    
    element.classList.add('drop-target');
    
    element.addEventListener('dragover', (event) => {
        // We can't actually access the drag data during dragover due to security restrictions
        // So we'll just check if any drag is happening and allow drop, then validate in the drop handler
        event.preventDefault();
        element.classList.add('drag-over');
        event.dataTransfer.dropEffect = 'move';
    });
    
    element.addEventListener('dragenter', (event) => {
        event.preventDefault();
        element.classList.add('drag-over');
    });
    
    element.addEventListener('dragleave', () => {
        element.classList.remove('drag-over');
    });
    
    element.addEventListener('drop', (event) => {
        event.preventDefault();
        element.classList.remove('drag-over');
        
        try {
            const dataText = event.dataTransfer.getData('text/plain');
            if (!dataText) {
                console.error('No data found in drag event');
                return;
            }
            
            const data = JSON.parse(dataText);
            
            // Filter by suit if allowed suits are specified
            if (allowedSuits.length > 0 && !allowedSuits.includes(data.suit)) {
                UI.addLogMessage(`This card cannot be placed here. Only ${allowedSuits.join(', ')} allowed.`);
                UI.showToast(`Wrong card type! Need ${allowedSuits.join(' or ')}`, 'error');
                return;
            }
            
            // Call the provided callback with the dropped data
            if (typeof onDrop === 'function') {
                onDrop(data, element);
            }
        } catch (error) {
            console.error('Error processing dropped item:', error);
        }
    });
}
