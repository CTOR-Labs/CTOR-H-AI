# CTOR — Game Rules (English Version)

## 1. Board Structure

The CTOR board consists of three zones:

- **Central Field** — the main playable area.
- **Inner Frame** — a real, playable ring of cells surrounding the central field.
- **Outer Frame** — a layer of *copies* that mirrors the inner frame; it is **not** part of the playable board.

**The Main Board = Central Field + Inner Frame.**  
The Outer Frame is used only for toroidal transitions and 3×3 neighborhood evaluation.

---

## 2. Pieces

Each player has an unlimited supply of pieces of their color.

- Pieces on the Main Board are **real**.
- Pieces on the Outer Frame are **copies**, not playable objects.
- Copies always mirror the state of their corresponding real cells.

---

## 3. Turn Structure

During their turn, a player may perform:

- up to **two Put** operations,
- **one Move**,
- **one Landing**,
- any number of **Capture** operations,

in any order, as long as all restrictions are respected.

---

## 4. Put

**Put** — placing a new piece onto an empty cell of the Main Board.

Restrictions:

- cannot place on an occupied cell;
- cannot place on the Outer Frame;
- maximum of two Put operations per turn.

---

## 5. Move

**Move** — moving one of your pieces to an adjacent cell horizontally or vertically.

Allowed:

- Moving onto the Outer Frame:
  - the piece on the Outer Frame becomes a **copy**,
  - the real piece reappears on the opposite side of the board (toroidal transition).

Forbidden:

- moving onto an occupied cell;
- diagonal movement;
- any movement that violates toroidal topology.

---

## 6. Landing

**Landing** — placing a new piece by removing **two of your own pieces** from the Main Board.

Restrictions:

- you must have at least two of your pieces on the board;
- cannot place on an occupied cell;
- cannot place on the Outer Frame;
- only one Landing per turn.

---

## 7. Capture

**Capture** — removing an opponent’s piece if it is fully surrounded in a 3×3 neighborhood.

The 3×3 neighborhood:

- consists of the 8 cells surrounding the target;
- respects toroidal transitions;
- uses Outer Frame copies when needed;
- works correctly on edges and corners.

Capture is allowed if:

- all 8 surrounding cells are occupied by the capturing player’s pieces;
- the target is a real opponent piece.

Capture is forbidden if:

- the target is on the Outer Frame;
- any surrounding cell is empty;
- any surrounding cell contains an opponent piece;
- the player attempts to remove their own piece.

There is no limit to the number of Captures in a single turn.

---

## 8. Operation Restrictions

### 8.1. General Restrictions

- Players cannot interact with the Outer Frame directly.
- No operation may produce an invalid or inconsistent board state.

### 8.2. Put

- cannot place on an occupied cell;
- cannot place on the Outer Frame;
- maximum two Put operations per turn.

### 8.3. Move

- cannot move onto an occupied cell;
- cannot move diagonally;
- moving onto the Outer Frame is allowed but triggers a toroidal transition.

### 8.4. Landing

- cannot perform Landing with fewer than two of your pieces on the board;
- cannot place on an occupied cell;
- cannot place on the Outer Frame;
- only one Landing per turn.

### 8.5. Capture

- cannot capture on the Outer Frame;
- cannot remove your own pieces;
- the 3×3 neighborhood must be fully valid.

### 8.6. Copy Behavior

- each inner-frame cell has one copy on the Outer Frame;
- **corner cells have three copies**;
- copies participate in 3×3 evaluation but are not playable objects.

---

## 9. Toroidal Topology

The CTOR board behaves as a torus.

### 9.1. Horizontal Transitions

- the left edge connects to the right edge.

### 9.2. Vertical Transitions

- the top edge connects to the bottom edge.

### 9.3. Inner and Outer Frames

- the Outer Frame mirrors the Inner Frame;
- all operations occur only on the Main Board.

### 9.4. Corners

- corner cells have three synchronized copies on the Outer Frame;
- these copies are used for transitions and 3×3 evaluation.

### 9.5. Invalid Actions

Any action violating toroidal topology is invalid.

### 9.6. Figure 1 — CTOR Toroidal Structure

![Figure 1 — CTOR Toroidal Structure](CTOR-Labs/docs/RULES/CTOR-COLOR_FIELD.png)
)

---

## 10. 3×3 Neighborhood and Capture

- the neighborhood consists of 8 cells around the target;
- toroidal transitions are applied automatically;
- Outer Frame copies are used to complete the neighborhood;
- Capture is allowed only when the neighborhood is fully controlled;
- multiple Captures may be performed in a single turn.

---

## 11. Game End and Victory

The game ends when:

- **all cells of the Main Board (Central Field + Inner Frame) are filled with pieces**.

### Victory Condition

The winner is the player with **more pieces** on the Main Board at the moment of full board completion.

### Draw

If both players have the same number of pieces, the game ends in a draw.

---
