# Scoundrel Card Game

A web-based card game built with vanilla JavaScript, HTML5, and CSS3. Navigate through dangerous rooms, collect weapons and armor, and try to survive as long as possible!

![Scoundrel Game](https://via.placeholder.com/800x400?text=Scoundrel+Game)

## 🎮 Game Overview

Scoundrel is a single-player card game where you navigate through a dungeon represented by a standard deck of playing cards. Each card has different effects depending on its suit and rank:

- **Hearts**: Health potions and healing items
- **Diamonds**: Treasure and valuable loot
- **Clubs**: Weapons for combat
- **Spades**: Armor and defensive items

Face cards represent special encounters, while numbered cards represent standard rooms with different difficulty levels based on their rank.

## 🚀 Features

- **Dynamic Card System**: Standard 52-card deck with custom meanings
- **Equipment Management**: Find and equip weapons and armor
- **Health System**: Manage your health to survive dangerous encounters
- **Room Navigation**: Move through rooms represented by dealt cards
- **Drag & Drop Interface**: Intuitive drag and drop controls
- **Responsive Design**: Play on desktop or mobile devices

## 🛠️ Technical Implementation

### Architecture

The game follows a modular architecture using ES6 modules:

- `main.js`: Entry point and initialization
- `game.js`: Game logic and state management
- `deck.js`: Card definitions and deck operations
- `ui.js`: DOM manipulations and UI updates
- `dragDrop.js`: Drag and drop functionality

### State Management

The game state is maintained in a central object that includes:

```javascript
{
  playerHealth: 20,
  maxHealth: 20,
  currentWeapon: null,
  currentArmor: null,
  deck: [],
  roomCards: [],
  currentRound: 0,
  gameActive: false
}
```

### Card System

Cards are represented as objects with properties including:

```javascript
{
  id: "ace_of_spades",
  suit: "spades",
  rank: "ace",
  value: 1,
  imagePath: "images/cards/ace_of_spades.png"
}
```

## 🎯 How to Play

1. **Start Game**: Click the "Start Game" button to begin
2. **Navigate Rooms**: Click "Next Room" to deal cards representing a new room
3. **Deal with Encounters**: Each card has different effects:
   - **Hearts (♥)**: Restore health
   - **Diamonds (♦)**: Collect treasure
   - **Clubs (♣)**: Find weapons or face enemies
   - **Spades (♠)**: Find armor or face traps
4. **Equip Items**: Drag cards to equipment slots to equip weapons and armor
5. **Survive**: Try to last as long as possible!

## 🖥️ Development

### Prerequisites

No build tools or dependencies required! Just a modern web browser.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/scoundrel.git
   ```

2. Open `index.html` in your browser.

### Project Structure

```
scoundrel/
├── index.html           # Main game page
├── css/
│   └── style.css        # Game styling
├── js/
│   ├── main.js          # Main entry point
│   ├── game.js          # Game logic
│   ├── deck.js          # Card & deck operations
│   ├── ui.js            # UI manipulations
│   └── dragDrop.js      # Drag & drop functionality
└── images/
    ├── cards/           # Card images (52 standard cards)
    └── ui/              # UI elements
```

## 🔮 Future Enhancements

- **Save System**: Save and load game progress
- **Multiple Decks**: Add expansions with new card types
- **Character Classes**: Different starting abilities and stats
- **Achievements**: Track player accomplishments
- **Sound Effects**: Add audio feedback for actions
- **Animations**: Enhance visual feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Card images from [here](https://code.google.com/archive/p/vector-playing-cards/)
- Inspiration from classic card games and roguelike mechanics

---

Developed with ❤️ and JavaScript in 2025
