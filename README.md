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
├── assets/
│   ├── favicon.png       # Browser tab icon
│   ├── user-icon.png     # Player avatar icon (loading & role screens)
│   ├── bomb-icon.png     # Torreta role panel background icon
│   └── shield-icon.png   # Esquivador role panel background icon
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
The `AudioManager` bypasses external `.mp3` or `.wav` dependencies by synthesizing waveforms algorithmically using the `AudioContext` interface. This implementation utilizes primitive oscillators (sine, square, triangle) combined with gain nodes and exponential ramps to generate distinct auditory feedback for game events.

Supported sound events: `hit`, `dodge`, `tick`, `countdown_end`, `win`, `lose`.

#### 2.2.4 Visual Feedback (`animations.js`)
The `Animations` module governs the visual presentation layer. Instead of executing programmatic animation loops via `requestAnimationFrame`, the system leverages hardware-accelerated CSS transitions and keyframe animations. The JavaScript module is responsible only for applying and removing CSS classes at precise timings, optimizing rendering performance.

#### 2.2.5 Static Assets (`assets/`)
Alpha 1.3 introduces a dedicated `assets/` directory containing image resources used across multiple screens. All icons are PNG format with transparency support, designed for inline rendering at small sizes and as decorative background elements at large scales.

| Asset | Usage |
| :--- | :--- |
| `favicon.png` | Browser tab icon (linked via `<link rel="icon">`). |
| `user-icon.png` | Player avatar displayed in the loading screen and role selection tokens. |
| `bomb-icon.png` | Decorative background for the Torreta role panel (35% opacity, 75% scale). |
| `shield-icon.png` | Decorative background for the Esquivador role panel (35% opacity, 75% scale). |

---

## 3. Screen Flow

Alpha 1.3 introduces a refined six-screen navigation flow:

```text
Main Menu → Loading → Role Selection → Game → Results
                ↑           ↑                      │
                │           └──────────────────────┘ (Play Again)
                └──────────────────────────────────┘ (Back to Menu)
```

### 3.1 Main Menu
Redesigned with a split-panel horizontal layout. The left panel contains oversized action buttons (`JUGAR`, `OPCIONES`) and the right panel displays the "AcuaSplash" title in a large serif heading (`7rem`, `#98a8d9`). The background is a solid `#131936` without gradients or particle effects.

### 3.2 Options Screen
Provides user-configurable game parameters:
*   **Number of Rounds:** Stepper control (1–10, default: 5).
*   **Round Time:** Stepper control (1–5 seconds). Defaults to dynamic behavior (5s → 3s at round 4+); manual adjustment overrides with a fixed value.
*   **Sound Effects (SFX):** Toggle ON/OFF.
*   **Visual Effects (VFX):** Toggle ON/OFF.

### 3.3 Loading Screen
A cosmetic transition screen featuring P1 and P2 player icons rendered with `user-icon.png` assets and player-specific glow effects. A progress bar fills over 5 seconds using a custom easing function with four phases: fast start (0–40%), normal speed (40–70%), stall near 75%, and rush to completion.

### 3.4 Role Selection Screen
An emoji-free interface where players navigate between three panels (Torreta / Center / Esquivador) using keyboard controls. Key visual features:
*   Player tokens display the `user-icon.png` asset with colored glow borders (P1: warm, P2: cool).
*   The Torreta panel features `bomb-icon.png` as a translucent background element.
*   The Esquivador panel features `shield-icon.png` as a translucent background element.
*   Role panel labels (`TORRETA`, `ESQUIVADOR`) are positioned at the top edge.
*   The `¡LISTO!` button appears only when both players have selected different roles.

### 3.5 Game Screen
The active gameplay arena containing the HUD, turret entity, dodger entity, three-lane system, selection indicators, controls reminder, round result overlay, and pause overlay.

### 3.6 Results Screen
Post-game summary displaying the final scoreboard, winner announcement with contextual messaging, and navigation options to replay or return to the main menu.

---

## 4. Game Mechanics and Logic

### 4.1 Interaction Model
Acuasplas utilizes a discrete, three-column positioning system. 

1.  **Turret Role (Player 1):** Attempts to select the identical column as the opponent.
2.  **Dodger Role (Player 2):** Attempts to select a differing column from the opponent.

Selections are committed during an active countdown phase. The system enforces hidden state; neither player receives visual confirmation of the opponent's choice until the countdown expires.

### 4.2 Time Constraints
The application dynamically adjusts difficulty via round duration modifications, unless overridden by user configuration:
*   **Default Behavior:** Rounds 1 through 3 allocate a 5-second selection window. Subsequent rounds reduce the window to 3 seconds to increase cognitive load.
*   **Custom Behavior:** The user configuration interface allows setting a static duration (1-5 seconds) applied uniformly across all rounds.

### 4.3 Default Resolution Protocol
If a user fails to register an input before the countdown termination, the system invokes a fallback protocol, automatically assigning a randomized column index (0, 1, or 2) using `Math.random()` to ensure uninterrupted game flow.

---

## 5. Hardware Interface (Controls)

The application mandates a physical keyboard capable of handling simultaneous key presses (N-key rollover is recommended but not strictly required given the distinct key mappings).

### 5.1 Input Mapping

| Action | Player 1 (Torreta) | Player 2 (Esquivador) |
| :--- | :--- | :--- |
| Select Left Column | `A` | `ArrowLeft` |
| Select Center Column | `S` | `ArrowDown` |
| Select Right Column | `D` | `ArrowRight` |
| Lobby Navigation | `A` / `D` | `ArrowLeft` / `ArrowRight` |

### 5.2 System Controls

| Key | Action |
| :--- | :--- |
| `Escape` | Trigger application interrupt / Pause execution |

---

## 6. Execution Environment Requirements

To execute the application, the local environment must meet the following specifications:

1.  **Browser:** A modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari) released post-2020.
2.  **Web APIs:** Full support for ECMAScript 6 (ES6), Web Audio API, and CSS Custom Properties (Variables).
3.  **Hardware:** A physical keyboard interface.

### 6.1 Deployment Instructions

No compilation, transpilation, or server configuration is required.
To initialize the software, execute the `index.html` file directly within the browser runtime environment.

*Note for developers: If modifying source code, utilizing a local development server (e.g., VS Code Live Server) is recommended to prevent Cross-Origin Resource Sharing (CORS) security restrictions, although not strictly necessary for this specific architecture.*

---

## 7. Version History

| Version | Description |
| :--- | :--- |
| Alpha 1.0 | Base game with menus, core gameplay loop, CSS animations, and procedural audio. |
| Alpha 1.1 | Horizontal menu layout, loading screen, keyboard-driven role selection, ESC pause system, customizable round timer. |
| Alpha 1.2 | Documentation overhaul (README technical write-up). |
| **Alpha 1.3** | **Visual identity redesign: solid background (`#131936`), oversized buttons, AcuaSplash title branding, favicon, player avatar icons (`user-icon.png`), role panel decorative icons (`bomb-icon.png`, `shield-icon.png`), emoji-free role selection, P1/P2 naming convention, loading bar custom easing (5s), compact controls hint layout.** |

*   **Current Version:** Alpha 1.3
*   **Status:** Functional Prototype / Local Multiplayer Edition

---

## 8. Licensing

This software is provided as a personal/academic technical demonstration.
