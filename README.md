# Acuasplas: Local Multiplayer Application

## 1. Abstract

Acuasplas is a browser-based, two-player local multiplayer game developed using vanilla web technologies (HTML5, CSS3, and JavaScript). The application features a zero-dependency architecture, relying entirely on native browser APIs to manage game state, render visual feedback, and synthesize procedural audio. The software is designed to execute locally without requiring a web server, build tools, or external libraries.

The core interaction model requires two users to share a single hardware keyboard interface. The gameplay loop is structured around discrete rounds where users make simultaneous, hidden positional selections under time constraints. 

---

## 2. Technical Architecture

The application implements a modular architecture utilizing the Revealing Module Pattern via Immediately Invoked Function Expressions (IIFEs). This ensures encapsulation of internal state while exposing a defined public interface.

### 2.1 File Structure

The project relies on a flat structural hierarchy for simplicity and direct deployment capability:

```text
acuasplas/
├── index.html            # Main markup and application shell
├── css/
│   └── styles.css        # Centralized styling and CSS keyframe definitions
└── js/
    ├── audio.js          # Web Audio API implementation for procedural sound
    ├── animations.js     # Visual effect controller mapping state to CSS classes
    ├── input.js          # Event listener and keyboard mapping manager
    ├── game.js           # Core state machine and game logic controller
    └── main.js           # Application entry point and module integrator
```

### 2.2 Subsystem Documentation

#### 2.2.1 State Management (`game.js`)
The `Game` module acts as the central authority for game logic, maintaining the application state through a defined set of phases. The state machine operates under the following phases:

| Phase | Description |
| :--- | :--- |
| `idle` | Application is waiting for initialization. |
| `ready` | Pre-round state; prepares variables for a new round. |
| `selecting` | Active input phase; the countdown timer is running. |
| `revealing` | Input is locked; positional animations and calculations occur. |
| `result` | Round score is updated and displayed to the users. |
| `paused` | Execution is halted; the previous phase is stored in memory. |
| `ended` | Final state; triggers the post-game summary callback. |

#### 2.2.2 Input Handling (`input.js`)
The `InputManager` processes hardware keyboard events (`keydown`) and maps them to logical game actions. It supports dual-mode operation:
*   **`game` Mode:** Maps positional keys to game board columns (Left, Center, Right).
*   **`roleSelect` Mode:** Restricts input to lateral movement for navigating the pre-game lobby interface.

The `Escape` key operates globally, bypassing standard mode constraints to guarantee access to the pause interrupt sequence.

#### 2.2.3 Audio Synthesis (`audio.js`)
The `AudioManager` bypasses external `.mp3` or `.wav` dependencies by synthesizing waveforms algorithmically using the `AudioContext` interface. This implementation utilizes primitive oscillators (sine, square) combined with gain nodes and exponential ramps to generate distinct auditory feedback for game events.

#### 2.2.4 Visual Feedback (`animations.js`)
The `Animations` module governs the visual presentation layer. Instead of executing programmatic animation loops via `requestAnimationFrame`, the system leverages hardware-accelerated CSS transitions and keyframe animations. The JavaScript module is responsible only for applying and removing CSS classes at precise timings, optimizing rendering performance.

---

## 3. Game Mechanics and Logic

### 3.1 Interaction Model
Acuasplas utilizes a discrete, three-column positioning system. 

1.  **Turret Role (Player 1):** Attempts to select the identical column as the opponent.
2.  **Dodger Role (Player 2):** Attempts to select a differing column from the opponent.

Selections are committed during an active countdown phase. The system enforces hidden state; neither player receives visual confirmation of the opponent's choice until the countdown expires.

### 3.2 Time Constraints
The application dynamically adjusts difficulty via round duration modifications, unless overridden by user configuration:
*   **Default Behavior:** Rounds 1 through 3 allocate a 5-second selection window. Subsequent rounds reduce the window to 3 seconds to increase cognitive load.
*   **Custom Behavior:** The user configuration interface allows setting a static duration (1-5 seconds) applied uniformly across all rounds.

### 3.3 Default Resolution Protocol
If a user fails to register an input before the countdown termination, the system invokes a fallback protocol, automatically assigning a randomized column index (0, 1, or 2) using `Math.random()` to ensure uninterrupted game flow.

---

## 4. Hardware Interface (Controls)

The application mandates a physical keyboard capable of handling simultaneous key presses (N-key rollover is recommended but not strictly required given the distinct key mappings).

### 4.1 Input Mapping

| Action | Player 1 (Turret) | Player 2 (Dodger) |
| :--- | :--- | :--- |
| Select Left Column | `A` | `ArrowLeft` |
| Select Center Column | `S` | `ArrowDown` |
| Select Right Column | `D` | `ArrowRight` |
| Lobby Navigation | `A` / `D` | `ArrowLeft` / `ArrowRight` |

### 4.2 System Controls

| Key | Action |
| :--- | :--- |
| `Escape` | Trigger application interrupt / Pause execution |

---

## 5. Execution Environment Requirements

To execute the application, the local environment must meet the following specifications:

1.  **Browser:** A modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari) released post-2020.
2.  **Web APIs:** Full support for ECMAScript 6 (ES6), Web Audio API, and CSS Custom Properties (Variables).
3.  **Hardware:** A physical keyboard interface.

### 5.1 Deployment Instructions

No compilation, transpilation, or server configuration is required.
To initialize the software, execute the `index.html` file directly within the browser runtime environment.

*Note for developers: If modifying source code, utilizing a local development server (e.g., VS Code Live Server) is recommended to prevent Cross-Origin Resource Sharing (CORS) security restrictions, although not strictly necessary for this specific architecture.*

---

## 6. Version History

*   **Current Version:** Alpha 1.2
*   **Status:** Functional Prototype / Local Multiplayer Edition

---

## 7. Licensing

This software is provided as a personal/academic technical demonstration.
