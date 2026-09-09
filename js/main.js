/* ============================================
   MAIN MODULE
   App initialization, screen navigation,
   settings management, event wiring.
   ============================================ */

(function App() {
    // --- Settings State ---
    const settings = {
        totalRounds: 5,
        sfxEnabled: true,
        vfxEnabled: true
    };

    // --- Screen Navigation ---
    const screens = {
        menu: document.getElementById('screen-menu'),
        options: document.getElementById('screen-options'),
        roles: document.getElementById('screen-roles'),
        game: document.getElementById('screen-game'),
        results: document.getElementById('screen-results')
    };

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');
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

        // Add particle animation
        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                    25% { transform: translate(${20}px, -${30}px) scale(1.2); opacity: 0.6; }
                    50% { transform: translate(-${15}px, -${60}px) scale(0.8); opacity: 0.4; }
                    75% { transform: translate(${25}px, -${20}px) scale(1.1); opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // --- Main Menu ---
    function setupMainMenu() {
        document.getElementById('btn-play').addEventListener('click', () => {
            AudioManager.init(); // Init audio on first user gesture
            AudioManager.play('tick');
            showScreen('roles');
        });

        document.getElementById('btn-options').addEventListener('click', () => {
            AudioManager.init();
            AudioManager.play('tick');
            showScreen('options');
        });

        document.getElementById('btn-exit').addEventListener('click', () => {
            // Close the tab (only works if opened via JS)
            window.close();
            // Fallback: show a message
            alert('¡Gracias por jugar Splash Dodge! 💦\nPuedes cerrar esta pestaña.');
        });
    }

    // --- Options Screen ---
    function setupOptions() {
        const roundsValue = document.getElementById('rounds-value');
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

    // --- Role Selection Screen ---
    function setupRoleSelection() {
        const shooterCard = document.getElementById('role-shooter');
        const dodgerCard = document.getElementById('role-dodger');
        const infoText = document.getElementById('role-info-text');

        function selectRole(role) {
            AudioManager.play('tick');

            // Visual selection
            shooterCard.classList.toggle('selected', role === 'shooter');
            dodgerCard.classList.toggle('selected', role === 'dodger');

            const otherRole = role === 'shooter' ? 'Esquivador' : 'Torreta';
            infoText.textContent = `Jugador 2 será: ${otherRole}`;

            // Start game after a brief delay
            setTimeout(() => {
                Game.setRoles(role);
                Game.setTotalRounds(settings.totalRounds);
                showScreen('game');

                // Start the game after screen transition
                setTimeout(() => {
                    Game.startGame();
                }, 600);
            }, 500);
        }

        shooterCard.addEventListener('click', () => selectRole('shooter'));
        dodgerCard.addEventListener('click', () => selectRole('dodger'));

        // Back button
        document.getElementById('btn-roles-back').addEventListener('click', () => {
            AudioManager.play('tick');
            shooterCard.classList.remove('selected');
            dodgerCard.classList.remove('selected');
            infoText.textContent = 'El Jugador 2 recibirá el rol opuesto.';
            showScreen('menu');
        });
    }

    // --- Results Screen ---
    function setupResults() {
        document.getElementById('btn-play-again').addEventListener('click', () => {
            AudioManager.play('tick');
            showScreen('roles');
            // Reset role selection visuals
            document.getElementById('role-shooter').classList.remove('selected');
            document.getElementById('role-dodger').classList.remove('selected');
            document.getElementById('role-info-text').textContent = 'El Jugador 2 recibirá el rol opuesto.';
        });

        document.getElementById('btn-back-menu').addEventListener('click', () => {
            AudioManager.play('tick');
            showScreen('menu');
        });
    }

    // --- Game End Handler ---
    function handleGameEnd(result) {
        // Play appropriate sound
        setTimeout(() => {
            if (result.winner === 'tie') {
                AudioManager.play('tick');
            } else {
                AudioManager.play('win');
            }

            // Update results screen
            const titleEl = document.getElementById('result-title');
            const winnerTextEl = document.getElementById('result-winner-text');
            const crownEl = document.getElementById('result-crown');
            const shooterScoreEl = document.getElementById('final-shooter-score');
            const dodgerScoreEl = document.getElementById('final-dodger-score');
            const shooterCard = document.querySelector('.result-score-card.shooter-border');
            const dodgerCard = document.querySelector('.result-score-card.dodger-border');

            shooterScoreEl.textContent = result.shooterScore;
            dodgerScoreEl.textContent = result.dodgerScore;

            // Remove previous winner highlights
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

    // --- Initialization ---
    function start() {
        // Init modules
        Game.init();
        InputManager.init();

        // Wire input → game
        InputManager.onSelection((role, position) => {
            Game.setSelection(role, position);
        });

        // Wire game end → results
        Game.onGameEnd(handleGameEnd);

        // Setup all screens
        setupMainMenu();
        setupOptions();
        setupRoleSelection();
        setupResults();

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
