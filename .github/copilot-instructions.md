# Copilot Instructions
This project is a web application for a card game called Scoundrel.

## Project Overview
Core: HTML5, CSS3, ES6+ JavaScript.
Styling: Plain CSS with Flexbox/Grid for layout. No CSS frameworks are strictly necessary to keep it light.
JavaScript:
Modularity: Break JS into modules (e.g., game.js for main logic, deck.js for card/deck operations, ui.js for DOM manipulation, dragDrop.js for drag-and-drop logic). Use ES6 modules (import/export).
State Management: A central JavaScript object (gameState) to hold all game-related data (deck, player stats, room cards, current turn, etc.). Functions will read from and write to this state.
Event-Driven: The game will respond to user interactions (button clicks, card drags/drops).
Drag and Drop: Utilize the native HTML Drag and Drop API.