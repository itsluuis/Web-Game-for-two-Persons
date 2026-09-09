/* ============================================
   AUDIO MODULE - Procedural Sound Generation
   Uses Web Audio API for sounds.
   User can replace sounds by modifying this file.
   ============================================ */

const AudioManager = (() => {
    let audioCtx = null;
    let sfxEnabled = true;

    /**
     * Initialize the audio context.
     * Must be called after a user gesture (click/keypress).
     */
    function init() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function setSFXEnabled(enabled) {
        sfxEnabled = enabled;
    }

    function isEnabled() {
        return sfxEnabled;
    }

    /**
     * Play a named sound.
     * @param {'hit'|'dodge'|'tick'|'countdown_end'|'win'|'lose'} name
     */
    function play(name) {
        if (!sfxEnabled || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        switch (name) {
            case 'hit': _playHit(); break;
            case 'dodge': _playDodge(); break;
            case 'tick': _playTick(); break;
            case 'countdown_end': _playCountdownEnd(); break;
            case 'win': _playWin(); break;
            case 'lose': _playLose(); break;
        }
    }

    /* --- Sound Generators --- */
    /* Each function below generates a procedural sound.
       To replace with your own audio files:
       1. Place your .mp3/.wav in assets/sounds/
       2. Load with: const audio = new Audio('assets/sounds/hit.mp3'); audio.play();
       3. Replace the corresponding function body below */

    function _playHit() {
        // Short punchy impact - noise burst + low thump
        const now = audioCtx.currentTime;

        // Low frequency thump
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

        // Noise burst for splash
        const bufferSize = audioCtx.sampleRate * 0.15;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = audioCtx.createBufferSource();
        const noiseGain = audioCtx.createGain();
        const noiseFilter = audioCtx.createBiquadFilter();
        noise.buffer = noiseBuffer;
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 800;
        noiseFilter.Q.value = 1;
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now);
    }

    function _playDodge() {
        // Quick ascending positive tone
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);

        // Second harmonic
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(600, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain2.gain.setValueAtTime(0.15, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.25);
    }

    function _playTick() {
        // Short click
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    function _playCountdownEnd() {
        // Alert-like double beep
        const now = audioCtx.currentTime;
        for (let i = 0; i < 2; i++) {
            const offset = i * 0.12;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.value = 700;
            gain.gain.setValueAtTime(0.25, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.1);
        }
    }

    function _playWin() {
        // Ascending arpeggio: C5 → E5 → G5 → C6
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            const offset = i * 0.12;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.25, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.3);

            // Octave harmonic
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.value = freq * 2;
            gain2.gain.setValueAtTime(0.08, now + offset);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(now + offset);
            osc2.stop(now + offset + 0.2);
        });
    }

    function _playLose() {
        // Descending sad tone
        const now = audioCtx.currentTime;
        const notes = [440, 370, 311, 261];
        notes.forEach((freq, i) => {
            const offset = i * 0.2;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.35);
        });
    }

    return {
        init,
        play,
        setSFXEnabled,
        isEnabled
    };
})();
