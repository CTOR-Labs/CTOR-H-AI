
This **H‑AI (Human–Artificial Intelligence)** branch contains the development of multiple versions of the game **CTOR**  
https://ctorgame.com/

All implementations follow the official rules described here:  
https://github.com/CTOR-Labs/CTOR-H-AI/blob/main/mvp/CTOR-Rules.md

We maintain several prototypes of the **“Player vs AI Bot”** version of CTOR, created on different platforms and with different architectural approaches.

You can contribute to the project by helping us:  
— improve the UI  
— enhance the AI bot algorithms  
— propose architectural or gameplay improvements  
— test and evaluate the prototypes  

# Overview

This repository contains three independent development lines of **CTOR‑H‑AI**.

The goal of the first stage is to identify a convenient platform for prototyping the game interface (colors, animations, game‑control buttons).  
The goal of the second stage is to determine a platform suitable for building a more commercial version, where the AI bot can be replaced and a functional prototype can be released for testing.

Below are the three working prototypes included in this repository.

---

# 🟦 Claude  
**Deployment:** Netlify  
**Format:** Single HTML file (~1423 lines)

The first CTOR version created in the Claude environment.  
Useful for analysis, comparison, and historical context.

**Public deployment:**  
https://ctor-claude-v1.netlify.app/ 
---

# 🟧 Lovable  
**Deployment:** Only through the Lovable platform  
**Format:** Modular React/Vite structure  
**Note:** Other deployment methods do not work

A UI‑oriented prototype.  
Used for testing interface concepts, animations, and visual elements.  
Logical components are portable; the UI layer is not.

**Public deployment:**  
https://ctor-lovable-palitra.netlify.app/ 
---

# 🟩 Replit  
**Deployment:** Inside Replit  
**Format:** Lightweight JS/HTML version  
**Limitation:** Free mode works for 14 days, then requires a paid plan  
**Structure:** Modular

Suitable for quick prototypes, hackathons, and demonstrations.

**Public deployment:** 
https://ctor-game-mvp--vlad287.replit.app/
---

# 🌐 Prototypes that exist but are **not included in this repository**

These versions are available online but are not part of the current repository.

### **VO / Vercel**  
**Title:** CTOR — Toroidal Capture Strategy Game  
**Public deployment:**  
https://a-ivs-h-vercel-j2ggfop68-bva5-7066s-projects.vercel.app/

### **Antigravity / Google**  
**Title:** CTOR — Premium Logic Game  
**Public deployment:**  
https://ctor-antigravity-v1.netlify.app/ 

### **Comet / Perplexity**  
Local version stored on a PC.  
Available upon request.

---

# 🗺️ Roadmap (April 2026)

### Upgrade the **Lovable** version to an MVP suitable for testing:
- UI design for the “Player vs AI” mode (commercial version or LinkedIn version)  
- Full heuristic algorithm  
- Educational version of the game with rule explanations  

### Evaluate the capabilities of the **Claude** version:
- Ability to integrate external design solutions  
- Ability to integrate the AI‑bot algorithm  
- Potential migration of elements from the Lovable version  

---

# 📝 General Notes

- The repository is intentionally divided into **three independent architectures**.  
- This allows parallel development of long‑term systems and fast prototypes.  
- MVP branches must remain lightweight and autonomous.

#Tech Stack

This project is built on a modular, multi‑platform development workflow designed to maximize speed, flexibility, and parallel iteration. Each platform serves a distinct purpose within the CTOR development ecosystem, enabling rapid prototyping while maintaining a stable production pipeline.

Lovable — UI Prototyping Environment
Lovable is used for rapid interface experimentation and visual iteration. It enables fast exploration of layouts, components, color systems, and UX patterns without requiring full implementation. The platform serves as a dedicated sandbox for front‑end design and UI innovation.

Claude — Logic, Algorithms, and AI Agent Development
Claude is responsible for the project’s core intelligence layer. All strategic reasoning, game logic, heuristics, and AI‑driven decision‑making modules are developed independently from the UI. This separation ensures clean architecture and allows the AI logic to evolve without affecting the interface.

Replit — Fast JavaScript Experimentation
Replit provides a lightweight environment for quick technical tests, isolated function prototypes, and rapid validation of ideas. It is ideal for experimenting with algorithms, utilities, and micro‑modules before integrating them into the main codebase.

Netlify — Stable Production Deployment
Netlify hosts the production‑ready builds of the project. It provides a reliable deployment pipeline, enabling external testing, demonstrations, and stable access to the latest working version. This ensures that the project remains accessible and testable outside the prototyping environment.
