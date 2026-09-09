/* ============================================
   GAME MODULE
   Core game logic: rounds, countdown, scoring,
   state machine, reveal phase, pause.
   ============================================ */

const Game = (() => {
    // --- State ---
    const state = {
        totalRounds: 5,
        currentRound: 1,
        scores: { shooter: 0, dodger: 0 },
        countdown: 5,
        countdownMax: 5,          // current round's max countdown
        phase: 'idle',            // idle | ready | selecting | revealing | result | paused | ended
        phaseBeforePause: null,   // saved phase when pausing
        selections: {
            shooter: null,
            dodger: null
        },
        roles: {
            player1: null,
            player2: null
        },
        settings: {
            sfxEnabled: true,
            vfxEnabled: true,
            customRoundTime: null  // null = use dynamic (5/3), number = use fixed
        }
    };

    let countdownTimer = null;
    let onGameEndCallback = null;
    let revealTimeouts = [];       // track reveal phase timeouts for cleanup

    // --- DOM References (cached on init) ---
    let domRoundInfo, domCountdown, domScoreShooter, domScoreDodger;
    let domShooterStatus, domDodgerStatus;
    let domShooterIndicator, domDodgerIndicator;
    let domPauseOverlay;

    /**
     * Initialize the game module. Caches DOM refs.
     */
    function init() {
        domRoundInfo = document.getElementById('round-info');
        domCountdown = document.getElementById('countdown-display');
        domScoreShooter = document.getElementById('score-shooter');
        domScoreDodger = document.getElementById('score-dodger');
        domShooterStatus = document.getElementById('shooter-status');
        domDodgerStatus = document.getElementById('dodger-status');
        domShooterIndicator = document.querySelector('.shooter-indicator');
        domDodgerIndicator = document.querySelector('.dodger-indicator');
        domPauseOverlay = document.getElementById('pause-overlay');
    }

    /**
     * Set total rounds.
     * @param {number} rounds
     */
    function setTotalRounds(rounds) {
        state.totalRounds = Math.max(1, Math.min(10, rounds));
    }

    /**
     * Set custom round time. null = use default dynamic behavior.
     * @param {number|null} seconds
     */
    function setCustomRoundTime(seconds) {
        state.settings.customRoundTime = seconds;
    }

    /**
     * Set player roles.
     * @param {string} player1Role - 'shooter' or 'dodger'
     */
    function setRoles(player1Role) {
        state.roles.player1 = player1Role;
        state.roles.player2 = player1Role === 'shooter' ? 'dodger' : 'shooter';
    }

    /**
     * Register callback for game end.
     * @param {function(scores)} callback
     */
    function onGameEnd(callback) {
        onGameEndCallback = callback;
    }

    /**
     * Start a new game (resets everything).
     */
    function startGame() {
        state.currentRound = 1;
        state.scores = { shooter: 0, dodger: 0 };
        state.phase = 'ready';

        _updateHUD();
        Animations.hideRoundResult();
        Animations.clearWaterJets();
        Animations.resetEntity('turret');
        Animations.resetEntity('dodger');

        // Small delay before starting first round
        setTimeout(() => {
            startRound();
        }, 800);
    }

    /**
     * Get the countdown duration for the current round.
     */
    function _getCountdownDuration() {
        // If user set a custom time, always use that
        if (state.settings.customRoundTime !== null) {
            return state.settings.customRoundTime;
        }
        // Default dynamic: 5s for rounds 1-3, 3s for round 4+
        return state.currentRound <= 3 ? 5 : 3;
    }

    /**
     * Start a round: reset selections, begin countdown.
     */
    function startRound() {
        state.phase = 'selecting';
        state.selections = { shooter: null, dodger: null };

        // Determine countdown duration
        state.countdownMax = _getCountdownDuration();
        state.countdown = state.countdownMax;

        const isUrgent = state.settings.customRoundTime !== null
            ? state.settings.customRoundTime <= 3
            : state.currentRound > 3;

        // Reset visuals
        Animations.hideRoundResult();
        Animations.clearWaterJets();
        Animations.resetEntity('turret');
        Animations.resetEntity('dodger');
        Animations.setCountdownUrgent(isUrgent);

        // Reset indicators
        domShooterStatus.textContent = 'Esperando...';
        domDodgerStatus.textContent = 'Esperando...';
        domShooterIndicator.classList.remove('ready');
        domDodgerIndicator.classList.remove('ready');

        _updateHUD();

        // Enable input
        InputManager.setEnabled(true);

        // Start countdown
        countdownTimer = setInterval(() => {
            state.countdown--;
            domCountdown.textContent = state.countdown;
            Animations.pulseCountdown();
            AudioManager.play('tick');

            if (state.countdown <= 0) {
                clearInterval(countdownTimer);
                countdownTimer = null;
                AudioManager.play('countdown_end');
                _onCountdownEnd();
            }
        }, 1000);
    }

    /**
     * Handle a player's selection.
     * @param {'shooter'|'dodger'} role
     * @param {0|1|2} position
     */
    function setSelection(role, position) {
        if (state.phase !== 'selecting') return;

        state.selections[role] = position;

        // Update indicator (show ready but NOT the position)
        if (role === 'shooter') {
            domShooterStatus.textContent = '¡Listo!';
            domShooterIndicator.classList.add('ready');
        } else {
            domDodgerStatus.textContent = '¡Listo!';
            domDodgerIndicator.classList.add('ready');
        }

        AudioManager.play('tick');
    }

    /**
     * Toggle pause state.
     */
    function togglePause() {
        if (state.phase === 'paused') {
            _resume();
        } else if (state.phase === 'selecting') {
            _pause();
        }
        // Don't allow pause during revealing/result phases
    }

    /**
     * Pause the game.
     */
    function _pause() {
        state.phaseBeforePause = state.phase;
        state.phase = 'paused';
        InputManager.setEnabled(false);

        // Stop countdown timer
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }

        // Show pause overlay
        domPauseOverlay.classList.remove('hidden');
        AudioManager.play('tick');
    }

    /**
     * Resume the game.
     */
    function _resume() {
        state.phase = state.phaseBeforePause || 'selecting';
        state.phaseBeforePause = null;

        // Hide pause overlay
        domPauseOverlay.classList.add('hidden');
        AudioManager.play('tick');

        // Resume countdown if we were selecting
        if (state.phase === 'selecting') {
            InputManager.setEnabled(true);

            countdownTimer = setInterval(() => {
                state.countdown--;
                domCountdown.textContent = state.countdown;
                Animations.pulseCountdown();
                AudioManager.play('tick');

                if (state.countdown <= 0) {
                    clearInterval(countdownTimer);
                    countdownTimer = null;
                    AudioManager.play('countdown_end');
                    _onCountdownEnd();
                }
            }, 1000);
        }
    }

    /**
     * Check if the game is paused.
     */
    function isPaused() {
        return state.phase === 'paused';
    }

    /**
     * Called when countdown reaches 0. Handles the reveal phase.
     */
    function _onCountdownEnd() {
        state.phase = 'revealing';
        InputManager.setEnabled(false);

        // If no selection was made, pick random
        if (state.selections.shooter === null) {
            state.selections.shooter = Math.floor(Math.random() * 3);
        }
        if (state.selections.dodger === null) {
            state.selections.dodger = Math.floor(Math.random() * 3);
        }

        const shooterPos = state.selections.shooter;
        const dodgerPos = state.selections.dodger;
        const isHit = shooterPos === dodgerPos;

        // Clear previous timeouts
        revealTimeouts.forEach(t => clearTimeout(t));
        revealTimeouts = [];

        // --- Reveal animation sequence ---

        // Step 1: Move entities to positions (0.5s)
        Animations.moveEntity('turret', shooterPos);
        Animations.moveEntity('dodger', dodgerPos);

        // Step 2: Fire water jet (after entities moved)
        revealTimeouts.push(setTimeout(() => {
            Animations.fireWaterJet(shooterPos);
        }, 500));

        // Step 3: Check result (after jet fires)
        revealTimeouts.push(setTimeout(() => {
            state.phase = 'result';

            if (isHit) {
                state.scores.shooter++;
                Animations.screenShake();
                Animations.spawnSplashParticles(shooterPos);
                AudioManager.play('hit');
            } else {
                state.scores.dodger++;
                Animations.dodgeGlow();
                AudioManager.play('dodge');
            }

            _updateHUD();
            Animations.showRoundResult(isHit);
        }, 1100));

        // Step 4: Clear and advance (after showing result)
        revealTimeouts.push(setTimeout(() => {
            Animations.clearWaterJets();

            if (state.currentRound >= state.totalRounds) {
                _endGame();
            } else {
                state.currentRound++;
                startRound();
            }
        }, 3000));
    }

    /**
     * End the game and show results.
     */
    function _endGame() {
        state.phase = 'ended';
        InputManager.setEnabled(false);

        if (onGameEndCallback) {
            onGameEndCallback({
                shooterScore: state.scores.shooter,
                dodgerScore: state.scores.dodger,
                winner: state.scores.shooter > state.scores.dodger ? 'shooter'
                      : state.scores.dodger > state.scores.shooter ? 'dodger'
                      : 'tie'
            });
        }
    }

    /**
     * Stop any running timers (cleanup).
     */
    function stop() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        revealTimeouts.forEach(t => clearTimeout(t));
        revealTimeouts = [];
        state.phase = 'idle';
        InputManager.setEnabled(false);
        domPauseOverlay.classList.add('hidden');
    }

    /**
     * Update the HUD elements.
     */
    function _updateHUD() {
        domRoundInfo.textContent = `${state.currentRound}/${state.totalRounds}`;
        domCountdown.textContent = state.countdown;
        domScoreShooter.textContent = state.scores.shooter;
        domScoreDodger.textContent = state.scores.dodger;
    }

    /**
     * Get current state (read-only copy).
     */
    function getState() {
        return { ...state };
    }

    return {
        init,
        setTotalRounds,
        setCustomRoundTime,
        setRoles,
        onGameEnd,
        startGame,
        startRound,
        setSelection,
        togglePause,
        isPaused,
        stop,
        getState
    };
})();
