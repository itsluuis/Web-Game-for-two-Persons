/* ============================================
   INPUT MODULE
   Handles keyboard input for both players.
   Shooter: A/S/D (left/center/right)
   Dodger:  ←/↓/→ (left/center/right)
   ============================================ */

const InputManager = (() => {
    let enabled = false;
    let onSelectionCallback = null;

    // Key mappings
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

    /**
     * Initialize input listeners.
     */
    function init() {
        document.addEventListener('keydown', _handleKeyDown);
    }

    /**
     * Enable or disable input processing.
     * @param {boolean} state
     */
    function setEnabled(state) {
        enabled = state;
    }

    /**
     * Register a callback for when a player makes a selection.
     * @param {function(role: string, position: number)} callback
     */
    function onSelection(callback) {
        onSelectionCallback = callback;
    }

    /**
     * Internal key handler.
     */
    function _handleKeyDown(event) {
        if (!enabled) return;

        const code = event.code;

        // Check shooter keys
        if (code in SHOOTER_KEYS) {
            event.preventDefault();
            if (onSelectionCallback) {
                onSelectionCallback('shooter', SHOOTER_KEYS[code]);
            }
            return;
        }

        // Check dodger keys
        if (code in DODGER_KEYS) {
            event.preventDefault();
            if (onSelectionCallback) {
                onSelectionCallback('dodger', DODGER_KEYS[code]);
            }
            return;
        }
    }

    /**
     * Clean up listeners (if needed).
     */
    function destroy() {
        document.removeEventListener('keydown', _handleKeyDown);
    }

    return {
        init,
        setEnabled,
        onSelection,
        destroy
    };
})();
