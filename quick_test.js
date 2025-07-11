// Quick Console Test for Weapon Stack Visualization
// Copy and paste this into browser console when game is loaded

console.log("🎮 Quick Weapon Stack Test");

// Test the CSS classes are working
function testCSS() {
    console.log("🎨 Testing CSS classes...");
    
    // Check if weapon stack CSS exists
    const styles = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules || sheet.rules || [])
                    .map(rule => rule.selectorText)
                    .filter(selector => selector && selector.includes('weapon-stack'));
            } catch (e) {
                return [];
            }
        })
        .flat();
    
    console.log("✅ Found weapon stack CSS classes:", styles);
    
    // Test weapon stack container creation
    const testContainer = document.createElement('div');
    testContainer.className = 'weapon-stack-container';
    testContainer.style.position = 'relative';
    testContainer.style.width = '120px';
    testContainer.style.height = '170px';
    testContainer.style.border = '2px solid red';
    testContainer.style.margin = '10px';
    
    // Add weapon base
    const weaponBase = document.createElement('div');
    weaponBase.className = 'weapon-base-card';
    weaponBase.style.background = '#3498db';
    weaponBase.textContent = 'WEAPON';
    weaponBase.style.display = 'flex';
    weaponBase.style.alignItems = 'center';
    weaponBase.style.justifyContent = 'center';
    weaponBase.style.color = 'white';
    weaponBase.style.fontWeight = 'bold';
    testContainer.appendChild(weaponBase);
    
    // Add test monsters
    for (let i = 0; i < 3; i++) {
        const monster = document.createElement('div');
        monster.className = 'weapon-stack-card';
        monster.style.background = '#e74c3c';
        monster.textContent = `M${i + 1}`;
        monster.style.display = 'flex';
        monster.style.alignItems = 'center';
        monster.style.justifyContent = 'center';
        monster.style.color = 'white';
        monster.style.fontWeight = 'bold';
        testContainer.appendChild(monster);
    }
    
    // Add to page
    document.body.appendChild(testContainer);
    
    console.log("✅ Test container added to page. Check for layered stacking effect.");
    
    // Clean up after 10 seconds
    setTimeout(() => {
        testContainer.remove();
        console.log("🧹 Test container removed");
    }, 10000);
}

// Test the renderEquipment function
function testRenderEquipment() {
    console.log("🔧 Testing renderEquipment function...");
    
    // Create test weapon slot
    const testSlot = document.createElement('div');
    testSlot.id = 'test-weapon-slot';
    testSlot.className = 'equipment-card';
    testSlot.style.position = 'relative';
    testSlot.style.width = '120px';
    testSlot.style.height = '170px';
    testSlot.style.border = '2px solid blue';
    testSlot.style.margin = '10px';
    document.body.appendChild(testSlot);
    
    // Create test stats element
    const testStats = document.createElement('div');
    testStats.id = 'test-weapon-stats';
    testStats.style.textAlign = 'center';
    testStats.style.marginTop = '5px';
    document.body.appendChild(testStats);
    
    // Mock game state
    const mockGameState = {
        weaponStack: [
            { id: '3_of_clubs', imagePath: 'images/cards/3_of_clubs.png', value: 3 },
            { id: '5_of_spades', imagePath: 'images/cards/5_of_spades.png', value: 5 },
            { id: '2_of_clubs', imagePath: 'images/cards/2_of_clubs.png', value: 2 }
        ]
    };
    
    // Mock weapon
    const mockWeapon = {
        id: '7_of_diamonds',
        imagePath: 'images/cards/7_of_diamonds.png',
        value: 7
    };
    
    // Test the render function (if available)
    if (typeof renderEquipment === 'function') {
        console.log("✅ renderEquipment function found, testing...");
        renderEquipment(mockWeapon, 'test-weapon');
    } else {
        console.log("⚠️  renderEquipment function not available in global scope");
        console.log("💡 Try running this test from the game page or import the module");
    }
    
    // Clean up
    setTimeout(() => {
        testSlot.remove();
        testStats.remove();
        console.log("🧹 Test elements removed");
    }, 15000);
}

// Run tests
console.log("🚀 Running CSS test...");
testCSS();

console.log("🚀 Running render equipment test...");
testRenderEquipment();

console.log("✅ Tests complete! Check the page for visual results.");