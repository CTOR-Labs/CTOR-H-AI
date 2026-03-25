# ⚡ CTOR‑H‑AI — Replit Buildathon MVP  
### Lightweight Browser Version of CTOR for Replit Agent 4 Buildathon  
Maintainer: Vladimir (CTOR‑Labs)

---

## 🎯 Purpose of This Version
This directory contains the **Replit‑optimized MVP** of the CTOR game.  
It is designed to run **entirely in the browser**, without build tools, servers, or external dependencies.

The goal of this version is to provide:

- a clean and readable codebase  
- a modular structure suitable for rapid iteration  
- a fully playable CTOR implementation  
- a lightweight AI opponent  
- a project layout that is easy for Replit judges to understand  

This MVP is intentionally simpler than the long‑term `model/` architecture and focuses on clarity, speed, and usability.

---

# 📁 Project Structure

mvp/replit/
index.html      # UI and script loading
style.css       # Visual styling
main.js         # Game controller and UI logic
engine.js       # CTOR game engine (rules and mechanics)
ai-lite.js      # Lightweight AI for MVP
README.md       # Documentation for Buildathon


---

# 🧩 Module Descriptions

## 🟦 `index.html`
The main HTML file for the MVP.

**Responsibilities:**
- defines the game board container  
- loads all JavaScript modules  
- connects UI elements (buttons, board, status area)  
- provides the minimal structure required for gameplay  

This file keeps markup simple and delegates all logic to JS modules.

---

## 🎨 `style.css`
The stylesheet for the MVP.

**Responsibilities:**
- board layout and cell styling  
- colors for players and highlights  
- spacing, fonts, and basic UI polish  

The styling is intentionally lightweight to keep the focus on gameplay.

---

## 🟩 `main.js`
The central controller of the MVP.

**Responsibilities:**
- initializes the game  
- handles user input (clicks, actions)  
- updates the UI after each move  
- communicates with `engine.js` and `ai-lite.js`  
- manages turn order and game state transitions  

This file acts as the “glue” between UI and game logic.

---

## 🔧 `engine.js`
The core CTOR game engine implemented in pure JavaScript.

**Responsibilities:**
- board representation  
- toroidal geometry (wrap‑around edges)  
- rules for:
  - Put  
  - Move  
  - Replace  
  - Eating  
  - Duplication  
- victory and end‑game checks  
- generating legal moves  

This module contains **all official CTOR mechanics** and is fully independent from UI.

---

## 🤖 `ai-lite.js`
A lightweight heuristic AI designed specifically for the MVP.

**Responsibilities:**
- evaluate board states  
- choose a reasonable move quickly  
- avoid deep search (no minimax, no MCTS)  
- run efficiently in the browser  

This AI is intentionally simple but provides a fun and competitive opponent.

---

## 📘 `README.md`
This document.

**Responsibilities:**
- describe the purpose of the Replit MVP  
- explain the structure of the project  
- help judges and contributors understand the code layout  

---

# 🚀 Notes for Replit Buildathon
- This MVP is optimized for **clarity and modularity**, not maximum AI strength.  
- All modules are pure JavaScript and run directly in the browser.  
- No build steps, no bundlers, no external dependencies.  
- The structure is intentionally simple and easy to navigate.  

---

# 🧠 Future Extensions
- animations for eating and duplication  
- improved AI heuristics  
- optional minimax or MCTS modules  
- sound effects and UI enhancements  

---

# ✔ Status
This version is ready for integration, testing, and further development inside Replit.


