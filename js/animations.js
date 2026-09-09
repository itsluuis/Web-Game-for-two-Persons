/* ============================================
   ANIMATIONS MODULE
   Handles all visual effects:
   - Screen shake (hit)
   - Green border glow (dodge)
   - Water jet firing
   - Countdown pulse
   - Entity movement
   - Splash particles
   ============================================ */

const Animations = (() => {
    let vfxEnabled = true;

    function setVFXEnabled(enabled) {
        vfxEnabled = enabled;
    }

    function isEnabled() {
        return vfxEnabled;
    }

    /**
     * Shake the game container on hit.
     */
    function screenShake() {
        if (!vfxEnabled) return;
        const container = document.getElementById('game-container');
        container.classList.remove('shaking');
        // Force reflow to restart animation
        void container.offsetWidth;
        container.classList.add('shaking');

        // Also flash the hit overlay
        const overlay = document.getElementById('vfx-hit-overlay');
        overlay.classList.remove('active');
        void overlay.offsetWidth;
        overlay.classList.add('active');

        setTimeout(() => {
            container.classList.remove('shaking');
            overlay.classList.remove('active');
        }, 500);
    }

    /**
     * Flash a green gradient border on successful dodge.
     */
    function dodgeGlow() {
        if (!vfxEnabled) return;
        const overlay = document.getElementById('vfx-dodge-overlay');
        overlay.classList.remove('active');
        void overlay.offsetWidth;
        overlay.classList.add('active');

        setTimeout(() => {
            overlay.classList.remove('active');
        }, 700);
    }

    /**
     * Pulse the countdown number.
     */
    function pulseCountdown() {
        if (!vfxEnabled) return;
        const number = document.getElementById('countdown-display');
        number.classList.remove('pulse');
        void number.offsetWidth;
        number.classList.add('pulse');
    }

    /**
     * Set countdown ring urgency (turns red when time is low).
     * @param {boolean} urgent
     */
    function setCountdownUrgent(urgent) {
        const ring = document.querySelector('.countdown-ring');
        if (urgent) {
            ring.classList.add('urgent');
        } else {
            ring.classList.remove('urgent');
        }
    }

    /**
     * Move a game entity (turret or dodger) to a lane position.
     * @param {'turret'|'dodger'} entityId
     * @param {0|1|2} position - 0=left, 1=center, 2=right
     */
    function moveEntity(entityId, position) {
        const entity = document.getElementById(entityId);
        const lanesArea = document.getElementById('lanes-area');
        const lanes = lanesArea.querySelectorAll('.lane');

        if (lanes.length === 0) return;

        // Calculate target X position based on lane center
        const laneRect = lanes[position].getBoundingClientRect();
        const parentRect = entity.parentElement.getBoundingClientRect();
        const targetX = laneRect.left + laneRect.width / 2 - parentRect.left - parentRect.width / 2;

        entity.style.transform = `translateX(${targetX}px)`;
    }

    /**
     * Reset entity position to center.
     * @param {'turret'|'dodger'} entityId
     */
    function resetEntity(entityId) {
        const entity = document.getElementById(entityId);
        entity.style.transform = 'translateX(0)';
    }

    /**
     * Fire the water jet on a specific lane.
     * @param {0|1|2} position
     * @returns {Promise} resolves when animation completes
     */
    function fireWaterJet(position) {
        return new Promise((resolve) => {
            const jet = document.getElementById(`jet-${position}`);
            jet.classList.add('firing');

            setTimeout(() => {
                resolve();
            }, 500);
        });
    }

    /**
     * Clear all water jets.
     */
    function clearWaterJets() {
        for (let i = 0; i < 3; i++) {
            const jet = document.getElementById(`jet-${i}`);
            jet.classList.remove('firing');
            jet.style.height = '';
            jet.style.opacity = '';
        }
    }

    /**
     * Spawn splash particles at a lane position (on hit).
     * @param {0|1|2} position
     */
    function spawnSplashParticles(position) {
        if (!vfxEnabled) return;
        const lane = document.querySelectorAll('.lane')[position];
        const rect = lane.getBoundingClientRect();
        const count = 12;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5);
            const distance = 30 + Math.random() * 60;
            particle.style.setProperty('--splash-x', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--splash-y', `${Math.sin(angle) * distance}px`);
            particle.style.left = `${rect.width / 2 - 4}px`;
            particle.style.bottom = `20%`;
            particle.style.width = `${4 + Math.random() * 6}px`;
            particle.style.height = particle.style.width;
            lane.appendChild(particle);

            setTimeout(() => particle.remove(), 600);
        }
    }

    /**
     * Show the round result overlay.
     * @param {boolean} isHit
     */
    function showRoundResult(isHit) {
        const overlay = document.getElementById('round-result');
        const icon = document.getElementById('result-icon');
        const text = document.getElementById('result-text');

        if (isHit) {
            icon.textContent = '💥';
            text.textContent = '¡IMPACTO!';
            text.className = 'result-text hit';
        } else {
            icon.textContent = '✨';
            text.textContent = '¡ESQUIVADO!';
            text.className = 'result-text dodge';
        }

        overlay.classList.remove('hidden');
    }

    /**
     * Hide the round result overlay.
     */
    function hideRoundResult() {
        const overlay = document.getElementById('round-result');
        overlay.classList.add('hidden');
    }

    return {
        setVFXEnabled,
        isEnabled,
        screenShake,
        dodgeGlow,
        pulseCountdown,
        setCountdownUrgent,
        moveEntity,
        resetEntity,
        fireWaterJet,
        clearWaterJets,
        spawnSplashParticles,
        showRoundResult,
        hideRoundResult
    };
})();
