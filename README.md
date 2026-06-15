# Dice Royale

Dice Royale is a stylish browser-based dice game built as a single self-contained HTML file. It combines a 3D dice scene, animated UI, sound effects, turn-based gameplay, and a simple race-to-the-target ruleset.

## Overview

The goal is to beat the House by reaching **50 banked points** first.

Each turn, you roll the die and build up **Turn Points**. You can keep rolling to push your luck or **bank** your current turn points into your total score. If you roll a **1**, you bust, lose the turn points from that turn, and the turn passes to the House.

The House plays automatically and uses a simple strategy:

- It keeps rolling until it reaches a safe threshold.
- It banks when its turn points reach **20**.
- It also banks if banking would win the game immediately.

## Features

- Interactive **3D dice** rendered with Three.js
- Elegant loading animation and intro transition
- Animated scoreboard for You and House
- Turn point tracker
- Roll history chips showing recent outcomes
- Auto-playing House opponent
- Win and loss modal with restart flow
- Confetti and sparkle effects
- Sound effects powered by Tone.js
- Responsive layout for desktop and mobile browsers

## Game Rules

1. You start first.
2. Click **Roll** to throw the dice.
3. If the result is **2-6**, that number is added to your current **Turn Points**.
4. If the result is **1**, you bust:
   - your current Turn Points are lost,
   - your turn ends,
   - the House takes over.
5. Click **Bank** to add your current Turn Points to your total score.
6. The first player to reach **50 banked points** wins.

## Controls

- **Roll**: Roll the dice during your turn.
- **Bank**: Save your current turn points and pass the turn.
- **Restart Game**: Reset the match at any time.
- **Play Again**: Restart from the win/lose modal.

## How To Run

This project does not require a build step or package installation.

### Option 1: Open directly

1. Open the `Dice-Game-` folder.
2. Double-click `dice.html`.
3. The game will open in your default browser.

### Option 2: Use a local server

If you want a local server instead of opening the file directly, run any simple static server from the project folder and open the page in your browser.

## Tech Stack

- **HTML5** for structure
- **CSS3** for layout, glass effects, gradients, and animations
- **JavaScript** for gameplay logic and UI updates
- **Three.js** for the 3D dice scene
- **OrbitControls** for subtle scene interaction
- **GSAP** for UI motion and transitions
- **Tone.js** for sound effects

## External Assets

This game loads a few resources from CDNs:

- Google Fonts: `Cormorant Garamond` and `Inter`
- Three.js
- Three.js OrbitControls
- GSAP
- Tone.js

## File Structure

```text
Dice-Game-/
├── dice.html
└── README.md
```

## Gameplay Notes

- The game is designed as a **race to 50**.
- The House is intentionally simple and predictable, making the game easy to learn.
- The interface is styled with a dark gold theme and includes animated feedback for rolls, wins, losses, and resets.
- Audio starts after the first user interaction, which is normal for browser autoplay restrictions.

## Browser Support

Dice Royale is intended for modern desktop and mobile browsers that support:

- WebGL
- HTML5 Canvas
- JavaScript ES6+
- Audio playback via Tone.js

For the best experience, use an up-to-date version of Chrome, Edge, Firefox, or Safari.

## Customization Ideas

If you want to extend the game later, good next improvements would be:

- changing the win target
- adjusting the House strategy
- adding score persistence with `localStorage`
- adding multiplayer mode
- adding difficulty levels
- adding a settings panel for sound and visuals

## Credits

Created as a polished single-file dice game experience with animated visuals, sound, and a turn-based risk/reward loop.
