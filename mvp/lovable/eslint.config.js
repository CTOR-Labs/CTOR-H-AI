import React, { useState, useCallback, useEffect } from 'react';
import GameBoard from '@/components/GameBoard';
import GameControls from '@/components/GameControls';
import InstructionsPanel from '@/components/InstructionsPanel';
import Footer from '@/components/Footer';
import PalettePanel, { PaletteColors, DEFAULT_PALETTE } from '@/components/PalettePanel';
import {
  GameState,
  createInitialState,
  resetTurn,
  updateMirror,
  performEating,
  countPieces,
  checkGameOver,
  getAdjacentEmpty,
  aiMove,
  wrap,
  BOARD_SIZE,
  ActionType,
} from '@/lib/gameLogic';

const Index = () => {
  const [state, setState] = useState<GameState>(createInitialState());
  const [palette, setPalette] = useState<PaletteColors>(DEFAULT_PALETTE);

  const updateState = useCallback((updates: Partial<GameState>, board?: GameState['board']) => {
    setState(prev => {
      const newBoard = board || prev.board;
      const mirror = updateMirror(newBoard);
      const score = countPieces(newBoard);
      const { over, winner } = checkGameOver(newBoard);
      return {
        ...prev,
        ...updates,
        board: newBoard,
        mirror,
        gameOver: over || prev.gameOver,
        winner: over ? winner : prev.winner,
      };
    });
  }, []);

  const handleStartGame = () => {
    const s = createInitialState();
    s.gameStarted = true;
    s.message = 'Choose action: Put, Move or Replace';
    s.mirror = updateMirror(s.board);
    setState(s);
  };

  const handleEndGame = () => {
    setState(createInitialState());
  };

  const handleEndTurn = () => {
    setState(prev => {
      const newMessage = 'Computer is thinking...';
      return { ...prev, currentPlayer: 2 as const, message: newMessage, activeAction: null, moveFrom: null, replaceSelected: [], capturedCells: [] };
    });
  };

  // AI turn effect
  useEffect(() => {
    if (state.currentPlayer === 2 && state.gameStarted && !state.gameOver) {
      const timer = setTimeout(() => {
        const newBoard = aiMove(state.board);
        const mirror = updateMirror(newBoard);
        const { over, winner } = checkGameOver(newBoard);
        const turnState = resetTurn({
          ...state,
          board: newBoard,
          mirror,
          currentPlayer: 1,
          message: over
            ? 'Game over!'
            : 'Your turn. Choose an action.',
          gameOver: over,
          winner: over ? winner : null,
          capturedCells: [],
        });
        setState(turnState);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.gameStarted, state.gameOver]);

  const handleCellClick = (r: number, c: number, _isMain: boolean) => {
    if (!state.gameStarted || state.gameOver || state.currentPlayer !== 1) return;

    const { activeAction, board } = state;

    if (activeAction === 'put') {
      if (board[r][c] !== 0 || state.putsLeft <= 0) return;
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = 1;
      const result = performEating(newBoard, 1);
      const capturedCells = result.captured.map(([cr, cc]) => ({ r: cr, c: cc, player: board[cr][cc] }));
      const putsLeft = state.putsLeft - 1;
      updateState({
        putsLeft,
        message: putsLeft > 0 ? `Put: ${putsLeft} left` : 'Put done. Choose another action.',
        activeAction: putsLeft > 0 ? 'put' : null,
        capturedCells,
      }, result.board);
    } else if (activeAction === 'move') {
      if (state.moveFrom === null) {
        if (board[r][c] !== 1) {
          setState(p => ({ ...p, message: 'Select your piece to move' }));
          return;
        }
        const adj = getAdjacentEmpty(board, r, c);
        if (adj.length === 0) {
          setState(p => ({ ...p, message: 'No empty adjacent cells for this piece' }));
          return;
        }
        setState(p => ({ ...p, moveFrom: [r, c], message: 'Drag or click an adjacent empty cell' }));
      } else {
        const [fr, fc] = state.moveFrom;
        if (board[r][c] !== 0) {
          setState(p => ({ ...p, moveFrom: null, message: 'Cell occupied. Select piece again.' }));
          return;
        }
        const isAdj = getAdjacentEmpty(board, fr, fc).some(([ar, ac]) => ar === r && ac === c);
        if (!isAdj) {
          setState(p => ({ ...p, moveFrom: null, message: 'Can only move to an adjacent cell.' }));
          return;
        }
        const newBoard = board.map(row => [...row]);
        newBoard[fr][fc] = 0;
        newBoard[r][c] = 1;
        const result = performEating(newBoard, 1);
        const capturedCells = result.captured.map(([cr, cc]) => ({ r: cr, c: cc, player: board[cr][cc] }));
        const movesLeft = state.movesLeft - 1;
        updateState({
          movesLeft,
          moveFrom: null,
          message: movesLeft > 0 ? `Move: ${movesLeft} left` : 'Move done.',
          activeAction: movesLeft > 0 ? 'move' : null,
          capturedCells,
        }, result.board);
      }
    } else if (activeAction === 'replace') {
      if (state.replacesLeft <= 0) return;
      const { replaceSelected } = state;
      if (replaceSelected.length < 2) {
        if (board[r][c] !== 1) {
          setState(p => ({ ...p, message: 'Click on your piece to select it' }));
          return;
        }
        if (replaceSelected.some(([rr, cc]) => rr === r && cc === c)) return;
        const newSel = [...replaceSelected, [r, c] as [number, number]];
        setState(p => ({
          ...p,
          replaceSelected: newSel,
          message: newSel.length < 2 ? 'Select second piece' : 'Click on an empty cell to place',
        }));
      } else {
        if (board[r][c] !== 0) {
          setState(p => ({ ...p, message: 'Select an empty cell' }));
          return;
        }
        const newBoard = board.map(row => [...row]);
        for (const [rr, cc] of replaceSelected) {
          newBoard[rr][cc] = 0;
        }
        newBoard[r][c] = 1;
        const result = performEating(newBoard, 1);
        const capturedCells = result.captured.map(([cr, cc]) => ({ r: cr, c: cc, player: board[cr][cc] }));
        updateState({
          replacesLeft: 0,
          replaceSelected: [],
          activeAction: null,
          message: 'Replace done.',
          capturedCells,
        }, result.board);
      }
    }
  };

  const handleDragStart = (r: number, c: number) => {
    if (state.activeAction === 'move' && state.board[r][c] === 1 && state.movesLeft > 0) {
      setState(p => ({ ...p, moveFrom: [r, c] }));
    }
  };

  const handleDrop = (r: number, c: number) => {
    if (state.activeAction === 'move' && state.moveFrom) {
      handleCellClick(r, c, true);
    }
  };

  const handleSelectAction = (action: ActionType) => {
    setState(p => ({
      ...p,
      activeAction: action,
      moveFrom: null,
      replaceSelected: [],
      capturedCells: [],
      message: action === 'put'
        ? 'Click on an empty cell to place a piece'
        : action === 'move'
        ? 'Select your piece to move'
        : action === 'replace'
        ? 'Select two of your pieces (click each)'
        : '',
    }));
  };

  const score = countPieces(state.board);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 font-mono">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-primary tracking-[0.3em]">
          CTOR
        </h1>
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase mt-1">
          Toroidal Strategy · Two Players
        </p>
      </div>

      <div className="flex flex-row items-start justify-center gap-6 w-full max-w-6xl flex-1">
      {/* Left column: Game + Score + Palette */}
        <div className="flex flex-col gap-2 w-[160px] flex-none font-mono">
          {/* Game controls */}
          <div className="bg-card rounded p-2.5 border border-border">
            <h3 className="text-primary font-bold text-[10px] tracking-widest uppercase mb-1.5">Game</h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleStartGame}
                disabled={state.gameStarted && !state.gameOver}
                className="w-full text-[10px] tracking-wider bg-primary text-primary-foreground rounded px-2 py-1.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                ▶ Start Game
              </button>
              <button
                onClick={handleEndGame}
                disabled={!state.gameStarted}
                className="w-full text-[10px] tracking-wider bg-destructive text-destructive-foreground rounded px-2 py-1.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                ■ End Game
              </button>
            </div>
          </div>

          {/* Score */}
          <div className="bg-card rounded p-2.5 border border-border">
            <h3 className="text-primary font-bold text-[10px] tracking-widest uppercase mb-1.5">Score</h3>
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <span className="text-foreground text-[10px]">▶ You</span>
                <span className="text-primary font-bold text-[10px]">{score.p1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground text-[10px]">▶ AI</span>
                <span className="text-primary font-bold text-[10px]">{score.p2}</span>
              </div>
            </div>
          </div>

          {/* Palette header */}
          <p className="text-primary font-bold text-[10px] tracking-widest uppercase text-center mt-1">
            Choose Your Colors
          </p>
          <PalettePanel palette={palette} onPaletteChange={setPalette} />
        </div>

        {/* Center: Game board + instructions */}
        <div className="flex flex-col items-center">
          <GameBoard
            mirror={state.mirror}
            board={state.board}
            onCellClick={handleCellClick}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            activeAction={state.activeAction}
            moveFrom={state.moveFrom}
            replaceSelected={state.replaceSelected}
            capturedCells={state.capturedCells}
            mainCellL={palette.mainCellL}
            outerCellL={palette.outerCellL}
            playerColor={palette.playerColor}
            aiColor={palette.aiColor}
          />
          <InstructionsPanel />
        </div>

        {/* Right: Turn controls + Actions + Palette */}
        <div className="flex flex-col gap-3">
          <GameControls
            gameStarted={state.gameStarted}
            gameOver={state.gameOver}
            currentPlayer={state.currentPlayer}
            putsLeft={state.putsLeft}
            movesLeft={state.movesLeft}
            replacesLeft={state.replacesLeft}
            activeAction={state.activeAction}
            score={score}
            winner={state.winner}
            message={state.message}
            onStartGame={handleStartGame}
            onEndGame={handleEndGame}
            onEndTurn={handleEndTurn}
            onSelectAction={handleSelectAction}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
