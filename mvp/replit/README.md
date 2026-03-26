# CTOR — Toroidal Abstract Strategy Game

CTOR is an original abstract strategy game played on an 8×8 toroidal board with a unique 3×3 neighbourhood capture mechanic (“eating”) and a hybrid turn structure:

- **Put ×2** — place a new piece  
- **Move ×2** — move to an adjacent cell (toroidal topology)  
- **Replace ×1** — remove two of your pieces and place one new piece  
- **Eating** — automatic capture when ≥5 enemy pieces surround a piece in its 3×3 neighbourhood  

This repository contains a fully modular MVP implementation:

- `engine.js` — pure CTOR rules  
- `ai-lite.js` — standalone AI module  
- `main.js` — UI, canvas rendering, user interaction  
- `index.html` + `style.css` — interface and layout  

## Features

- Toroidal board logic  
- 3×3 neighbourhood capture system  
- Player action system (Put / Move / Replace)  
- Greedy positional AI with simulated eating chains  
- Clean modular architecture (Engine / AI / UI)  
- Canvas‑based interactive board  

## Run

Open `index.html` in any static server or Replit.  
Press **Start Game** and play against the AI.

## License

MIT License.

## Author

Vladimir — creator of CTOR, its rules, topology, mechanics, and AI design.

