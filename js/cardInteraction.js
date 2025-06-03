/**
 * Card interaction functionality for Scoundrel
 */

import * as Game from './game.js';
import * as UI from './ui.js';

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
    
    // Process card based on suit
    switch (card.suit) {
        case 'hearts':
            // Hearts are used immediately for healing
            Game.processCardEffects(card, cardIndex);
            break;
            
        case 'diamonds':
            // Diamonds are collected immediately for treasure
            Game.processCardEffects(card, cardIndex);
            break;
            
        case 'clubs':
            if (['jack', 'queen', 'king'].includes(card.rank)) {
                // Face cards are enemies and attack immediately
                Game.processCardEffects(card, cardIndex);
            } else {
                // Number cards are potential weapons
                UI.addLogMessage(`Drag the ${card.rank} of clubs to your weapon slot to equip it.`);
            }
            break;
            
        case 'spades':
            if (['jack', 'queen', 'king'].includes(card.rank)) {
                // Face cards are traps and trigger immediately
                Game.processCardEffects(card, cardIndex);
            } else {
                // Number cards are potential armor
                UI.addLogMessage(`Drag the ${card.rank} of spades to your armor slot to equip it.`);
            }
            break;
    }
}
