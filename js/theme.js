/**
 * Theme Management System for Scoundrel Card Game
 * Handles theme switching and persistence
 */

// Available themes
const THEMES = {
    dark: {
        name: 'Dark Theme',
        description: 'Classic dark dungeon atmosphere'
    },
    light: {
        name: 'Light Theme', 
        description: 'Clean light interface'
    }
};

// Current theme
let currentTheme = 'dark';

/**
 * Initialize theme system
 */
export function initTheme() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('scoundrel-theme');
    if (savedTheme && THEMES[savedTheme]) {
        currentTheme = savedTheme;
    }
    
    // Apply the theme
    applyTheme(currentTheme);
    
    // Update any theme selectors
    updateThemeSelectors();
}

/**
 * Apply a theme to the document
 * @param {string} themeName - Name of the theme to apply
 */
export function applyTheme(themeName) {
    if (!THEMES[themeName]) {
        console.warn(`Theme "${themeName}" not found, using default`);
        themeName = 'dark';
    }
    
    currentTheme = themeName;
    
    // Set the data-theme attribute on the document element
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Save to localStorage
    localStorage.setItem('scoundrel-theme', themeName);
    
    // Update any theme selectors
    updateThemeSelectors();
    
    console.log(`Applied theme: ${THEMES[themeName].name}`);
}

/**
 * Get the current theme
 * @returns {string} Current theme name
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Get all available themes
 * @returns {Object} Object with theme information
 */
export function getAvailableThemes() {
    return THEMES;
}

/**
 * Switch to the next theme in the list
 */
export function switchToNextTheme() {
    const themeNames = Object.keys(THEMES);
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    const nextTheme = themeNames[nextIndex];
    
    applyTheme(nextTheme);
    return nextTheme;
}

/**
 * Update theme selector UI elements
 */
function updateThemeSelectors() {
    // Update any theme selector buttons or dropdowns
    const themeSelectors = document.querySelectorAll('[data-theme-selector]');
    themeSelectors.forEach(selector => {
        if (selector.tagName === 'SELECT') {
            selector.value = currentTheme;
        } else if (selector.tagName === 'BUTTON') {
            const nextTheme = getNextTheme();
            selector.textContent = `Theme: ${THEMES[nextTheme].name}`;
            selector.title = `Switch to ${THEMES[nextTheme].name}`;
        }
    });
}

/**
 * Get the next theme in the rotation
 * @returns {string} Next theme name
 */
function getNextTheme() {
    const themeNames = Object.keys(THEMES);
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    return themeNames[nextIndex];
}

/**
 * Create a theme selector button
 * @param {HTMLElement} container - Container to add the button to
 * @returns {HTMLElement} The created button element
 */
export function createThemeSelector(container) {
    const button = document.createElement('button');
    button.className = 'game-btn';
    button.setAttribute('data-theme-selector', 'true');
    button.onclick = () => {
        const newTheme = switchToNextTheme();
        // Optional: Show a toast notification
        if (window.UI && window.UI.showToast) {
            window.UI.showToast(`Switched to ${THEMES[newTheme].name}`, 'info');
        }
    };
    
    updateThemeSelectors(); // This will set the button text
    
    if (container) {
        container.appendChild(button);
    }
    
    return button;
}

/**
 * Get theme-aware color values
 * @param {string} colorVar - CSS custom property name (without --)
 * @returns {string} The computed color value
 */
export function getThemeColor(colorVar) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(`--${colorVar}`)
        .trim();
}

/**
 * Check if the current theme is dark
 * @returns {boolean} True if current theme is dark
 */
export function isDarkTheme() {
    return currentTheme === 'dark';
}

/**
 * Check if the current theme is light
 * @returns {boolean} True if current theme is light
 */
export function isLightTheme() {
    return currentTheme === 'light';
}