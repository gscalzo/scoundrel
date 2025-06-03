/**
 * Drag and Drop module for Scoundrel card game
 * Implements HTML5 Drag and Drop API
 */

/**
 * Initialize drag and drop functionality
 * @param {Function} onDrop - Callback to invoke when a card is dropped on a valid target
 */
export function initDragAndDrop(onDrop) {
    console.log('Initializing drag and drop functionality');
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
 * Make an element a valid drop target
 * @param {HTMLElement} element - Element to make a drop target
 * @param {Function} onDrop - Function to call when item is dropped
 * @param {Array<string>} allowedTypes - Array of allowed drop types
 */
export function makeDropTarget(element, onDrop, allowedTypes = []) {
    if (!element) return;
    
    element.classList.add('drop-target');
    
    element.addEventListener('dragover', (event) => {
        // Check if this type is allowed
        const dragData = JSON.parse(event.dataTransfer.getData('text/plain') || '{"type":"unknown"}');
        
        if (allowedTypes.length === 0 || allowedTypes.includes(dragData.type)) {
            // Prevent default to allow drop
            event.preventDefault();
            element.classList.add('drag-over');
            event.dataTransfer.dropEffect = 'move';
        }
    });
    
    element.addEventListener('dragleave', () => {
        element.classList.remove('drag-over');
    });
    
    element.addEventListener('drop', (event) => {
        event.preventDefault();
        element.classList.remove('drag-over');
        
        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain'));
            
            // Call the provided callback with the dropped data
            if (typeof onDrop === 'function') {
                onDrop(data, element);
            }
        } catch (error) {
            console.error('Error processing dropped item:', error);
        }
    });
}
