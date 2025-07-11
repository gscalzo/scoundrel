/**
 * Card interaction functionality for Scoundrel
 */

import * as Game from './game.js';
import * as UI from './ui.js';
import { showCombatModal, showHealingModal } from './modal.js';

/**
 * Handle click on a room card
 * @param {Event} event - Click event
 */
export function handleCardClick(event) {
    // Find the closest card element
    const cardElement = event.target.closest('.card');
    if (!cardElement) return;
    
    // Get card index from dataset
    const cardIndex = parseInt(cardElement.dataset.index, 10);
    
    // Validate index
    if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= Game.gameState.roomCards.length) {
        console.error('Invalid card index:', cardIndex);
        return;
    }
    
    const card = Game.gameState.roomCards[cardIndex];
    
    // Process card based on Scoundrel rules
    switch (card.suit) {
        case 'hearts':
            // Hearts are healing potions - warn if already used one this room
            if (Game.gameState.potionUsedThisRoom) {
                showHealingModal(card, true).then(proceed => {
                    if (proceed) {
                        Game.processCardEffects(card, cardIndex);
                    }
                });
            } else {
                showHealingModal(card, false).then(proceed => {
                    if (proceed) {
                        Game.processCardEffects(card, cardIndex);
                    }
                });
            }
            break;
            
        case 'diamonds':
            // Diamonds are weapons - show message to drag to weapon slot
            Game.processCardEffects(card, cardIndex);
            break;
            
        case 'clubs':
        case 'spades':
            // All clubs and spades are monsters - offer combat choice
            handleMonsterClick(card, cardIndex);
            break;
    }
}

/**
 * Handle clicking on a monster card - offer weapon or bare-handed combat
 * @param {Object} card - Monster card
 * @param {number} cardIndex - Index of the card
 */
function handleMonsterClick(card, cardIndex) {
    // Check if player has a weapon and can use it
    const hasWeapon = Game.gameState.currentWeapon !== null;
    const canUseWeapon = hasWeapon && canAttackMonster(card);
    
    if (hasWeapon && canUseWeapon) {
        // Offer choice: weapon or bare-handed
        showCombatModal(card, Game.gameState.currentWeapon).then(choice => {
            if (choice === 'weapon') {
                Game.processCardEffects(card, cardIndex);
            } else if (choice === 'barehanded') {
                Game.fightBareHanded(card, cardIndex);
            }
        });
    } else if (hasWeapon && !canUseWeapon) {
        // Cannot use weapon due to "strictly weaker" rule - offer bare-handed only
        let message = `Cannot use weapon against this monster`;
        if (Game.gameState.weaponStack.length > 0) {
            const lastMonster = Game.gameState.weaponStack[Game.gameState.weaponStack.length - 1];
            message += ` - must be weaker than last defeated monster (${lastMonster.rank})`;
        }
        message += '.';
        
        showCombatModal(card, null).then(choice => {
            if (choice === 'barehanded') {
                Game.fightBareHanded(card, cardIndex);
            }
        });
    } else {
        // No weapon - fight bare-handed
        showCombatModal(card, null).then(choice => {
            if (choice === 'barehanded') {
                Game.processCardEffects(card, cardIndex);
            }
        });
    }
}

/**
 * Check if a monster can be attacked by the current weapon (helper function)
 * @param {Object} monster - Monster card to check
 * @returns {boolean} Whether the monster can be attacked
 */
function canAttackMonster(monster) {
    if (!Game.gameState.currentWeapon) {
        return true; // No weapon equipped - can fight any monster bare-handed
    }
    
    if (Game.gameState.weaponStack.length === 0) {
        return true; // First monster with equipped weapon - can fight any monster
    }
    
    const lastDefeatedMonster = Game.gameState.weaponStack[Game.gameState.weaponStack.length - 1];
    return monster.value <= lastDefeatedMonster.value; // Must be less than or equal
}
