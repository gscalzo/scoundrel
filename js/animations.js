/**
 * Animation system for Scoundrel card game
 * Handles smooth card movements between game areas
 */

/**
 * Get the absolute position and size of an element
 * @param {HTMLElement} element - Element to get position for
 * @returns {Object} Position and size info
 */
function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + window.scrollX + rect.width / 2,
    centerY: rect.top + window.scrollY + rect.height / 2
  };
}

/**
 * Create a flying card element for animation
 * @param {Object} card - Card object
 * @param {Object} startPos - Starting position
 * @returns {HTMLElement} Flying card element
 */
function createFlyingCard(card, startPos) {
  const flyingCard = document.createElement('img');
  flyingCard.src = card.imagePath;
  flyingCard.alt = card.id;
  flyingCard.className = 'flying-card';
  
  // Set initial position and size
  flyingCard.style.cssText = `
    position: absolute;
    left: ${startPos.x}px;
    top: ${startPos.y}px;
    width: ${startPos.width}px;
    height: ${startPos.height}px;
    z-index: 1100;
    pointer-events: none;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    transition: all 3s ease-in-out;
    border: 3px solid red;
  `;
  
  document.body.appendChild(flyingCard);
  return flyingCard;
}

/**
 * Animate a card moving from one element to another
 * @param {HTMLElement} fromElement - Source element
 * @param {HTMLElement} toElement - Destination element
 * @param {Object} card - Card object being moved
 * @param {Function} callback - Function to call when animation completes
 * @param {Object} options - Animation options
 */
export function animateCardMovement(fromElement, toElement, card, callback = () => {}, options = {}) {
  console.log('Starting card animation:', card.id, 'type:', options.animationType || 'move');
  
  // Default options
  const {
    duration = 3000, // Slow down to 3 seconds for debugging
    removeOriginal = true,
    addToDestination = true,
    animationType = 'move' // 'move', 'discard', 'deal'
  } = options;
  
  // Get positions
  const startPos = getElementPosition(fromElement);
  const endPos = getElementPosition(toElement);
  
  // Create flying card
  const flyingCard = createFlyingCard(card, startPos);
  
  // Hide original card if requested
  if (removeOriginal) {
    fromElement.style.opacity = '0';
  }
  
  // Add animation class based on type
  flyingCard.classList.add(`card-${animationType}`);
  
  console.log('Flying card created, starting animation in 100ms');
  
  // Start animation after a small delay to ensure element is in DOM
  setTimeout(() => {
    console.log('Moving card from', startPos, 'to', endPos);
    
    // Move the card to destination
    flyingCard.style.left = `${endPos.x}px`;
    flyingCard.style.top = `${endPos.y}px`;
    flyingCard.style.width = `${endPos.width}px`;
    flyingCard.style.height = `${endPos.height}px`;
    
    // Special effects for different animation types
    if (animationType === 'discard') {
      flyingCard.style.transform = 'rotate(15deg) scale(0.8)';
      flyingCard.style.opacity = '0.7';
    } else if (animationType === 'deal') {
      flyingCard.style.transform = 'rotateY(0deg)';
      flyingCard.style.backgroundColor = 'rgba(255, 255, 0, 0.3)'; // Yellow highlight for debugging
    }
  }, 100);
  
  // Clean up after animation
  setTimeout(() => {
    // Remove flying card
    if (flyingCard.parentNode) {
      flyingCard.parentNode.removeChild(flyingCard);
    }
    
    // Restore original element
    if (removeOriginal) {
      fromElement.style.opacity = '';
    }
    
    // Call completion callback
    callback();
  }, duration);
}

/**
 * Animate multiple cards being discarded simultaneously
 * @param {Array} cardElements - Array of card elements to discard
 * @param {HTMLElement} discardElement - Discard pile element
 * @param {Array} cards - Array of card objects
 * @param {Function} callback - Function to call when all animations complete
 */
export function animateMultipleCardsToDiscard(cardElements, discardElement, cards, callback = () => {}) {
  if (cardElements.length === 0) {
    callback();
    return;
  }
  
  let completedAnimations = 0;
  const totalAnimations = cardElements.length;
  
  const animationCallback = () => {
    completedAnimations++;
    if (completedAnimations >= totalAnimations) {
      callback();
    }
  };
  
  // Start animations with slight delays for visual effect
  cardElements.forEach((element, index) => {
    setTimeout(() => {
      animateCardMovement(
        element,
        discardElement,
        cards[index],
        animationCallback,
        { animationType: 'discard', duration: 3000 }
      );
    }, index * 100); // 100ms delay between each card
  });
}

/**
 * Animate card being equipped as weapon
 * @param {HTMLElement} fromElement - Source room card element
 * @param {HTMLElement} weaponSlot - Weapon slot element
 * @param {Object} card - Card being equipped
 * @param {Function} callback - Function to call when animation completes
 */
export function animateCardToWeapon(fromElement, weaponSlot, card, callback = () => {}) {
  animateCardMovement(
    fromElement,
    weaponSlot,
    card,
    callback,
    { animationType: 'move', duration: 3000 }
  );
}

/**
 * Animate card being consumed (hearts, monsters)
 * @param {HTMLElement} fromElement - Source room card element
 * @param {HTMLElement} discardElement - Discard pile element
 * @param {Object} card - Card being consumed
 * @param {Function} callback - Function to call when animation completes
 */
export function animateCardConsumption(fromElement, discardElement, card, callback = () => {}) {
  // Add special effect for consumption
  const originalTransform = fromElement.style.transform;
  fromElement.style.transform = 'scale(1.1)';
  fromElement.style.transition = 'transform 0.2s ease';
  
  setTimeout(() => {
    fromElement.style.transform = originalTransform;
    
    setTimeout(() => {
      animateCardMovement(
        fromElement,
        discardElement,
        card,
        callback,
        { animationType: 'discard', duration: 3000 }
      );
    }, 200);
  }, 200);
}

/**
 * Animate cards being dealt from deck to room
 * @param {HTMLElement} deckElement - Deck element
 * @param {Array} roomSlots - Array of room slot elements
 * @param {Array} cards - Array of cards being dealt
 * @param {Function} callback - Function to call when all animations complete
 */
export function animateCardDealing(deckElement, roomSlots, cards, callback = () => {}) {
  if (cards.length === 0) {
    callback();
    return;
  }
  
  let completedAnimations = 0;
  const totalAnimations = cards.length;
  
  const animationCallback = () => {
    completedAnimations++;
    if (completedAnimations >= totalAnimations) {
      callback();
    }
  };
  
  // Deal cards with delays
  cards.forEach((card, index) => {
    if (index < roomSlots.length) {
      setTimeout(() => {
        console.log(`Dealing card ${index + 1}: ${card.id}`);
        animateCardMovement(
          deckElement,
          roomSlots[index],
          card,
          animationCallback,
          { 
            animationType: 'deal', 
            duration: 3000,
            removeOriginal: false,
            addToDestination: false
          }
        );
      }, index * 500); // 500ms delay between each card for visibility
    }
  });
}

/**
 * Create a pulsing effect for important UI elements
 * @param {HTMLElement} element - Element to pulse
 * @param {string} color - Color for the pulse effect
 * @param {number} duration - Duration of the pulse in ms
 */
export function createPulseEffect(element, color = '#3498db', duration = 1000) {
  const originalBoxShadow = element.style.boxShadow;
  
  element.style.transition = `box-shadow ${duration / 2}ms ease-in-out`;
  element.style.boxShadow = `0 0 20px ${color}`;
  
  setTimeout(() => {
    element.style.boxShadow = originalBoxShadow;
    setTimeout(() => {
      element.style.transition = '';
    }, duration / 2);
  }, duration / 2);
}

/**
 * Animate weapon replacement - old weapon and monsters to discard
 * @param {HTMLElement} weaponSlot - Current weapon slot
 * @param {HTMLElement} discardElement - Discard pile element
 * @param {Object} oldWeapon - Old weapon card
 * @param {Array} monsters - Array of defeated monster cards
 * @param {Function} callback - Function to call when animation completes
 */
export function animateWeaponReplacement(weaponSlot, discardElement, oldWeapon, monsters, callback = () => {}) {
  // Create elements for the old weapon and monsters for animation
  const weaponElement = weaponSlot.querySelector('img');
  const monsterElements = [];
  
  // Get monster elements from weapon stack
  const stackContainer = document.getElementById('weapon-stack');
  if (stackContainer) {
    monsterElements.push(...stackContainer.querySelectorAll('.weapon-stack-card'));
  }
  
  const allElements = [];
  const allCards = [];
  
  // Add weapon if it exists
  if (weaponElement && oldWeapon) {
    allElements.push(weaponElement);
    allCards.push(oldWeapon);
  }
  
  // Add monsters
  monsters.forEach((monster, index) => {
    if (monsterElements[index]) {
      allElements.push(monsterElements[index]);
      allCards.push(monster);
    }
  });
  
  // Animate all cards to discard
  animateMultipleCardsToDiscard(allElements, discardElement, allCards, callback);
}