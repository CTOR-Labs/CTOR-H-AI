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

// IMPORTANT: set canvas size BEFORE drawing
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
    const { s1, s2 } = CTOR;

    // Score
    document.getElementById('sc1').textContent = s1;
    document.getElementById('sc2').textContent = s2;

    // Turn counters
    document.getElementById('cnt-put').textContent = putLeft;
    document.getElementById('cnt-move').textContent = moveLeft;
    document.getElementById('cnt-replace').textContent = replaceLeft;

    // Turn indicator
    const turnInd = document.getElementById('turn-ind');
    if (CTOR.currentPlayer === P1) {
        turnInd.textContent = "Your Turn";
        turnInd.className = "turn-indicator turn-p1";
    } else {
        turnInd.textContent = "AI Thinking...";
        turnInd.className = "turn-indicator turn-p2";
    }
}

// -----------------------------
// Game start
// -----------------------------
function startGame() {
    CTOR.reset();
    putLeft = 2;
    moveLeft = 2;
    replaceLeft = 1;
    mode = null;
    moveSrc = null;
    replaceSelected = [];
    replaceWaitDest = false;

    drawBoard();
    updateUI();

    // Enable buttons
    document.getElementById('btn-put').disabled = false;
    document.getElementById('btn-move').disabled = false;
    document.getElementById('btn-replace').disabled = false;
    document.getElementById('btn-end-turn').disabled = false;

    setStatus("Game started. Your move.");
}

// -----------------------------
// Button bindings
// -----------------------------
document.getElementById('btn-start').onclick = () => {
    startGame();
};

document.getElementById('btn-put').onclick = () => {
    mode = "put";
    setStatus("Place a piece.");
};

document.getElementById('btn-move').onclick = () => {
    mode = "move";
    setStatus("Select a piece to move.");
};

document.getElementById('btn-replace').onclick = () => {
    mode = "replace";
    replaceSelected = [];
    replaceWaitDest = false;
    setStatus("Select 2 pieces to replace.");
};

// FIXED: correct ID for End Turn button
document.getElementById('btn-end-turn').onclick = async () => {
    if (CTOR.currentPlayer !== P1) return;

    CTOR.endTurn();
    updateUI();
    setStatus("AI is thinking...");

    await AI.makeMove(CTOR);

    CTOR.endTurn();
    drawBoard();
    updateUI();
    setStatus("Your turn");
};

// -----------------------------
// Initial
// -----------------------------
setStatus("Welcome to CTOR. Press Start Game.");
drawBoard();

