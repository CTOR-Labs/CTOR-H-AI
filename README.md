# 🌐 CTOR‑H‑AI  
### Hybrid Architecture for CTOR AI Development  
Maintainer: Vladimir (CTOR‑Labs)  
Status: Active

---

## 📌 Overview
This repository contains **two independent development lines** for CTOR‑H‑AI:

1. **Model Architecture** — a long‑term modular system for research and development of CTOR AI algorithms.  
2. **MVP Architecture** — lightweight JS/HTML versions of CTOR designed for rapid prototyping and competitions (e.g., Replit Buildathon).

Both lines evolve in parallel and serve different purposes.

---

# 🧠 1. Model Architecture (Long‑Term System)  
Directory: `model/`

A full research environment for CTOR AI development:

- modular structure  
- independent algorithms  
- extensible design  
- compatible with future CTOR‑Engine  
- runnable in both Node and browser environments  

### 📁 Structure
model/
heuristics/      # Heuristic evaluation (v2.1)
minimax/         # Minimax & alpha-beta (planned)
mcts/            # Monte-Carlo Tree Search (planned)
rl/              # Reinforcement Learning (planned)
utils/           # Shared utilities
ai.js            # AI entry point
README.md


### 🎯 Purpose
- research and experimentation  
- algorithm testing  
- foundation for future CTOR platform  
- preparation for RL and self‑play  
- long‑term architectural development  

This branch is **not** intended for hackathons or rapid MVPs.

---

# ⚡ 2. MVP Architecture (JS/HTML Game Versions)  
Directory: `mvp/`

Lightweight, standalone CTOR versions that run:

- directly in the browser  
- without build tools  
- without servers  
- without APIs  
- as a single executable project  

Ideal for:

- rapid prototyping  
- demos  
- hackathons  
- UI/UX testing  

---

## 🟦 2.1. `mvp/claude/` — First Prototype  
The initial CTOR version created in the CLAUDE environment.

### 📁 Structure
mvp/claude/
index.html
script.js
style.css
README.md


### 🎯 Purpose
- historical prototype  
- baseline implementation  
- useful for comparison and analysis  

---

## 🟩 2.2. `mvp/replit/` — Replit Buildathon Version  
A new CTOR version optimized specifically for **Replit Agent 4 Buildathon**.

### 📁 Structure
mvp/replit/
index.html       # UI
main.js          # Entry point
engine.js        # CTOR engine in one file
ai-lite.js       # Lightweight AI for MVP
style.css
README.md        # Buildathon-specific documentation


### ⚡ Features
- single executable project  
- runs instantly in Replit  
- no modules, no Node, no API  
- fast, simple, competition‑ready  

---

# 🔍 Why Two Architectures?

### 🧠 Model Architecture
- designed for long‑term growth  
- supports complex algorithms  
- ideal for research, RL, MCTS, minimax  
- forms the backbone of future CTOR platform  

### ⚡ MVP Architecture
- designed for speed  
- minimal infrastructure  
- easy to demo  
- perfect for hackathons  
- ideal for rapid UI/UX iteration  

Both lines complement each other without interfering.

---

# 🗺️ Roadmap

### Model
- v2.2 — heuristic expansion  
- v2.3 — minimax + alpha‑beta  
- v2.4 — MCTS  
- v2.5+ — RL and self‑play  

### MVP
- Replit Buildathon release  
- UI improvements  
- AI‑lite enhancements  
- eating/duplication animations  
- presentation materials  

---

# 📝 Maintainer Notes
- The repository is intentionally split into two independent architectures.  
- This allows simultaneous development of long‑term systems and rapid prototypes.  
- MVP branches must remain lightweight and self‑contained.  
- Model branch must remain modular and extensible.


