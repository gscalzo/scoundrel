/**
 * Main entry point for Scoundrel card game
 * Initializes modules and sets up the game
 */

import * as Deck from "./deck.js";
import * as Game from "./game.js";
import * as UI from "./ui.js";
import * as DragDrop from "./dragDrop.js";
import * as CardInteraction from "./cardInteraction.js";

// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "%c Scoundrel Card Game ",
    "background: #2c3e50; color: #ecf0f1; font-size: 18px; font-weight: bold; padding: 5px;"
  );
  console.log(
    "%c A web-based card game built with vanilla JavaScript, HTML5, and CSS3. ",
    "font-style: italic; color: #7f8c8d;"
  );
  console.log("See README.md for game details and instructions.");

  // Test deck module
  const deck = Deck.createDeck();
  console.log(`Created deck with ${deck.length} cards`);

  // Add event listeners
  setupEventListeners();

  // Display welcome message
  UI.addLogMessage(
    'Game loaded successfully. Press "Start Game" to begin your adventure!'
  );
});

/**
 * Set up event listeners for game controls
 */
function setupEventListeners() {
  // Start Game button
  document.getElementById("start-game-btn").addEventListener("click", () => {
    console.log("Starting new game...");
    Game.startNewGame();
  });

  // Next Room button
  document.getElementById("next-room-btn").addEventListener("click", () => {
    console.log("Moving to next room...");
    Game.nextRoom();
  });

  // Reset Game button
  document.getElementById("reset-game-btn").addEventListener("click", () => {
    console.log("Resetting game...");
    Game.resetGame();
  });

  // Deck click
  document.getElementById("deck-card").addEventListener("click", () => {
    console.log("Deck clicked");
    if (Game.gameState.gameActive) {
      UI.addLogMessage("Click 'Next Room' to reveal more cards.");
    } else {
      UI.addLogMessage("Click 'Start Game' to begin playing.");
    }
  });

  // Card slots event delegation for card clicks
  document.querySelector(".card-slots").addEventListener("click", (event) => {
    if (Game.gameState.gameActive) {
      CardInteraction.handleCardClick(event);
    }
  });

  // Initialize drag and drop functionality
  DragDrop.initDragAndDrop();

  // Skip Room button
  document.getElementById("skip-room-btn").addEventListener("click", () => {
    console.log("Skipping current room...");
    Game.skipRoom();
  });
}

// We're now using the UI module's addLogMessage function instead of this one
