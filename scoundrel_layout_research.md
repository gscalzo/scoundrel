# Scoundrel Card Game Layout Research

## Game Overview
Scoundrel is a solo dungeon crawler card game that uses a standard 52-card deck (with red face cards and red aces removed). The game simulates exploring a dungeon where players encounter monsters, find weapons, and use health potions to survive.

## Traditional Layout Elements

### Card Types and Functions
- **Monsters**: Clubs and Spades (damage equals card value 2-14)
- **Weapons**: Diamonds (reduce monster damage but degrade with use)
- **Health Potions**: Hearts (restore health, but only first potion per turn works)

### Proper Game Board Layout

#### 1. **Pile Cards (Top-Left)**
- Main deck representing the "dungeon"
- Cards are drawn from here to create rooms
- Should be positioned prominently on the left side
- Displays remaining card count

#### 2. **Room Cards (Top-Right)**
- 4 cards laid out horizontally
- Players must interact with 3 of the 4 cards to complete a room
- The 4th card becomes foundation for next room
- Positioned to the right of the pile cards

#### 3. **Armed Weapon (Below Room Cards)**
- Shows currently equipped weapon
- Displays defeated monsters underneath in a stack
- Weapons can only attack monsters weaker than previous target
- Positioned below the main play area for easy reference

### Game Mechanics Insights
- Rooms can be skipped (but not twice in a row)
- Players start with 20 health
- Weapons must attack in descending order of monster strength
- Health potions only work once per turn (additional ones have no effect)
- Goal: Clear the entire dungeon without health reaching zero

## Layout Implementation
The research confirms that the traditional Scoundrel layout places:
- **Deck pile**: Top-left corner for easy access
- **Room cards**: Horizontal arrangement top-right
- **Equipment**: Below the main play area
- **Health tracking**: Separate area (often using removed cards as counters)

This layout maximizes visibility of active game elements while keeping the deck accessible for drawing new rooms.

## Sources Referenced
- rpdillon.net Scoundrel rules and layout diagram
- BoardGameGeek community discussions
- Solo card game layout conventions
- Traditional dungeon crawler card arrangements