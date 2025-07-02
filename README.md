# Scoundrel Card Game

A web-based card game built with vanilla JavaScript, HTML5, and CSS3. Navigate through dangerous rooms, collect weapons and armor, and try to survive as long as possible!

<div align="center">

![Scoundrel Game](images/game-room-dealt.png)

</div>

## 📸 Screenshots

<div align="center">

| Initial Screen | Gameplay | Multiple Rooms |
|:---:|:---:|:---:|
| ![Initial](images/game-initial.png) | ![Gameplay](images/game-with-equipment.png) | ![Multiple Rooms](images/game-multiple-rooms.png) |
| Game start screen with controls | Cards dealt and equipment slots | Multiple rooms in progress |

</div>

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

## 🌐 Live Demo

**Play the game online**: [https://gscalzo.github.io/scoundrel](https://gscalzo.github.io/scoundrel)

## 🖥️ Development

### Prerequisites

No build tools or dependencies required! Just a modern web browser.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gscalzo/scoundrel.git
   ```

2. Open `index.html` in your browser.

### 🧪 Testing

**IMPORTANT: Tests must be run before any deployment!**

This project includes a comprehensive test suite to ensure code quality and deployment readiness:

#### Running Tests

**Local Development:**
1. **Browser testing**: Open `tests/test.html` in your browser and click "🚀 Run All Tests"
2. **Quick verification**: Run `cd tests && node quick-test.js` for fast validation
3. **Selective testing**: Use "⚙️ Unit Tests Only" or "🔗 Integration Tests Only" buttons

**CI/CD Environment:** Tests run automatically with multiple fallback approaches for reliability

#### Test Coverage

- **Unit Tests**: Core game logic, deck operations, health system, equipment mechanics
- **Integration Tests**: Module interactions, complete game flow, state consistency
- **Deployment Sanity**: DOM elements, event handlers, CSS loading, module imports

#### Test Requirements

- All tests must pass before deployment
- Unit tests verify individual module functionality
- Integration tests ensure proper module interaction
- Deployment tests confirm the game works in production environment

#### Test Structure

```
tests/
├── test.html              # Main test runner page
├── test-runner.js          # Testing framework
├── unit/
│   ├── deck.test.js        # Deck module unit tests
│   └── game.test.js        # Game module unit tests
└── integration/
    └── integration.test.js # Integration & deployment tests
```

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages with **mandatory testing**:

1. **Fork or clone** this repository to your GitHub account
2. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
3. **Set up branch protection** (see `.github/branch-protection.md` for details):
   - Navigate to Settings → Branches
   - Add protection rule for `main`/`master`
   - Require status checks: Tests must pass before merging
4. **Push to main/master branch** - deployment happens automatically **only after tests pass**
5. **Access your game** at `https://gscalzo.github.io/scoundrel`

#### 🔒 Quality Gates

The deployment pipeline includes mandatory quality gates:

- ✅ **All tests must pass** (unit, integration, deployment sanity)
- ✅ **Security checks** (no sensitive files, code quality validation)
- ✅ **Performance validation** (game loads correctly)
- ✅ **Test coverage analysis** (all core modules covered)

**Pull Requests are automatically tested** and cannot be merged unless all checks pass.

📖 **For detailed deployment instructions, troubleshooting, and advanced configuration, see [DEPLOYMENT.md](DEPLOYMENT.md)**

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

## 🤝 Contributing

We welcome contributions! To maintain code quality, all contributions must pass our test suite:

### Pull Request Process

1. **Fork** the repository and create a feature branch
2. **Make your changes** and add tests if needed
3. **Run tests locally**: `cd tests && node run-tests.js`
4. **Submit a Pull Request** to the main branch
5. **Automated testing** will run on your PR
6. **All tests must pass** before the PR can be merged
7. **Code review** from maintainers
8. **Merge** after approval and passing tests

### Required Checks

Your PR must pass these automated checks:

- 🧪 **Unit Tests**: Core game logic validation
- 🔗 **Integration Tests**: Module interaction verification  
- 🛡️ **Security Checks**: Code quality and security validation
- 📊 **Test Coverage**: Adequate test coverage verification

See `tests/README.md` for detailed testing information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Card images from [here](https://code.google.com/archive/p/vector-playing-cards/)
- Inspiration from classic card games and roguelike mechanics

---

Developed with ❤️ and JavaScript in 2025
