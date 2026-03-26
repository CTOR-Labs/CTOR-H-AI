import { CTOR } from './engine.js';
import { AI } from './ai-lite.js';

// -----------------------------
// UI state
// -----------------------------
let mode = null;
let putLeft = 2, moveLeft = 2, replaceLeft = 1;
let moveSrc = null;
let replaceSelected = [];
let replaceWaitDest = false;

// -----------------------------
// Canvas setup
// -----------------------------
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

// -----------------------------
// Rendering helpers
// -----------------------------
function drawPiece(ctx, x, y, owner) {
    const cx = x + CS / 2;
    const cy = y + CS / 2;
    const r = CS * 0.33;

    ctx.fillStyle = owner === P1 ? '#2a2a3e' : '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
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

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

// -----------------------------
// UI helpers
// -----------------------------
function setStatus(msg) {
    document.getElementById('status').textContent = msg;
}

function updateUI() {
    const { s1, s2 } = CT
// -----------------------------
// UI helpers
// -----------------------------
function setStatus(msg) {
    document.getElementById('status').textContent = msg;
}

function updateUI() {
    const { s1, s2 } = CT;

    // Update score
    document.getElementById('score-you').textContent = s1;
    document.getElementById('score-ai').textContent = s2;

    // Update turn counters
    document.getElementById('put-count').textContent = CT.turn.put;
    document.getElementById('move-count').textContent = CT.turn.move;
    document.getElementById('replace-count').textContent = CT.turn.replace;

    // Status message
    if (CT.isAITurn) {
        setStatus("AI is thinking...");
    } else {
        setStatus("Your turn");
    }
}

// -----------------------------
// Game start
// -----------------------------
function startGame() {
    CT.reset();
    CT.drawBoard();
    updateUI();
    setStatus("Game started. Your move.");
}

// -----------------------------
// Button bindings
// -----------------------------
document.getElementById('btn-start').onclick = () => {
    startGame();
};

document.getElementById('btn-put').onclick = () => {
    CT.setMode("put");
    setStatus("Place a piece.");
};

document.getElementById('btn-move').onclick = () => {
    CT.setMode("move");
    setStatus("Move a piece.");
};

document.getElementById('btn-replace').onclick = () => {
    CT.setMode("replace");
    setStatus("Select 2 pieces to replace.");
};

document.getElementById('btn-end').onclick = async () => {
    if (!CT.isAITurn) {
        CT.endTurn();
        updateUI();
        setStatus("AI is thinking...");

        await AI.makeMove(CT);
        CT.endTurn();
        updateUI();
        setStatus("Your turn");
    }
};

// -----------------------------
// Initial
// -----------------------------
setStatus("Welcome to CTOR. Press Start Game.");

