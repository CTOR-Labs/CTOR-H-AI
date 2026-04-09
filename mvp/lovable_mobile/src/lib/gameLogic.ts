// CTOR Game Logic
// Board is 8x8 main + peripheral mirror cells (torus topology)

export const BOARD_SIZE = 8;
export const TOTAL_SIZE = BOARD_SIZE + 2; // 10x10 with mirror border

export type CellValue = 0 | 1 | 2; // 0=empty, 1=black(player1), 2=white(player2)
export type ActionType = 'put' | 'move' | 'replace' | null;

export interface GameState {
  // Main board 8x8 (indices 0-7)
  board: CellValue[][];
  // Mirror board 10x10 (includes border)
  mirror: CellValue[][];
  currentPlayer: 1 | 2;
  putsLeft: number;
  movesLeft: number;
  replacesLeft: number;
  activeAction: ActionType;
  gameStarted: boolean;
  gameOver: boolean;
  winner: 0 | 1 | 2 | null; // 0=draw
  // For replace action
  replaceSelected: [number, number][];
  // For move action
  moveFrom: [number, number] | null;
  message: string;
  // For capture animation: cells that were just captured
  capturedCells: { r: number; c: number; player: CellValue }[];
}

export function createInitialState(): GameState {
  const board: CellValue[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0)
  );
  const mirror: CellValue[][] = Array.from({ length: TOTAL_SIZE }, () =>
    Array(TOTAL_SIZE).fill(0)
  );
  return {
    board,
    mirror,
    currentPlayer: 1,
    putsLeft: 2,
    movesLeft: 2,
    replacesLeft: 1,
    activeAction: null,
    gameStarted: false,
    gameOver: false,
    winner: null,
    replaceSelected: [],
    moveFrom: null,
    message: 'Press "Start Game"',
    capturedCells: [],
  };
}

export function resetTurn(state: GameState): GameState {
  return {
    ...state,
    putsLeft: 2,
    movesLeft: 2,
    replacesLeft: 1,
    activeAction: null,
    replaceSelected: [],
    moveFrom: null,
  };
}

// Wrap coordinate for torus topology
export function wrap(c: number): number {
  return ((c % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
}

// Update mirror cells for the entire board
export function updateMirror(board: CellValue[][]): CellValue[][] {
  const mirror: CellValue[][] = Array.from({ length: TOTAL_SIZE }, () =>
    Array(TOTAL_SIZE).fill(0)
  );
  // Copy main board to center of mirror (offset by 1)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      mirror[r + 1][c + 1] = board[r][c];
    }
  }
  // Top and bottom mirror rows
  for (let c = 0; c < BOARD_SIZE; c++) {
    mirror[0][c + 1] = board[BOARD_SIZE - 1][c]; // top row mirrors bottom
    mirror[TOTAL_SIZE - 1][c + 1] = board[0][c]; // bottom row mirrors top
  }
  // Left and right mirror columns
  for (let r = 0; r < BOARD_SIZE; r++) {
    mirror[r + 1][0] = board[r][BOARD_SIZE - 1]; // left mirrors right
    mirror[r + 1][TOTAL_SIZE - 1] = board[r][0]; // right mirrors left
  }
  // Corners
  mirror[0][0] = board[BOARD_SIZE - 1][BOARD_SIZE - 1];
  mirror[0][TOTAL_SIZE - 1] = board[BOARD_SIZE - 1][0];
  mirror[TOTAL_SIZE - 1][0] = board[0][BOARD_SIZE - 1];
  mirror[TOTAL_SIZE - 1][TOTAL_SIZE - 1] = board[0][0];
  return mirror;
}

// Count neighbors of a given player around (r,c) on main board using torus wrapping
export function countNeighbors(board: CellValue[][], r: number, c: number, player: 1 | 2): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = wrap(r + dr);
      const nc = wrap(c + dc);
      if (board[nr][nc] === player) count++;
    }
  }
  return count;
}

// Eating action: chain reaction
// Returns the new board and a list of captured cell positions
export function performEating(board: CellValue[][], currentPlayer: 1 | 2): { board: CellValue[][]; captured: [number, number][] } {
  const opponent: 1 | 2 = currentPlayer === 1 ? 2 : 1;
  const newBoard = board.map(row => [...row]);
  const captured: [number, number][] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c] === opponent) {
          const neighborCount = countNeighbors(newBoard, r, c, currentPlayer);
          if (neighborCount >= 5) {
            newBoard[r][c] = currentPlayer;
            captured.push([r, c]);
            changed = true;
          }
        }
      }
    }
  }
  return { board: newBoard, captured };
}

// Count pieces on main board
export function countPieces(board: CellValue[][]): { p1: number; p2: number } {
  let p1 = 0, p2 = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 1) p1++;
      if (board[r][c] === 2) p2++;
    }
  }
  return { p1, p2 };
}

// Check if game is over (board full or no moves possible)
export function checkGameOver(board: CellValue[][]): { over: boolean; winner: 0 | 1 | 2 | null } {
  const { p1, p2 } = countPieces(board);
  const total = p1 + p2;
  const totalCells = BOARD_SIZE * BOARD_SIZE;
  
  if (total === totalCells) {
    if (p1 > p2) return { over: true, winner: 1 };
    if (p2 > p1) return { over: true, winner: 2 };
    return { over: true, winner: 0 };
  }
  
  return { over: false, winner: null };
}

// Check if a player can make any move
export function canPlayerMove(board: CellValue[][], player: 1 | 2): boolean {
  // Can always put if there's an empty cell
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return true;
    }
  }
  return false;
}

// Get adjacent empty cells (orthogonal only)
export function getAdjacentEmpty(board: CellValue[][], r: number, c: number): [number, number][] {
  const result: [number, number][] = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = wrap(r + dr);
    const nc = wrap(c + dc);
    if (board[nr][nc] === 0) {
      result.push([nr, nc]);
    }
  }
  return result;
}

// Find AI pieces that pressure the player: 2 enemies nearby but not in danger (< 3)
function findThreateningPieces(board: CellValue[][]): { pos: [number, number]; enemies: number }[] {
  const result: { pos: [number, number]; enemies: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 2) {
        const enemies = countNeighbors(board, r, c, 1);
        if (enemies >= 2 && enemies < 3) {
          result.push({ pos: [r, c], enemies });
        }
      }
    }
  }
  return result.sort((a, b) => b.enemies - a.enemies);
}

// Score an empty cell for PUT: prefer cells adjacent to enemy clusters for pressure
function scorePutCell(board: CellValue[][], r: number, c: number): number {
  const enemyNeighbors = countNeighbors(board, r, c, 1);
  const allyNeighbors = countNeighbors(board, r, c, 2);
  // Ideal: place near enemies (pressure) and near allies (support), but not where we'd be threatened
  if (enemyNeighbors >= 3) return -1; // Would be under threat — bad
  return enemyNeighbors * 2 + allyNeighbors; // Prioritize enemy pressure + ally support
}

// Split empty cells into safe (≤2 enemies) and danger (≥3 enemies) categories
// AI prefers safe cells; only uses danger cells when no safe ones exist
function splitCellsBySafety(board: CellValue[][], emptyCells: [number, number][]): {
  safeCells: [number, number][];
  dangerCells: [number, number][];
} {
  const safeCells: [number, number][] = [];
  const dangerCells: [number, number][] = [];
  for (const [r, c] of emptyCells) {
    const enemyCount = countNeighbors(board, r, c, 1);
    if (enemyCount <= 2) {
      safeCells.push([r, c]);
    } else {
      dangerCells.push([r, c]);
    }
  }
  return { safeCells, dangerCells };
}

// Choose from safe cells first; fall back to danger cells only if no safe ones exist
function chooseSafeCells(board: CellValue[][], emptyCells: [number, number][]): [number, number][] {
  const { safeCells, dangerCells } = splitCellsBySafety(board, emptyCells);
  return safeCells.length > 0 ? safeCells : dangerCells;
}

// Find zones where AI has local dominance around a player piece (3-4 bot pieces in 3×3)
// Returns empty cells in that zone sorted by proximity, and how many PUTs to do
function findDominanceZones(board: CellValue[][]): { emptyCells: [number, number][]; putsNeeded: number }[] {
  const zones: { emptyCells: [number, number][]; putsNeeded: number }[] = [];
  
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 1) continue; // Only check player pieces
      
      const botCount = countNeighbors(board, r, c, 2);
      
      // Local dominance: 3 or 4 bot pieces surrounding a player piece
      if (botCount !== 3 && botCount !== 4) continue;
      
      // Collect empty cells in the 3×3 neighborhood
      const empty: { pos: [number, number]; dist: number }[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = wrap(r + dr);
          const nc = wrap(c + dc);
          if (board[nr][nc] === 0) {
            // Manhattan distance to player piece (always 1 or 2 in 3×3)
            empty.push({ pos: [nr, nc], dist: Math.abs(dr) + Math.abs(dc) });
          }
        }
      }
      
      if (empty.length === 0) continue;
      
      // Sort by distance (closest first)
      empty.sort((a, b) => a.dist - b.dist);
      
      // botCount == 3 → need 2 PUTs to reach 5; botCount == 4 → need 1 PUT
      const putsNeeded = botCount === 3 ? 2 : 1;
      
      zones.push({
        emptyCells: empty.map(e => e.pos),
        putsNeeded,
      });
    }
  }
  
  return zones;
}

// AI for Player 2
export function aiMove(board: CellValue[][]): CellValue[][] {
  let newBoard = board.map(row => [...row]);
  let putsRemaining = 2; // Track remaining PUT operations
  
  // === AGGRESSIVE PUT: reinforce zones where AI has local dominance ===
  // Priority: runs before neutral PUT logic to capitalize on pressure
  const dominanceZones = findDominanceZones(newBoard);
  
  for (const zone of dominanceZones) {
    if (putsRemaining <= 0) break;
    
    // Filter zone empty cells for safety before placing
    const safeZoneCells = chooseSafeCells(newBoard, zone.emptyCells);
    const putsToUse = Math.min(zone.putsNeeded, putsRemaining, safeZoneCells.length);
    
    for (let i = 0; i < putsToUse; i++) {
      const [r, c] = safeZoneCells[i];
      if (newBoard[r][c] !== 0) continue; // Safety check
      newBoard[r][c] = 2;
      newBoard = performEating(newBoard, 2).board;
      putsRemaining--;
    }
  }
  
  // === PUT action (remaining PUTs: prefer safe cells near enemy clusters) ===
  for (let i = 0; i < putsRemaining; i++) {
    const allEmpty: [number, number][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c] === 0) allEmpty.push([r, c]);
      }
    }
    if (allEmpty.length === 0) break;

    // Filter to safe cells first; fall back to danger cells
    const emptyCells = chooseSafeCells(newBoard, allEmpty);

    // Score all candidate cells and pick the best one
    const scored = emptyCells
      .map(([r, c]) => ({ pos: [r, c] as [number, number], score: scorePutCell(newBoard, r, c) }))
      .filter(s => s.score >= 0)
      .sort((a, b) => b.score - a.score);

    const best = scored.length > 0 ? scored : emptyCells.map(pos => ({ pos, score: 0 }));
    const topScore = best[0].score;
    const topCandidates = best.filter(s => s.score >= topScore - 1);
    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    
    newBoard[chosen.pos[0]][chosen.pos[1]] = 2;
    newBoard = performEating(newBoard, 2).board;
  }
  
  // === MOVE action x2 (aggressive: prioritize threatening pieces, move toward enemies) ===
  for (let i = 0; i < 2; i++) {
    const movable: [number, number][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c] === 2 && getAdjacentEmpty(newBoard, r, c).length > 0) {
          movable.push([r, c]);
        }
      }
    }
    if (movable.length === 0) continue;

    // Prioritize threatening pieces (already pressuring the player)
    const threatening = findThreateningPieces(newBoard)
      .filter(t => getAdjacentEmpty(newBoard, t.pos[0], t.pos[1]).length > 0);

    // Choose piece: prefer threatening pieces, else random movable
    const [r, c] = threatening.length > 0
      ? threatening[0].pos
      : movable[Math.floor(Math.random() * movable.length)];

    const adj = getAdjacentEmpty(newBoard, r, c);
    if (adj.length > 0) {
      // Score destinations: prefer cells that increase pressure on enemies
      const scoredMoves = adj.map(([nr, nc]) => {
        newBoard[r][c] = 0;
        const enemyPressure = countNeighbors(newBoard, nr, nc, 1);
        const allySupport = countNeighbors(newBoard, nr, nc, 2);
        newBoard[r][c] = 2; // Restore
        const safe = enemyPressure < 3;
        return { pos: [nr, nc] as [number, number], score: safe ? enemyPressure * 2 + allySupport : -1 };
      }).filter(s => s.score >= 0)
        .sort((a, b) => b.score - a.score);

      const target = scoredMoves.length > 0
        ? scoredMoves[0].pos
        : adj[Math.floor(Math.random() * adj.length)];

      newBoard[r][c] = 0;
      newBoard[target[0]][target[1]] = 2;
      newBoard = performEating(newBoard, 2).board;
    }
  }
  
  // === REPLACE action (improved heuristic) ===
  // Step 1: Find all AI pieces under threat (3+ player pieces in 3x3 neighborhood)
  const p2Pieces: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] === 2) p2Pieces.push([r, c]);
    }
  }

  const threatened = p2Pieces
    .map(([r, c]) => ({ pos: [r, c] as [number, number], threat: countNeighbors(newBoard, r, c, 1) }))
    .filter(t => t.threat >= 3)
    .sort((a, b) => b.threat - a.threat); // Most threatened first

  // Step 2: Only proceed if there are threatened pieces
  if (threatened.length > 0 && p2Pieces.length >= 4) {
    const mostThreatened = threatened[0];
    const [tr, tc] = mostThreatened.pos;

    // Step 3: Try to escape via MOVE before resorting to REPLACE
    const adjEmpty = getAdjacentEmpty(newBoard, tr, tc);
    const safeMoves = adjEmpty.filter(([nr, nc]) => {
      // Simulate the move and check if new position is safe (<3 enemy neighbors)
      // Temporarily move the piece to check neighbor count
      newBoard[tr][tc] = 0;
      const threatAtNew = countNeighbors(newBoard, nr, nc, 1);
      newBoard[tr][tc] = 2; // Restore
      return threatAtNew < 3;
    });

    if (safeMoves.length > 0) {
      // Step 3a: Safe MOVE found — escape instead of REPLACE
      const [nr, nc] = safeMoves[Math.floor(Math.random() * safeMoves.length)];
      newBoard[tr][tc] = 0;
      newBoard[nr][nc] = 2;
      newBoard = performEating(newBoard, 2).board;
    } else {
      // Step 4: No safe MOVE — perform REPLACE (remove 2 own pieces, place 1 new)
      const others = p2Pieces.filter(p => p[0] !== tr || p[1] !== tc);
      const secondThreatened = threatened.length > 1
        ? threatened[1].pos
        : others[Math.floor(Math.random() * others.length)];

      const toRemove: [number, number][] = [mostThreatened.pos, secondThreatened];

      newBoard[toRemove[0][0]][toRemove[0][1]] = 0;
      newBoard[toRemove[1][0]][toRemove[1][1]] = 0;

      // Place new piece on a safe empty cell (avoid dangerous positions)
      const allEmpty: [number, number][] = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (newBoard[r][c] === 0) allEmpty.push([r, c]);
        }
      }
      if (allEmpty.length > 0) {
        const candidates = chooseSafeCells(newBoard, allEmpty);
        const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
        newBoard[r][c] = 2;
        newBoard = performEating(newBoard, 2).board;
      }
    }
  }
  // If no threats — skip REPLACE entirely
  
  return newBoard;
}
