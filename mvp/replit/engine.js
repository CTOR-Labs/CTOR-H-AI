export const CTOR = {

    N: 8,
    EMPTY: 0,
    P1: 1,
    P2: 2,

    board: [],
    currentPlayer: 1,
    gameRunning: false,

    // -----------------------------
    // Board
    // -----------------------------
    initBoard() {
        this.board = [];
        for (let r = 0; r < this.N; r++) {
            this.board[r] = new Array(this.N).fill(this.EMPTY);
        }
    },

    inBounds(r, c) {
        return r >= 0 && r < this.N && c >= 0 && c < this.N;
    },

    // -----------------------------
    // Toroidal neighbours
    // -----------------------------
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

    // -----------------------------
    // Eating
    // -----------------------------
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

    // -----------------------------
    // Valid moves
    // -----------------------------
    getValidMoves(r, c) {
        return this.toroidalNeighbours(r, c)
            .filter(([nr, nc]) => this.board[nr][nc] === this.EMPTY);
    },

    // -----------------------------
    // Operations
    // -----------------------------
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



