/**
 * Quick test script for weapon stack visualization
 * Run this in the browser console when the game is loaded
 */

// Test function to simulate weapon stacking
function testWeaponStack() {
    console.log("🔧 Testing weapon stack visualization...");
    
    // Import the modules we need
    import('./js/game.js').then(Game => {
        import('./js/ui.js').then(UI => {
            // Reset game state
            Game.resetGame();
            
            // Create test weapon (diamond card)
            const testWeapon = {
                id: "7_of_diamonds",
                suit: "diamonds",
                rank: "7",
                value: 7,
                imagePath: "images/cards/7_of_diamonds.png"
            };
            
            // Create test monsters with different values
            const testMonsters = [
                {
                    id: "3_of_clubs",
                    suit: "clubs", 
                    rank: "3",
                    value: 3,
                    imagePath: "images/cards/3_of_clubs.png"
                },
                {
                    id: "5_of_spades",
                    suit: "spades",
                    rank: "5", 
                    value: 5,
                    imagePath: "images/cards/5_of_spades.png"
                },
                {
                    id: "2_of_clubs",
                    suit: "clubs",
                    rank: "2",
                    value: 2,
                    imagePath: "images/cards/2_of_clubs.png"
                },
                {
                    id: "4_of_spades",
                    suit: "spades",
                    rank: "4",
                    value: 4,
                    imagePath: "images/cards/4_of_spades.png"
                }
            ];
            
            console.log("✅ Equipping test weapon:", testWeapon.id);
            
            // Set up weapon in game state
            Game.gameState.currentWeapon = testWeapon;
            Game.gameState.weaponStack = [];
            
            // Render initial weapon
            UI.renderEquipment(testWeapon, "weapon");
            
            // Add monsters to stack progressively with delays for visual effect
            testMonsters.forEach((monster, index) => {
                setTimeout(() => {
                    console.log(`👹 Adding monster ${index + 1}:`, monster.id);
                    Game.gameState.weaponStack.push(monster);
                    UI.renderEquipment(testWeapon, "weapon");
                    
                    if (index === testMonsters.length - 1) {
                        console.log("🎯 Test complete! Check the weapon slot to see the stacked visualization.");
                        console.log("Expected: Weapon as base layer with", testMonsters.length, "monsters stacked on top");
                    }
                }, (index + 1) * 1000); // 1 second delay between each monster
            });
            
        }).catch(err => console.error("❌ Error loading UI module:", err));
    }).catch(err => console.error("❌ Error loading Game module:", err));
}

// Test function for overflow (more than 5 monsters)
function testWeaponStackOverflow() {
    console.log("🔧 Testing weapon stack overflow visualization...");
    
    import('./js/game.js').then(Game => {
        import('./js/ui.js').then(UI => {
            // Create test weapon
            const testWeapon = {
                id: "10_of_diamonds",
                suit: "diamonds",
                rank: "10",
                value: 10,
                imagePath: "images/cards/10_of_diamonds.png"
            };
            
            // Create 7 test monsters to trigger overflow
            const testMonsters = [];
            for (let i = 1; i <= 7; i++) {
                testMonsters.push({
                    id: `${i}_of_clubs`,
                    suit: "clubs",
                    rank: `${i}`,
                    value: i,
                    imagePath: `images/cards/${i}_of_clubs.png`
                });
            }
            
            // Set up weapon and monsters
            Game.gameState.currentWeapon = testWeapon;
            Game.gameState.weaponStack = testMonsters;
            
            console.log("✅ Testing overflow with 7 monsters (should show +2 indicator)");
            UI.renderEquipment(testWeapon, "weapon");
            
            console.log("🎯 Overflow test complete! Check for +2 indicator on weapon stack.");
            
        }).catch(err => console.error("❌ Error loading UI module:", err));
    }).catch(err => console.error("❌ Error loading Game module:", err));
}

// Run tests
console.log("🎮 Weapon Stack Visualization Tests");
console.log("Run testWeaponStack() to test normal stacking");
console.log("Run testWeaponStackOverflow() to test overflow indicator");

// Export functions to global scope for console access
window.testWeaponStack = testWeaponStack;
window.testWeaponStackOverflow = testWeaponStackOverflow;