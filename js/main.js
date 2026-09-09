/* ============================================
   MAIN MODULE
   App initialization, screen navigation,
   settings management, loading screen,
   role selection, pause, event wiring.
   ============================================ */

(function App() {
    // --- Settings State ---
    const settings = {
        totalRounds: 5,
        roundTime: 5,
        customTimeSet: false,  // tracks if user manually changed time
        sfxEnabled: true,
        vfxEnabled: true
    };

    // --- Role Selection State ---
    const roleState = {
        p1: 'center',  // 'center' | 'shooter' | 'dodger'
        p2: 'center'
    };

    // --- Screen Navigation ---
    const screens = {};
    let currentScreen = 'menu';

    function cacheScreens() {
        screens.menu = document.getElementById('screen-menu');
        screens.options = document.getElementById('screen-options');
        screens.loading = document.getElementById('screen-loading');
        screens.roles = document.getElementById('screen-roles');
        screens.game = document.getElementById('screen-game');
        screens.results = document.getElementById('screen-results');
    }

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');
        currentScreen = screenName;
    }

    // --- Particles Background ---
    function initParticles() {
        const container = document.getElementById('bg-particles');
        if (!container) return;

        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${2 + Math.random() * 4}px;
                height: ${2 + Math.random() * 4}px;
                background: hsla(${200 + Math.random() * 80}, 80%, 70%, ${0.1 + Math.random() * 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${8 + Math.random() * 12}s ease-in-out infinite;
                animation-delay: ${Math.random() * -20}s;
            `;
            container.appendChild(particle);
        }

        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                    25% { transform: translate(20px, -30px) scale(1.2); opacity: 0.6; }
                    50% { transform: translate(-15px, -60px) scale(0.8); opacity: 0.4; }
                    75% { transform: translate(25px, -20px) scale(1.1); opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ==========================================
    // MAIN MENU
    // ==========================================
    function setupMainMenu() {
        document.getElementById('btn-play').addEventListener('click', () => {
            AudioManager.init();
            AudioManager.play('tick');
            startLoadingScreen();
        });

        document.getElementById('btn-options').addEventListener('click', () => {
            AudioManager.init();
            AudioManager.play('tick');
            showScreen('options');
        });

        document.getElementById('btn-exit').addEventListener('click', () => {
            window.close();
            alert('¡Gracias por jugar Acuasplas! 💦\nPuedes cerrar esta pestaña.');
        });
    }

    // ==========================================
    // OPTIONS SCREEN
    // ==========================================
    function setupOptions() {
        const roundsValue = document.getElementById('rounds-value');
        const timeValue = document.getElementById('time-value');
        const timeHint = document.getElementById('time-hint');
        const sfxToggle = document.getElementById('sfx-toggle');
        const vfxToggle = document.getElementById('vfx-toggle');

        // Rounds stepper
        document.getElementById('rounds-minus').addEventListener('click', () => {
            AudioManager.play('tick');
            if (settings.totalRounds > 1) {
                settings.totalRounds--;
                roundsValue.textContent = settings.totalRounds;
            }
        });

        document.getElementById('rounds-plus').addEventListener('click', () => {
            AudioManager.play('tick');
            if (settings.totalRounds < 10) {
                settings.totalRounds++;
                roundsValue.textContent = settings.totalRounds;
            }
        });

        // Round time stepper
        document.getElementById('time-minus').addEventListener('click', () => {
            AudioManager.play('tick');
            if (settings.roundTime > 1) {
                settings.roundTime--;
                settings.customTimeSet = true;
                timeValue.textContent = settings.roundTime;
                timeHint.textContent = `Tiempo fijo: ${settings.roundTime}s en todas las rondas`;
            }
        });

        document.getElementById('time-plus').addEventListener('click', () => {
            AudioManager.play('tick');
            if (settings.roundTime < 5) {
                settings.roundTime++;
                timeValue.textContent = settings.roundTime;
                // If they set it back to 5 without having touched it, consider it default
                if (settings.roundTime === 5 && !settings.customTimeSet) {
                    timeHint.textContent = 'Por defecto: 5s → 3s en ronda 4+';
                } else {
                    settings.customTimeSet = true;
                    timeHint.textContent = `Tiempo fijo: ${settings.roundTime}s en todas las rondas`;
                }
            }
        });

        // SFX toggle
        sfxToggle.addEventListener('click', () => {
            settings.sfxEnabled = !settings.sfxEnabled;
            sfxToggle.classList.toggle('active', settings.sfxEnabled);
            sfxToggle.querySelector('.toggle-label').textContent = settings.sfxEnabled ? 'ON' : 'OFF';
            AudioManager.setSFXEnabled(settings.sfxEnabled);
            if (settings.sfxEnabled) AudioManager.play('tick');
        });

        // VFX toggle
        vfxToggle.addEventListener('click', () => {
            settings.vfxEnabled = !settings.vfxEnabled;
            vfxToggle.classList.toggle('active', settings.vfxEnabled);
            vfxToggle.querySelector('.toggle-label').textContent = settings.vfxEnabled ? 'ON' : 'OFF';
            Animations.setVFXEnabled(settings.vfxEnabled);
            AudioManager.play('tick');
        });

        // Back button
        document.getElementById('btn-options-back').addEventListener('click', () => {
            AudioManager.play('tick');
            showScreen('menu');
        });
    }

    // ==========================================
    // LOADING SCREEN (fake loading)
    // ==========================================
    function startLoadingScreen() {
        showScreen('loading');
        const fill = document.getElementById('loading-bar-fill');
        const text = document.getElementById('loading-text');

        fill.style.width = '0%';
        text.textContent = 'Preparando arena...';

        const steps = [
            { time: 400, width: '25%', label: 'Cargando controles...' },
            { time: 900, width: '50%', label: 'Preparando torreta...' },
            { time: 1400, width: '75%', label: 'Calibrando chorro...' },
            { time: 2000, width: '100%', label: '¡Listo!' }
        ];

        steps.forEach(step => {
            setTimeout(() => {
                fill.style.width = step.width;
                text.textContent = step.label;
            }, step.time);
        });

        // After loading, go to role selection
        setTimeout(() => {
            openRoleSelection();
        }, 2600);
    }

    // ==========================================
    // ROLE SELECTION SCREEN
    // ==========================================
    function openRoleSelection() {
        // Reset role state
        roleState.p1 = 'center';
        roleState.p2 = 'center';

        // Move tokens back to center
        const p1Token = document.getElementById('p1-token');
        const p2Token = document.getElementById('p2-token');
        const centerSlot = document.getElementById('slot-center');
        centerSlot.appendChild(p1Token);
        centerSlot.appendChild(p2Token);

        // Reset panel highlights
        _updateRolePanelHighlights();

        // Hide ready button
        document.getElementById('btn-ready').classList.add('hidden');

        // Switch to role select input mode
        InputManager.setMode('roleSelect');
        InputManager.setEnabled(true);

        showScreen('roles');
    }

    function handleRoleSelect(player, direction) {
        const otherPlayer = player === 'p1' ? 'p2' : 'p1';
        const currentPos = roleState[player];
        let targetPos;

        if (direction === 'left') {
            targetPos = currentPos === 'shooter' ? 'center' : 'shooter';
        } else {
            targetPos = currentPos === 'dodger' ? 'center' : 'dodger';
        }

        // Can't go where other player already is (except center)
        if (targetPos !== 'center' && roleState[otherPlayer] === targetPos) {
            return; // blocked
        }

        roleState[player] = targetPos;
        AudioManager.play('tick');

        // Move token DOM element
        const token = document.getElementById(`${player === 'p1' ? 'p1' : 'p2'}-token`);
        const slotId = targetPos === 'shooter' ? 'slot-shooter'
                     : targetPos === 'dodger' ? 'slot-dodger'
                     : 'slot-center';
        const slot = document.getElementById(slotId);

        // Re-add with animation
        token.style.animation = 'none';
        token.offsetHeight; // force reflow
        token.style.animation = '';
        slot.appendChild(token);

        _updateRolePanelHighlights();
        _checkRolesReady();
    }

    function _updateRolePanelHighlights() {
        const panels = ['panel-shooter', 'panel-center', 'panel-dodger'];
        panels.forEach(id => {
            document.getElementById(id).classList.remove('has-player');
        });

        if (roleState.p1 === 'shooter' || roleState.p2 === 'shooter') {
            document.getElementById('panel-shooter').classList.add('has-player');
        }
        if (roleState.p1 === 'dodger' || roleState.p2 === 'dodger') {
            document.getElementById('panel-dodger').classList.add('has-player');
        }
    }

    function _checkRolesReady() {
        const readyBtn = document.getElementById('btn-ready');
        const bothChosen = roleState.p1 !== 'center' && roleState.p2 !== 'center'
                        && roleState.p1 !== roleState.p2;

        if (bothChosen) {
            readyBtn.classList.remove('hidden');
        } else {
            readyBtn.classList.add('hidden');
        }
    }

    function setupRoleSelection() {
        // Ready button → start game
        document.getElementById('btn-ready').addEventListener('click', () => {
            AudioManager.play('tick');
            InputManager.setEnabled(false);
            InputManager.setMode('game');

            // Determine who is shooter based on role selection
            // P1's role = roleState.p1 ('shooter' or 'dodger')
            const p1Role = roleState.p1; // 'shooter' or 'dodger'
            Game.setRoles(p1Role);
            Game.setTotalRounds(settings.totalRounds);
            Game.setCustomRoundTime(settings.customTimeSet ? settings.roundTime : null);

            showScreen('game');

            setTimeout(() => {
                Game.startGame();
            }, 600);
        });

        // Back button
        document.getElementById('btn-roles-back').addEventListener('click', () => {
            AudioManager.play('tick');
            InputManager.setEnabled(false);
            InputManager.setMode('game');
            showScreen('menu');
        });
    }

    // ==========================================
    // PAUSE HANDLING
    // ==========================================
    function setupPause() {
        InputManager.onEscape(() => {
            // Only handle ESC during game screen
            if (currentScreen !== 'game') return;

            Game.togglePause();
        });

        // Exit to menu from pause
        document.getElementById('btn-pause-exit').addEventListener('click', () => {
            AudioManager.play('tick');
            Game.stop();
            showScreen('menu');
        });
    }

    // ==========================================
    // RESULTS SCREEN
    // ==========================================
    function setupResults() {
        document.getElementById('btn-play-again').addEventListener('click', () => {
            AudioManager.play('tick');
            openRoleSelection();
        });

        document.getElementById('btn-back-menu').addEventListener('click', () => {
            AudioManager.play('tick');
            showScreen('menu');
        });
    }

    // --- Game End Handler ---
    function handleGameEnd(result) {
        setTimeout(() => {
            if (result.winner === 'tie') {
                AudioManager.play('tick');
            } else {
                AudioManager.play('win');
            }

            const titleEl = document.getElementById('result-title');
            const winnerTextEl = document.getElementById('result-winner-text');
            const crownEl = document.getElementById('result-crown');
            const shooterScoreEl = document.getElementById('final-shooter-score');
            const dodgerScoreEl = document.getElementById('final-dodger-score');
            const shooterCard = document.querySelector('.result-score-card.shooter-border');
            const dodgerCard = document.querySelector('.result-score-card.dodger-border');

            shooterScoreEl.textContent = result.shooterScore;
            dodgerScoreEl.textContent = result.dodgerScore;

            shooterCard.classList.remove('winner');
            dodgerCard.classList.remove('winner');

            if (result.winner === 'shooter') {
                titleEl.textContent = '🔫 ¡VICTORIA DE LA TORRETA!';
                winnerTextEl.textContent = 'La torreta dominó el campo de batalla';
                crownEl.textContent = '👑';
                shooterCard.classList.add('winner');
            } else if (result.winner === 'dodger') {
                titleEl.textContent = '🏃 ¡VICTORIA DEL ESQUIVADOR!';
                winnerTextEl.textContent = 'El esquivador fue imparable';
                crownEl.textContent = '👑';
                dodgerCard.classList.add('winner');
            } else {
                titleEl.textContent = '🤝 ¡EMPATE!';
                winnerTextEl.textContent = 'Nadie pudo con nadie';
                crownEl.textContent = '⚖️';
            }

            showScreen('results');
        }, 500);
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function start() {
        cacheScreens();

        // Init modules
        Game.init();
        InputManager.init();

        // Wire input → game (game mode)
        InputManager.onSelection((role, position) => {
            Game.setSelection(role, position);
        });

        // Wire input → role selection (roleSelect mode)
        InputManager.onRoleSelect((player, direction) => {
            handleRoleSelect(player, direction);
        });

        // Wire game end → results
        Game.onGameEnd(handleGameEnd);

        // Setup all screens
        setupMainMenu();
        setupOptions();
        setupRoleSelection();
        setupResults();
        setupPause();

        // Background effects
        initParticles();

        // Show menu
        showScreen('menu');
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
