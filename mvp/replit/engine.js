export const CTOR = {

    // =====================================================
    //  CONSTANTS & STATE
    // =====================================================
    N: 8,
    EMPTY: 0,
    P1: 1,
    P2: 2,

    board: [],
    currentPlayer: 1,
    gameRunning: false,

    // =====================================================
    //  BOARD
    // =====================================================
    initBoard() {
        this.board = [];
        for (let r = 0; r < this.N; r++) {
            this.board[r] = new Array(this.N).fill(this.EMPTY);
        }
    },

    inBounds(r, c) {
        return r >= 0 && r < this.N && c >= 0 && c < this.N;
    },

    // =====================================================
    //  TOROIDAL NEIGHBOURS
    // =====================================================
    toroidalNeighbours(r, c) {
        const N = this.N;
        return [
            [(r - 1 + N) % N, c],
            [(r + 1) % N, c],
            [r, (c - 1 + N) % N],
            [r, (c + 1) % N],
        ];
    },

    neighbours8(r, c) {
        const N = this.N;
        const res = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                res.push([(r + dr + N) % N, (c + dc + N) % N]);
            }
        }
        return res;
    },

    // =====================================================
    //  EATING
    // =====================================================
    applyEating(attacker) {
        const defender = attacker === this.P1 ? this.P2 : this.P1;
        let changed = true;

        while (changed) {
            changed = false;

            for (let r = 0; r < this.N; r++) {
                for (let c = 0; c < this.N; c++) {
                    if (this.board[r][c] !== defender) continue;

                    const nbrs = this.neighbours8(r, c);
                    const attackCount = nbrs.filter(([nr, nc]) =>
                        this.board[nr][nc] === attacker
                    ).length;

                    if (attackCount >= 5) {
                        this.board[r][c] = attacker;
                        changed = true;
                    }
                }
            }
        }
    },

    runEating(player) {
        this.applyEating(player);
    },

    // =====================================================
    //  VALID MOVES
    // =====================================================
    getValidMoves(r, c) {
        return this.toroidalNeighbours(r, c)
            .filter(([nr, nc]) => this.board[nr][nc] === this.EMPTY);
    },

    // =====================================================
    //  OPERATIONS
    // =====================================================
    operations: {

        put(r, c, player) {
            if (CTOR.board[r][c] !== CTOR.EMPTY) return false;
            CTOR.board[r][c] = player;
            CTOR.runEating(player);
            return true;
        },

        move(fromR, fromC, toR, toC, player) {
            if (CTOR.board[toR][toC] !== CTOR.EMPTY) return false;

            const valid = CTOR.getValidMoves(fromR, fromC)
                .some(([vr, vc]) => vr === toR && vc === toC);

            if (!valid) return false;

            CTOR.board[toR][toC] = player;
            CTOR.board[fromR][fromC] = CTOR.EMPTY;
            CTOR.runEating(player);
            return true;
        },

        replace(removeList, destR, destC, player) {
            if (CTOR.board[destR][destC] !== CTOR.EMPTY) return false;

            for (const p of removeList) {
                CTOR.board[p.r][p.c] = CTOR.EMPTY;
            }

            CTOR.board[destR][destC] = player;
            CTOR.runEating(player);
            return true;
        }
    },

    // =====================================================
    //  GAME FLOW
    // =====================================================
    startGame() {
        this.initBoard();
        this.gameRunning = true;
        this.currentPlayer = this.P1;
    },

    endGame() {
        this.gameRunning = false;
        this.currentPlayer = 0;
        this.initBoard();
    },

    endTurn() {
        if (!this.gameRunning) return;
        this.currentPlayer = this.P2;
    },

    // =====================================================
    //  AI HELPERS
    // =====================================================
    emptyCells() {
        const res = [];
        for (let r = 0; r < this.N; r++)
            for (let c = 0; c < this.N; c++)
                if (this.board[r][c] === this.EMPTY) res.push([r, c]);
        return res;
    },

    piecesOf(player) {
        const res = [];
        for (let r = 0; r < this.N; r++)
            for (let c = 0; c < this.N; c++)
                if (this.board[r][c] === player) res.push([r, c]);
        return res;
    },

    snapBoard() {
        const s = new Int8Array(this.N * this.N);
        for (let r = 0; r < this.N; r++)
            for (let c = 0; c < this.N; c++)
                s[r * this.N + c] = this.board[r][c];
        return s;
    },

    restoreBoard(s) {
        for (let r = 0; r < this.N; r++)
            for (let c = 0; c < this.N; c++)
                this.board[r][c] = s[r * this.N + c];
    },

    dangerScore(r, c, opp) {
        return this.neighbours8(r, c)
            .filter(([nr, nc]) => this.board[nr][nc] === opp).length;
    },

    cellScore(r, c, player) {
        const opp = player === this.P2 ? this.P1 : this.P2;
        const nbrs = this.neighbours8(r, c);
        const ownNbr = nbrs.filter(([nr, nc]) => this.board[nr][nc] === player).length;
        const oppNbr = nbrs.filter(([nr, nc]) => this.board[nr][nc] === opp).length;

        let eatThreat = 0;
        for (const [nr, nc] of nbrs) {
            if (this.board[nr][nc] === opp) {
                const already = this.neighbours8(nr, nc)
                    .filter(([xr, xc]) => this.board[xr][xc] === player).length;
                const after = already + 1;
                if (after >= 5) eatThreat += 30;
                else if (after === 4) eatThreat += 12;
                else if (after === 3) eatThreat += 4;
            }
        }

        return ownNbr * 3 + eatThreat - oppNbr * 4;
    },

    simulatePut(r, c, player) {
        const snap = this.snapBoard();
        this.board[r][c] = player;
        this.runEating(player);

        let s2 = 0, s1 = 0;
        for (let rr = 0; rr < this.N; rr++)
            for (let cc = 0; cc < this.N; cc++) {
                if (this.board[rr][cc] === this.P2) s2++;
                if (this.board[rr][cc] === this.P1) s1++;
            }

        const gain = player === this.P2 ? (s2 - s1) : (s1 - s2);
        this.restoreBoard(snap);
        return gain;
    },

    // =====================================================
    //  AI TURN
    // =====================================================
    aiPut() {
        const empty = this.emptyCells();
        if (empty.length === 0) return;

        let best = -Infinity, bestCell = null;

        for (const [r, c] of empty) {
            const simGain = this.simulatePut(r, c, this.P2) * 10;
            const posScore = this.cellScore(r, c, this.P2);
            const total = simGain + posScore;

            if (total > best) {
                best = total;
                bestCell = [r, c];
            }
        }

        if (!bestCell) bestCell = empty[Math.floor(Math.random() * empty.length)];

        this.board[bestCell[0]][bestCell[1]] = this.P2;
        this.runEating(this.P2);
    },

    aiMove() {
        const pieces = this.piecesOf(this.P2);
        if (pieces.length === 0) return;

        let best = -Infinity, bestFrom = null, bestTo = null;

        for (const [r, c] of pieces) {
            const moves = this.getValidMoves(r, c);
            for (const [nr, nc] of moves) {
                const snap = this.snapBoard();
                this.board[nr][nc] = this.P2;
                this.board[r][c] = this.EMPTY;
                this.runEating(this.P2);

                let s2 = 0, s1 = 0;
                for (let rr = 0; rr < this.N; rr++)
                    for (let cc = 0; cc < this.N; cc++) {
                        if (this.board[rr][cc] === this.P2) s2++;
                        if (this.board[rr][cc] === this.P1) s1++;
                    }

                const netPieces = (s2 - s1) * 10;
                const srcDanger = this.dangerScore(r, c, this.P1);
                const destDanger = this.dangerScore(nr, nc, this.P1);
                const safetyGain = (srcDanger - destDanger) * 3;
                const posBonus = this.cellScore(nr, nc, this.P2);

                const total = netPieces + safetyGain + posBonus;
                this.restoreBoard(snap);

                if (total > best) {
                    best = total;
                    bestFrom = [r, c];
                    bestTo = [nr, nc];
                }
            }
        }

        if (!bestFrom) return;

        this.board[bestTo[0]][bestTo[1]] = this.P2;
        this.board[bestFrom[0]][bestFrom[1]] = this.EMPTY;
        this.runEating(this.P2);
    },

    aiReplace() {
        const pieces = this.piecesOf(this.P2);
        if (pieces.length < 2) return;

        const scored = pieces.map(([r, c]) => ({
            r, c, danger: this.dangerScore(r, c, this.P1)
        })).sort((a, b) => b.danger - a.danger);

        if (scored[0].danger < 3) return;

        const remove1 = scored[0];
        const remove2 = scored[1];

        const snap = this.snapBoard();
        this.board[remove1.r][remove1.c] = this.EMPTY;
        this.board[remove2.r][remove2.c] = this.EMPTY;

        const empty = this.emptyCells();
        if (empty.length === 0) {
            this.restoreBoard(snap);
            return;
        }

        let best = -Infinity, bestCell = null;

        for (const [r, c] of empty) {
            const simGain = this.simulatePut(r, c, this.P2) * 10;
            const posScore = this.cellScore(r, c, this.P2);
            const total = simGain + posScore;

            if (total > best) {
                best = total;
                bestCell = [r, c];
            }
        }

        if (!bestCell) bestCell = empty[Math.floor(Math.random() * empty.length)];

        this.board[bestCell[0]][bestCell[1]] = this.P2;
        this.runEating(this.P2);
    },

    aiTurn() {
        this.aiPut();
        this.aiPut();
        this.aiMove();
        this.aiMove();
        this.aiReplace();

        this.currentPlayer = this.P1;
    },

    // =====================================================
    //  GAME END
    // =====================================================
    countPieces() {
        let s1 = 0, s2 = 0;
        for (let r = 0; r < this.N; r++)
            for (let c = 0; c < this.N; c++) {
                if (this.board[r][c] === this.P1) s1++;
                if (this.board[r][c] === this.P2) s2++;
            }
        return { s1, s2 };
    },

    canAnyoneMove() {
        const { s1, s2 } = this.countPieces();
        const total = this.N * this.N;

        if (s1 + s2 < total) return true;

        for (let r = 0; r < this.N; r++)
            for (let c = 0; c < this.N; c++) {
                if (this.board[r][c] !== this.EMPTY) {
                    if (this.getValidMoves(r, c).length > 0) return true;
                }
            }

        return false;
    },

    checkGameEnd() {
        if (!this.gameRunning) return false;

        const { s1, s2 } = this.countPieces();
        const total = this.N * this.N;

        if (s1 + s2 >= total || !this.canAnyoneMove()) {
            return { s1, s2 };
        }

        return false;
    }
};

