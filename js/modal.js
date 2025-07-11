/**
 * Custom Modal/Popup System for Scoundrel Card Game
 * Replaces browser confirm() dialogs with styled modals
 */

/**
 * Create and show a modal dialog
 * @param {Object} options - Modal configuration
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message
 * @param {string} options.icon - Icon (emoji) to show
 * @param {Array} options.buttons - Array of button objects
 * @param {Object} options.cardInfo - Optional card information to display
 * @returns {Promise} Promise that resolves with the clicked button value
 */
export function showModal(options) {
    return new Promise((resolve) => {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // Create modal content
        const content = document.createElement('div');
        content.className = 'modal-content';

        // Create header
        const header = document.createElement('div');
        header.className = 'modal-header';

        if (options.icon) {
            const icon = document.createElement('div');
            icon.className = 'modal-icon';
            icon.textContent = options.icon;
            header.appendChild(icon);
        }

        const title = document.createElement('h2');
        title.className = 'modal-title';
        title.textContent = options.title || 'Scoundrel';
        header.appendChild(title);

        content.appendChild(header);

        // Create body
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.textContent = options.message || '';

        // Add card info if provided
        if (options.cardInfo) {
            const cardInfo = document.createElement('div');
            cardInfo.className = 'modal-card-info';
            
            const cardName = document.createElement('div');
            cardName.className = 'modal-card-name';
            cardName.textContent = `${options.cardInfo.rank} of ${options.cardInfo.suit}`;
            cardInfo.appendChild(cardName);

            if (options.cardInfo.details) {
                const cardDetails = document.createElement('div');
                cardDetails.className = 'modal-card-details';
                cardDetails.textContent = options.cardInfo.details;
                cardInfo.appendChild(cardDetails);
            }

            body.appendChild(cardInfo);
        }

        // Add combat stats if provided
        if (options.combatStats) {
            const combatStats = document.createElement('div');
            combatStats.className = 'combat-stats';

            options.combatStats.forEach(stat => {
                const statDiv = document.createElement('div');
                statDiv.className = 'combat-stat';

                const label = document.createElement('div');
                label.className = 'combat-stat-label';
                label.textContent = stat.label;
                statDiv.appendChild(label);

                const value = document.createElement('div');
                value.className = 'combat-stat-value';
                value.textContent = stat.value;
                statDiv.appendChild(value);

                combatStats.appendChild(statDiv);
            });

            body.appendChild(combatStats);
        }

        content.appendChild(body);

        // Create actions
        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        options.buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `modal-btn ${button.className || 'modal-btn-secondary'}`;
            btn.textContent = button.text;
            btn.onclick = () => {
                closeModal(overlay);
                resolve(button.value);
            };
            actions.appendChild(btn);
        });

        content.appendChild(actions);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Show modal with animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal(overlay);
                document.removeEventListener('keydown', handleEscape);
                resolve(null);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Handle background click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
                resolve(null);
            }
        };
    });
}

/**
 * Close modal with animation
 * @param {HTMLElement} overlay - Modal overlay element
 */
function closeModal(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 300);
}

/**
 * Show a combat choice modal
 * @param {Object} monster - Monster card object
 * @param {Object} weapon - Weapon card object (optional)
 * @returns {Promise} Promise that resolves with 'weapon', 'barehanded', or null
 */
export function showCombatModal(monster, weapon = null) {
    const buttons = [];
    const combatStats = [];

    if (weapon) {
        const weaponDamage = Math.max(0, monster.value - weapon.value);
        const bareHandedDamage = monster.value;

        buttons.push({
            text: `Use ${weapon.rank} ⚔️`,
            value: 'weapon',
            className: 'modal-btn-primary'
        });

        buttons.push({
            text: 'Fight Bare-Handed',
            value: 'barehanded',
            className: 'modal-btn-secondary'
        });

        combatStats.push(
            { label: 'With Weapon', value: `${weaponDamage} damage` },
            { label: 'Bare-Handed', value: `${bareHandedDamage} damage` }
        );
    } else {
        buttons.push({
            text: 'Fight!',
            value: 'barehanded',
            className: 'modal-btn-danger'
        });

        buttons.push({
            text: 'Cancel',
            value: null,
            className: 'modal-btn-secondary'
        });

        combatStats.push(
            { label: 'Damage', value: `${monster.value}` }
        );
    }

    return showModal({
        title: 'Combat!',
        message: weapon 
            ? `Choose how to fight the ${monster.rank} of ${monster.suit}.`
            : `Fight the ${monster.rank} of ${monster.suit}?`,
        icon: '⚔️',
        cardInfo: {
            rank: monster.rank,
            suit: monster.suit,
            details: `Monster (${monster.value} attack power)`
        },
        combatStats,
        buttons
    });
}

/**
 * Show a healing choice modal
 * @param {Object} potion - Potion card object
 * @param {boolean} alreadyUsedPotion - Whether a potion was already used this room
 * @returns {Promise} Promise that resolves with true/false
 */
export function showHealingModal(potion, alreadyUsedPotion = false) {
    const buttons = [
        {
            text: alreadyUsedPotion ? 'Drink Anyway' : 'Drink Potion',
            value: true,
            className: alreadyUsedPotion ? 'modal-btn-secondary' : 'modal-btn-primary'
        },
        {
            text: 'Cancel',
            value: false,
            className: 'modal-btn-secondary'
        }
    ];

    const message = alreadyUsedPotion 
        ? `You've already used a potion this room. This ${potion.rank} of hearts won't heal you.`
        : `Drink the ${potion.rank} of hearts to restore ${potion.value} health?`;

    return showModal({
        title: alreadyUsedPotion ? 'Potion Warning' : 'Healing Potion',
        message,
        icon: alreadyUsedPotion ? '⚠️' : '❤️',
        cardInfo: {
            rank: potion.rank,
            suit: potion.suit,
            details: alreadyUsedPotion 
                ? `Healing Potion (no effect - already used one this room)`
                : `Healing Potion (+${potion.value} health)`
        },
        buttons
    });
}

/**
 * Show a confirmation modal for actions that cannot be undone
 * @param {Object} options - Confirmation options
 * @returns {Promise} Promise that resolves with true/false
 */
export function showConfirmation(options) {
    const buttons = [
        {
            text: options.confirmText || 'Confirm',
            value: true,
            className: options.danger ? 'modal-btn-danger' : 'modal-btn-primary'
        },
        {
            text: options.cancelText || 'Cancel',
            value: false,
            className: 'modal-btn-secondary'
        }
    ];

    return showModal({
        title: options.title || 'Confirm Action',
        message: options.message,
        icon: options.icon || '❓',
        buttons
    });
}