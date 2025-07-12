/**
 * Card interaction functionality for Scoundrel
 */

import * as Game from './game.js';
import * as UI from './ui.js';
import * as Animations from './animations.js';
import { showCombatModal, showHealingModal, showWeaponEquipModal } from './modal.js';

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
                        // Delay animation until modal is fully closed
                        setTimeout(() => {
                            console.log('Starting hearts animation after modal');
                            animateCardConsumption(cardElement, card, cardIndex, 'hearts');
                        }, 350);
                    }
                });
            } else {
                showHealingModal(card, false).then(proceed => {
                    if (proceed) {
                        // Delay animation until modal is fully closed
                        setTimeout(() => {
                            console.log('Starting hearts animation after modal');
                            animateCardConsumption(cardElement, card, cardIndex, 'hearts');
                        }, 350);
                    }
                });
            }
            break;
            
        case 'diamonds':
            // Diamonds are weapons - show equip modal
            handleWeaponClick(card, cardIndex);
            break;
            
        case 'clubs':
        case 'spades':
            // All clubs and spades are monsters - offer combat choice
            console.log('👹 MONSTER: Processing monster combat for', card.id, 'suit:', card.suit);
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
    console.log('👹 HANDLE MONSTER: handleMonsterClick called for', card.id);
    // Check if player has a weapon and can use it
    const hasWeapon = Game.gameState.currentWeapon !== null;
    const canUseWeapon = hasWeapon && canAttackMonster(card);
    console.log('🛡️ WEAPON CHECK: hasWeapon =', hasWeapon, 'canUseWeapon =', canUseWeapon);
    
    if (hasWeapon && canUseWeapon) {
        // Offer choice: weapon or bare-handed
        const cardElement = document.querySelector(`[data-index="${cardIndex}"]`);
        showCombatModal(card, Game.gameState.currentWeapon).then(choice => {
            if (choice === 'weapon') {
                console.log('🗡️ WEAPON COMBAT: User chose weapon for', card.id);
                // Delay animation until modal is fully closed
                setTimeout(() => {
                    console.log('🎬 STARTING: animateMonsterToWeaponStack for', card.id);
                    animateMonsterToWeaponStack(cardElement, card, cardIndex);
                }, 350);
            } else if (choice === 'barehanded') {
                // Delay animation until modal is fully closed
                setTimeout(() => {
                    animateCardConsumption(cardElement, card, cardIndex, 'monster', true);
                }, 350);
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
        
        const cardElement = document.querySelector(`[data-index="${cardIndex}"]`);
        showCombatModal(card, null).then(choice => {
            if (choice === 'barehanded') {
                // Delay animation until modal is fully closed
                setTimeout(() => {
                    animateCardConsumption(cardElement, card, cardIndex, 'monster', true);
                }, 350);
            }
        });
    } else {
        // No weapon - fight bare-handed
        const cardElement = document.querySelector(`[data-index="${cardIndex}"]`);
        showCombatModal(card, null).then(choice => {
            if (choice === 'barehanded') {
                // Delay animation until modal is fully closed
                setTimeout(() => {
                    animateCardConsumption(cardElement, card, cardIndex, 'monster');
                }, 350);
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
    return monster.value < lastDefeatedMonster.value; // Must be strictly weaker (less than)
}

/**
 * Handle clicking on a weapon card - show equip modal
 * @param {Object} card - Weapon card
 * @param {number} cardIndex - Index of the card
 */
async function handleWeaponClick(card, cardIndex) {
    // Show weapon equip modal with current weapon info
    const userConfirmed = await showWeaponEquipModal(
        card,
        Game.gameState.currentWeapon,
        Game.gameState.weaponStack
    );
    
    if (userConfirmed) {
        // Delay weapon equipping until modal is fully closed
        setTimeout(async () => {
            // User confirmed, equip the weapon (skip confirmation since we already confirmed)
            await Game.equipItem(card, 'weapon', cardIndex, true);
        }, 350);
    }
}

/**
 * Animate card consumption for hearts and monsters
 * @param {HTMLElement} cardElement - The card element being consumed
 * @param {Object} card - The card object
 * @param {number} cardIndex - Index of the card
 * @param {string} type - Type of card (hearts, monster)
 * @param {boolean} bareHanded - Whether fighting bare-handed
 */
function animateCardConsumption(cardElement, card, cardIndex, type, bareHanded = false) {
    const discardElement = document.getElementById('discard-pile');
    
    if (discardElement && cardElement) {
        Animations.animateCardConsumption(
            cardElement,
            discardElement,
            card,
            () => {
                // Process the card effect after animation
                if (type === 'hearts') {
                    Game.processCardEffects(card, cardIndex);
                } else if (type === 'monster') {
                    if (bareHanded) {
                        Game.fightBareHanded(card, cardIndex);
                    } else {
                        Game.processCardEffects(card, cardIndex);
                    }
                }
            }
        );
    } else {
        // Fallback to immediate processing if animation fails
        if (type === 'hearts') {
            Game.processCardEffects(card, cardIndex);
        } else if (type === 'monster') {
            if (bareHanded) {
                Game.fightBareHanded(card, cardIndex);
            } else {
                Game.processCardEffects(card, cardIndex);
            }
        }
    }
}

/**
 * Animate monster card to weapon stack (for weapon defeats)
 * @param {HTMLElement} cardElement - Card DOM element
 * @param {Object} card - Monster card object
 * @param {number} cardIndex - Index of the card
 */
function animateMonsterToWeaponStack(cardElement, card, cardIndex) {
    console.log('🎯 FUNCTION: animateMonsterToWeaponStack called for', card.id);
    const weaponStackElement = document.getElementById('weapon-stack');
    
    console.log('🔍 ELEMENTS: cardElement exists?', !!cardElement, 'weaponStackElement exists?', !!weaponStackElement);
    
    if (weaponStackElement && cardElement) {
        console.log('✅ ANIMATION: Starting animateCardToWeaponStack for', card.id);
        Animations.animateCardToWeaponStack(
            cardElement,
            weaponStackElement,
            card,
            () => {
                console.log('🏁 CALLBACK: Animation completed for', card.id, '- processing effects');
                // Process the card effect after animation (weapon combat)
                // Use a special flag to delay UI updates until animation completes
                Game.processCardEffectsWithDelayedUI(card, cardIndex);
                
                console.log('🔄 UI UPDATE: Checking if we need to render equipment');
                // Update weapon equipment display after animation and logic complete
                if (Game.gameState.currentWeapon && Game.gameState.weaponStack.length > 0) {
                    console.log('🎨 RENDERING: Updating weapon equipment display with', Game.gameState.weaponStack.length, 'monsters');
                    // Use import to get UI module
                    import('../js/ui.js').then(UI => {
                        UI.renderEquipment(Game.gameState.currentWeapon, "weapon");
                        console.log('✨ COMPLETE: Weapon equipment display updated');
                    });
                } else {
                    console.log('❌ SKIP: No weapon or empty weapon stack');
                }
            }
        );
    } else {
        console.log('⚠️ FALLBACK: Animation elements not found, using immediate processing');
        // Fallback to immediate processing if animation fails
        Game.processCardEffects(card, cardIndex);
    }
}
