/**
 * Main entry point for Scoundrel card game
 * Initializes modules and sets up the game
 */

import * as Deck from './deck.js';
// We'll implement these modules later
// import * as Game from './game.js';
// import * as UI from './ui.js';
// import * as DragDrop from './dragDrop.js';

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c Scoundrel Card Game ', 'background: #2c3e50; color: #ecf0f1; font-size: 18px; font-weight: bold; padding: 5px;');
    console.log('%c A web-based card game built with vanilla JavaScript, HTML5, and CSS3. ', 'font-style: italic; color: #7f8c8d;');
    console.log('See README.md for game details and instructions.');
    
    // Test deck module
    const deck = Deck.createDeck();
    console.log(`Created deck with ${deck.length} cards`);
    
    // Add event listeners
    setupEventListeners();
    
    // Display welcome message
    addLogMessage('Game loaded successfully. Press "Start Game" to begin your adventure!');
});

/**
 * Set up event listeners for game controls
 */
function setupEventListeners() {
    // Start Game button
    document.getElementById('start-game-btn').addEventListener('click', () => {
        console.log('Starting new game...');
        addLogMessage('New game started!');
        // Game.startNewGame() - will implement later
    });
    
    // Next Room button
    document.getElementById('next-room-btn').addEventListener('click', () => {
        console.log('Moving to next room...');
        addLogMessage('Moving to next room...');
        // Game.nextRoom() - will implement later
    });
    
    // Reset Game button
    document.getElementById('reset-game-btn').addEventListener('click', () => {
        console.log('Resetting game...');
        addLogMessage('Game reset. Press "Start Game" to begin a new adventure.');
        // Game.resetGame() - will implement later
    });
    
    // Deck click
    document.getElementById('deck-card').addEventListener('click', () => {
        console.log('Deck clicked');
        // Game.drawCard() - will implement later
    });
}

/**
 * Add a message to the game log
 * @param {string} message - The message to add to the log
 */
function addLogMessage(message) {
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
