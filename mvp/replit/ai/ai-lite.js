export const AI = {

    emptyCells(CTOR) {
        const res = [];
        for (let r = 0; r < CTOR.N; r++)
            for (let c = 0; c < CTOR.N; c++)
                if (CTOR.board[r][c] === CTOR.EMPTY) res.push([r, c]);
        return res;
    },

    piecesOf(CTOR, player) {
        const res = [];
        for (let r = 0; r < CTOR.N; r++)
            for (let c = 0; c < CTOR.N; c++)
                if (CTOR.board[r][c] === player) res.push([r, c]);
        return res;
    },

    snapBoard(CTOR) {
        const s = new Int8Array(CTOR.N * CTOR.N);
        for (let r = 0; r < CTOR.N; r++)
            for (let c = 0; c < CTOR.N; c++)
                s[r * CTOR.N + c] = CTOR.board[r][c];
        return s;
    },

    restoreBoard(CTOR, s) {
        for (let r = 0; r < CTOR.N; r++)
            for (let c = 0; c < CTOR.N; c++)
                CTOR.board[r][c] = s[r * CTOR.N + c];
    },

    dangerScore(CTOR, r, c, opp) {
        return CTOR.neighbours8(r, c)
            .filter(([nr, nc]) => CTOR.board[nr][nc] === opp).length;
    },

    cellScore(CTOR, r, c, player) {
        const opp = player === CTOR.P2 ? CTOR.P1 : CTOR.P2;
        const nbrs = CTOR.neighbours8(r, c);
        const ownNbr = nbrs.filter(([nr, nc]) => CTOR.board[nr][nc] === player).length;
        const oppNbr = nbrs.filter(([nr, nc]) => CTOR.board[nr][nc] === opp).length;

        let eatThreat = 0;
        for (const [nr, nc] of nbrs) {
            if (CTOR.board[nr][nc] === opp) {
                const already = CTOR.neighbours8(nr, nc)
                    .filter(([xr, xc]) => CTOR.board[xr][xc] === player).length;
                const after = already + 1;
                if (after >= 5) eatThreat += 30;
                else if (after === 4) eatThreat += 12;
                else if (after === 3) eatThreat += 4;
            }
        }

        return ownNbr * 3 + eatThreat - oppNbr * 4;
    },

    simulatePut(CTOR, r, c, player) {
        const snap = this.snapBoard(CTOR);
        CTOR.board[r][c] = player;
        CTOR.runEating(player);

        let s2 = 0, s1 = 0;
        for (let rr = 0; rr < CTOR.N; rr++)
            for (let cc = 0; cc < CTOR.N; cc++) {
                if (CTOR.board[rr][cc] === CTOR.P2) s2++;
                if (CTOR.board[rr][cc] === CTOR.P1) s1++;
            }

        const gain = player === CTOR.P2 ? (s2 - s1) : (s1 - s2);
        this.restoreBoard(CTOR, snap);
        return gain;
    },

    aiPut(CTOR) {
        const empty = this.emptyCells(CTOR);
        if (empty.length === 0) return;

        let best = -Infinity, bestCell = null;

        for (const [r, c] of empty) {
            const simGain = this.simulatePut(CTOR, r, c, CTOR.P2) * 10;
            const posScore = this.cellScore(CTOR, r, c, CTOR.P2);
            const total = simGain + posScore;

            if (total > best) {
                best = total;
                bestCell = [r, c];
            }
        }

        if (!bestCell) bestCell = empty[Math.floor(Math.random() * empty.length)];

        CTOR.board[bestCell[0]][bestCell[1]] = CTOR.P2;
        CTOR.runEating(CTOR.P2);
    },

    aiMove(CTOR) {
        const pieces = this.piecesOf(CTOR, CTOR.P2);
        if (pieces.length === 0) return;

        let best = -Infinity, bestFrom = null, bestTo = null;

        for (const [r, c] of pieces) {
            const moves = CTOR.getValidMoves(r, c);
            for (const [nr, nc] of moves) {
                const snap = this.snapBoard(CTOR);
                CTOR.board[nr][nc] = CTOR.P2;
                CTOR.board[r][c] = CTOR.EMPTY;
                CTOR.runEating(CTOR.P2);

                let s2 = 0, s1 = 0;
                for (let rr = 0; rr < CTOR.N; rr++)
                    for (let cc = 0; cc < CTOR.N; cc++) {
                        if (CTOR.board[rr][cc] === CTOR.P2) s2++;
                        if (CTOR.board[rr][cc] === CTOR.P1) s1++;
                    }

                const netPieces = (s2 - s1) * 10;
                const srcDanger = this.dangerScore(CTOR, r, c, CTOR.P1);
                const destDanger = this.dangerScore(CTOR, nr, nc, CTOR.P1);
                const safetyGain = (srcDanger - destDanger) * 3;
                const posBonus = this.cellScore(CTOR, nr, nc, CTOR.P2);

                const total = netPieces + safetyGain + posBonus;
                this.restoreBoard(CTOR, snap);

                if (total > best) {
                    best = total;
                    bestFrom = [r, c];
                    bestTo = [nr, nc];
                }
            }
        }

        if (!bestFrom) return;

        CTOR.board[bestTo[0]][bestTo[1]] = CTOR.P2;
        CTOR.board[bestFrom[0]][bestFrom[1]] = CTOR.EMPTY;
        CTOR.runEating(CTOR.P2);
    },

    aiReplace(CTOR) {
        const pieces = this.piecesOf(CTOR, CTOR.P2);
        if (pieces.length < 2) return;

        const scored = pieces.map(([r, c]) => ({
            r, c, danger: this.dangerScore(CTOR, r, c, CTOR.P1)
        })).sort((a, b) => b.danger - a.danger);

        if (scored[0].danger < 3) return;

        const remove1 = scored[0];
        const remove2 = scored[1];

        const snap = this.snapBoard(CTOR);
        CTOR.board[remove1.r][remove1.c] = CTOR.EMPTY;
        CTOR.board[remove2.r][remove2.c] = CTOR.EMPTY;

        const empty = this.emptyCells(CTOR);
        if (empty.length === 0) {
            this.restoreBoard(CTOR, snap);
            return;
        }

        let best = -Infinity, bestCell = null;

        for (const [r, c] of empty) {
            const simGain = this.simulatePut(CTOR, r, c, CTOR.P2) * 10;
            const posScore = this.cellScore(CTOR, r, c, CTOR.P2);
            const total = simGain + posScore;

            if (total > best) {
                best = total;
                bestCell = [r, c];
            }
        }

        if (!bestCell) bestCell = empty[Math.floor(Math.random() * empty.length)];

        CTOR.board[bestCell[0]][bestCell[1]] = CTOR.P2;
        CTOR.runEating(CTOR.P2);
    },

    aiTurn(CTOR) {
        this.aiPut(CTOR);
        this.aiPut(CTOR);
        this.aiMove(CTOR);
        this.aiMove(CTOR);
        this.aiReplace(CTOR);

        CTOR.currentPlayer = CTOR.P1;
    }
};

