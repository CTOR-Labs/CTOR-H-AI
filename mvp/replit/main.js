import { CTOR } from './engine.js';

// =====================================================
//  CANVAS & RENDERING SETUP
// =====================================================

const N = CTOR.N;
const EMPTY = CTOR.EMPTY;
const P1 = CTOR.P1;
const P2 = CTOR.P2;

const CS = 44;
const TOTAL = N + 2;

const canvas = document.getElementById('board-canvas');
const ctx = canvas.getContext('2d');
canvas.width = TOTAL * CS;
canvas.height = TOTAL * CS;

// UI state
let hoveredMain = null;
let mode = null;
let putLeft = 2, moveLeft = 2, replaceLeft = 1;
let moveSrc = null;
let replaceSelected = [];
let replaceWaitDest = false;

let isDragging = false;
let dragPiece = null;
let dragCurrentX = 0, dragCurrentY = 0;

// =====================================================
//  RENDERING
// =====================================================

function drawPiece(ctx, x, y, owner, ghost = false, dragging = false) {
  const cx = x + CS / 2;
  const cy = y + CS / 2;
  const r = CS * 0.33;

  ctx.globalAlpha = ghost ? 0.45 : dragging ? 0.85 : 1;

  if (owner === P1) {
    const inner = ghost ? '#666677' : '#2a2a3e';
    const outer = ghost ? '#333344' : '#0a0a14';
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const inner = ghost ? '#cccccc' : '#ffffff';
    const outer = ghost ? '#999999' : '#c0d8e8';
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function perimToMain(row, col) {
  const isTop = row === 0;
  const isBottom = row === N + 1;
  const isLeft = col === 0;
  const isRight = col === N + 1;

  let mr = null, mc = null;

  if (isTop && !isLeft && !isRight) mr = N - 1, mc = col - 1;
  if (isBottom && !isLeft && !isRight) mr = 0, mc = col - 1;
  if (isLeft && !isTop && !isBottom) mr = row - 1, mc = N - 1;
  if (isRight && !isTop && !isBottom) mr = row - 1, mc = 0;

  if (isTop && isLeft) mr = N - 1, mc = N - 1;
  if (isTop && isRight) mr = N - 1, mc = 0;
  if (isBottom && isLeft) mr = 0, mc = N - 1;
  if (isBottom && isRight) mr = 0, mc = 0;

  return [mr, mc];
}

function canvasToMain(ex, ey) {
  const rect = canvas.getBoundingClientRect();
  const x = ex - rect.left;
  const y = ey - rect.top;
  const col = Math.floor(x / CS) - 1;
  const row = Math.floor(y / CS) - 1;
  if (col >= 0 && col < N && row >= 0 && row < N) return { r: row, c: col };
  return null;
}

function canvasToGrid(ex, ey) {
  const rect = canvas.getBoundingClientRect();
  const x = ex - rect.left;
  const y = ey - rect.top;
  const col = Math.floor(x / CS);
  const row = Math.floor(y / CS);
  if (col >= 0 && col < TOTAL && row >= 0 && row < TOTAL) return { row, col };
  return null;
}

function gridToMainRC(row, col) {
  if (row >= 1 && row <= N && col >= 1 && col <= N)
    return { r: row - 1, c: col - 1 };
  const [mr, mc] = perimToMain(row, col);
  if (mr !== null) return { r: mr, c: mc };
  return null;
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const validMovesSet = new Set();
  if (mode === 'move' && moveSrc) {
    for (const [vr, vc] of CTOR.getValidMoves(moveSrc.r, moveSrc.c)) {
      validMovesSet.add(`${vr},${vc}`);
    }
  }

  // Perimeter
  for (let row = 0; row < TOTAL; row++) {
    for (let col = 0; col < TOTAL; col++) {
      const isMain = row >= 1 && row <= N && col >= 1 && col <= N;
      if (isMain) continue;

      const x = col * CS, y = row * CS;
      const [mr, mc] = perimToMain(row, col);

      let bg = '#0d1117';
      const isValid = mr !== null && validMovesSet.has(`${mr},${mc}`) && CTOR.board[mr][mc] === EMPTY;

      ctx.fillStyle = bg;
      ctx.fillRect(x + 1, y + 1, CS - 2, CS - 2);

      if (mr !== null && CTOR.board[mr][mc] !== EMPTY) {
        drawPiece(ctx, x, y, CTOR.board[mr][mc], true);
      }
    }
  }

  // Main board
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = (c + 1) * CS;
      const y = (r + 1) * CS;

      ctx.fillStyle = '#111827';
      ctx.fillRect(x + 1, y + 1, CS - 2, CS - 2);

      if (CTOR.board[r][c] !== EMPTY) {
        drawPiece(ctx, x, y, CTOR.board[r][c]);
      }
    }
  }
}

// =====================================================
//  UI HELPERS
// =====================================================

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function updateUI() {
  const { s1, s2 } = CTOR.countPieces();
  document.getElementById('sc1').textContent = s1;
  document.getElementById('sc2').textContent = s2;

  const isP1 = CTOR.gameRunning && CTOR.currentPlayer === P1;

  document.getElementById('btn-put').disabled = !isP1 || putLeft === 0;
  document.getElementById('btn-move').disabled = !isP1 || moveLeft === 0;
  document.getElementById('btn-replace').disabled = !isP1 || replaceLeft === 0;
  document.getElementById('btn-end-turn').disabled = !isP1;
  document.getElementById('btn-end-game').disabled = !CTOR.gameRunning;
}

function activateMode(m) {
  mode = m;
}

function deactivateMode() {
  mode = null;
  moveSrc = null;
  replaceSelected = [];
  replaceWaitDest = false;
}

// =====================================================
//  PLAYER ACTIONS
// =====================================================

function handlePut(cell) {
  if (putLeft <= 0) return;
  if (CTOR.board[cell.r][cell.c] !== EMPTY) return;

  if (CTOR.operations.put(cell.r, cell.c, P1)) {
    putLeft--;
    updateUI();
    drawBoard();
  }
}

function handleReplace(cell) {
  if (replaceLeft <= 0) return;

  if (!replaceWaitDest) {
    if (CTOR.board[cell.r][cell.c] !== P1) return;

    const exists = replaceSelected.find(p => p.r === cell.r && p.c === cell.c);
    if (exists) {
      replaceSelected = replaceSelected.filter(p => !(p.r === cell.r && p.c === cell.c));
    } else if (replaceSelected.length < 2) {
      replaceSelected.push({ r: cell.r, c: cell.c });
      if (replaceSelected.length === 2) replaceWaitDest = true;
    }
  } else {
    if (CTOR.board[cell.r][cell.c] !== EMPTY) return;

    if (CTOR.operations.replace(replaceSelected, cell.r, cell.c, P1)) {
      replaceLeft--;
      replaceSelected = [];
      replaceWaitDest = false;
      updateUI();
      drawBoard();
    }
  }
}

// =====================================================
//  MOUSE EVENTS
// =====================================================

canvas.addEventListener('mousemove', e => {
  hoveredMain = canvasToMain(e.clientX, e.clientY);
  drawBoard();
});

canvas.addEventListener('click', e => {
  if (!CTOR.gameRunning || CTOR.currentPlayer !== P1) return;

  const cell = canvasToMain(e.clientX, e.clientY);
  if (!cell) return;

  if (mode === 'put') handlePut(cell);
  if (mode === 'replace') handleReplace(cell);
});

// =====================================================
//  GAME FLOW
// =====================================================

function startGame() {
  CTOR.startGame();
  putLeft = 2;
  moveLeft = 2;
  replaceLeft = 1;
  updateUI();
  drawBoard();
}

function endGame() {
  CTOR.endGame();
  updateUI();
  drawBoard();
}

function endTurn() {
  CTOR.endTurn();
  updateUI();
  drawBoard();

  setTimeout(() => {
    CTOR.aiTurn();
    putLeft = 2;
    moveLeft = 2;
    replaceLeft = 1;
    updateUI();
    drawBoard();
  }, 300);
}

// =====================================================
//  BUTTONS
// =====================================================

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-end-game').addEventListener('click', endGame);
document.getElementById('btn-end-turn').addEventListener('click', endTurn);

document.getElementById('btn-put').addEventListener('click', () => {
  activateMode('put');
});

document.getElementById('btn-move').addEventListener('click', () => {
  activateMode('move');
});

document.getElementById('btn-replace').addEventListener('click', () => {
  activateMode('replace');
});

// =====================================================
//  INIT
// =====================================================

CTOR.initBoard();
updateUI();
drawBoard();

