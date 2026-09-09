/* ============================================
   INPUT MODULE
   Handles keyboard input for both players.
   Supports game mode and role-select mode.
   Shooter (P1): A/S/D (left/center/right)
   Dodger  (P2): ←/↓/→ (left/center/right)
   ESC: Pause toggle
   ============================================ */

const InputManager = (() => {
    let enabled = false;
    let onSelectionCallback = null;
    let onEscapeCallback = null;
    let onRoleSelectCallback = null;
    let mode = 'game'; // 'game' | 'roleSelect'

    // Key mappings for game mode
    const SHOOTER_KEYS = {
        'KeyA': 0,    // Left
        'KeyS': 1,    // Center
        'KeyD': 2     // Right
    };

    const DODGER_KEYS = {
        'ArrowLeft': 0,   // Left
        'ArrowDown': 1,   // Center
        'ArrowRight': 2   // Right
    };

    // Key mappings for role selection mode (left/right only)
    const P1_ROLE_KEYS = {
        'KeyA': 'left',
        'KeyD': 'right'
    };

    const P2_ROLE_KEYS = {
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
    };

    /**
     * Initialize input listeners.
     */
    function init() {
        document.addEventListener('keydown', _handleKeyDown);
    }

    /**
     * Set the input mode.
     * @param {'game'|'roleSelect'} newMode
     */
    function setMode(newMode) {
        mode = newMode;
    }

    /**
     * Enable or disable input processing.
     * @param {boolean} state
     */
    function setEnabled(state) {
        enabled = state;
    }

    /**
     * Register a callback for game selections.
     * @param {function(role: string, position: number)} callback
     */
    function onSelection(callback) {
        onSelectionCallback = callback;
    }

    /**
     * Register a callback for ESC key.
     * @param {function()} callback
     */
    function onEscape(callback) {
        onEscapeCallback = callback;
    }

    /**
     * Register a callback for role selection input.
     * @param {function(player: 'p1'|'p2', direction: 'left'|'right')} callback
     */
    function onRoleSelect(callback) {
        onRoleSelectCallback = callback;
    }

    /**
     * Internal key handler.
     */
    function _handleKeyDown(event) {
        const code = event.code;

        // ESC always works (even when input is "disabled")
        if (code === 'Escape') {
            event.preventDefault();
            if (onEscapeCallback) onEscapeCallback();
            return;
        }

        if (!enabled) return;

        if (mode === 'game') {
            // Game mode: A/S/D and arrows for position selection
            if (code in SHOOTER_KEYS) {
                event.preventDefault();
                if (onSelectionCallback) {
                    onSelectionCallback('shooter', SHOOTER_KEYS[code]);
                }
                return;
            }

            if (code in DODGER_KEYS) {
                event.preventDefault();
                if (onSelectionCallback) {
                    onSelectionCallback('dodger', DODGER_KEYS[code]);
                }
                return;
            }
        } else if (mode === 'roleSelect') {
            // Role select mode: A/D for P1, ←/→ for P2
            if (code in P1_ROLE_KEYS) {
                event.preventDefault();
                if (onRoleSelectCallback) {
                    onRoleSelectCallback('p1', P1_ROLE_KEYS[code]);
                }
                return;
            }

            if (code in P2_ROLE_KEYS) {
                event.preventDefault();
                if (onRoleSelectCallback) {
                    onRoleSelectCallback('p2', P2_ROLE_KEYS[code]);
                }
                return;
            }
        }
    }

    /**
     * Clean up listeners.
     */
    function destroy() {
        document.removeEventListener('keydown', _handleKeyDown);
    }

    return {
        init,
        setMode,
        setEnabled,
        onSelection,
        onEscape,
        onRoleSelect,
        destroy
    };
})();
