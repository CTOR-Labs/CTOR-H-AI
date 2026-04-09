import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameBoard from '@/components/GameBoard';
import GameControls from '@/components/GameControls';
import InstructionsPanel from '@/components/InstructionsPanel';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
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
  BOARD_SIZE,
  ActionType,
} from '@/lib/gameLogic';

const Index = () => {
  const [state, setState] = useState<GameState>(createInitialState());
  const [pendingPiece, setPendingPiece] = useState<[number, number] | null>(null);
  const [boardWidth, setBoardWidth] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setBoardWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    s.message = 'Your turn — click on the board';
    s.mirror = updateMirror(s.board);
    setState(s);
    setPendingPiece(null);
  };

  const handleEndGame = () => {
    setState(createInitialState());
    setPendingPiece(null);
  };

  const handleEndTurn = () => {
    setPendingPiece(null);
    setState(prev => ({
      ...prev,
      currentPlayer: 2 as const,
      message: 'Computer is thinking...',
      activeAction: null,
      moveFrom: null,
      replaceSelected: [],
      capturedCells: [],
    }));
  };

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
          message: over ? 'Game over!' : 'Your turn — click on the board',
          gameOver: over,
          winner: over ? winner : null,
          capturedCells: [],
        });
        setState(turnState);
        setPendingPiece(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.gameStarted, state.gameOver]);

  const handleCellClick = (r: number, c: number, _isMain: boolean) => {
    if (!state.gameStarted || state.gameOver || state.currentPlayer !== 1) return;

    const { board } = state;
    const cellValue = board[r][c];

    if (cellValue === 0) {
      if (pendingPiece !== null) {
        const [fr, fc] = pendingPiece;
        if (state.movesLeft <= 0) {
          setState(p => ({ ...p, message: 'No moves left this turn.' }));
          setPendingPiece(null);
          return;
        }
        const adj = getAdjacentEmpty(board, fr, fc);
        const isAdj = adj.some(([ar, ac]) => ar === r && ac === c);
        if (!isAdj) {
          setState(p => ({ ...p, message: 'Can only move to an adjacent cell. Try again.' }));
          setPendingPiece(null);
          return;
        }
        const newBoard = board.map(row => [...row]);
        newBoard[fr][fc] = 0;
        newBoard[r][c] = 1;
        const result = performEating(newBoard, 1);
        const capturedCells = result.captured.map(([cr, cc]) => ({ r: cr, c: cc, player: board[cr][cc] }));
        const movesLeft = state.movesLeft - 1;
        setPendingPiece(null);
        updateState({
          movesLeft,
          moveFrom: null,
          activeAction: 'move',
          message: movesLeft > 0 ? `Move done. ${movesLeft} move(s) left.` : 'Move done.',
          capturedCells,
          replaceSelected: [],
        }, result.board);
      } else {
        if (state.putsLeft <= 0) {
          setState(p => ({ ...p, message: 'No puts left this turn.' }));
          return;
        }
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = 1;
        const result = performEating(newBoard, 1);
        const capturedCells = result.captured.map(([cr, cc]) => ({ r: cr, c: cc, player: board[cr][cc] }));
        const putsLeft = state.putsLeft - 1;
        updateState({
          putsLeft,
          activeAction: 'put',
          message: putsLeft > 0 ? `Put done. ${putsLeft} put(s) left.` : 'Put done.',
          capturedCells,
          replaceSelected: [],
        }, result.board);
      }
    } else if (cellValue === 1) {
      if (pendingPiece !== null) {
        const [fr, fc] = pendingPiece;
        if (fr === r && fc === c) {
          setPendingPiece(null);
          setState(p => ({ ...p, message: 'Deselected. Click on the board.', replaceSelected: [], moveFrom: null }));
          return;
        }
        if (state.replacesLeft <= 0) {
          setState(p => ({ ...p, message: 'No replaces left this turn.' }));
          setPendingPiece(null);
          return;
        }
        setState(p => ({
          ...p,
          activeAction: 'replace',
          replaceSelected: [[fr, fc], [r, c]],
          message: 'Now click on an empty cell to place the new piece.',
        }));
        setPendingPiece(null);
      } else {
        setPendingPiece([r, c]);
        setState(p => ({
          ...p,
          moveFrom: [r, c],
          replaceSelected: [],
          message: 'Piece selected. Click empty cell to move, or another piece to replace.',
        }));
      }
    } else {
      setState(p => ({ ...p, message: 'That is an opponent piece.' }));
    }
  };

  const handleCellClickWrapper = (r: number, c: number, isMain: boolean) => {
    const { replaceSelected, board } = state;
    if (replaceSelected.length === 2 && board[r][c] === 0) {
      const newBoard = board.map(row => [...row]);
      for (const [rr, cc] of replaceSelected) {
        newBoard[rr][cc] = 0;
      }
      newBoard[r][c] = 1;
      const result = performEating(newBoard, 1);
      const capturedCells = result.captured.map(([cr, cc]) => ({ r: cr, c: cc, player: board[cr][cc] }));
      setPendingPiece(null);
      updateState({
        replacesLeft: 0,
        replaceSelected: [],
        activeAction: null,
        moveFrom: null,
        message: 'Replace done.',
        capturedCells,
      }, result.board);
      return;
    }
    handleCellClick(r, c, isMain);
  };

  const handleDragStart = (r: number, c: number) => {
    if (state.board[r][c] === 1 && state.movesLeft > 0) {
      setPendingPiece([r, c]);
      setState(p => ({ ...p, moveFrom: [r, c] }));
    }
  };

  const handleDrop = (r: number, c: number) => {
    if (pendingPiece) {
      handleCellClickWrapper(r, c, true);
    }
  };

  const handleSelectAction = (action: ActionType) => {};

  const score = countPieces(state.board);
  const isPlayerTurn = state.currentPlayer === 1 && state.gameStarted && !state.gameOver;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-0 px-1 font-mono">
      {/* Main layout: vertical on mobile, horizontal on desktop */}
      <div className={`flex w-full max-w-6xl ${isMobile ? 'flex-col items-center gap-2 px-1' : 'flex-row items-start justify-center gap-0'}`}>
        {/* Game board */}
        <div className="flex flex-col items-center" id="board-column" ref={boardRef}>
          <GameBoard
            mirror={state.mirror}
            board={state.board}
            onCellClick={handleCellClickWrapper}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            activeAction={state.activeAction}
            moveFrom={state.moveFrom}
            replaceSelected={state.replaceSelected}
            capturedCells={state.capturedCells}
            isMobile={isMobile}
          />
        </div>

        {/* Controls: below board on mobile, right side on desktop */}
        <div className={`flex flex-col font-mono ${isMobile ? 'w-full gap-2 px-1' : 'gap-1.5 w-[156px] flex-none pl-0'}`}>
          {/* Game controls */}
          <div className="bg-card rounded p-2 border border-border">
            <h3 className={`text-primary font-bold tracking-widest uppercase mb-1 ${isMobile ? 'text-xs' : 'text-[9px]'}`}>Game</h3>
            <div className={`flex ${isMobile ? 'flex-row gap-2' : 'flex-col gap-1'}`}>
              <button
                onClick={handleStartGame}
                disabled={state.gameStarted && !state.gameOver}
                className={`tracking-wider bg-primary text-primary-foreground rounded disabled:opacity-50 hover:opacity-90 transition-opacity ${isMobile ? 'flex-1 text-sm px-3 py-2.5' : 'w-full text-[9px] px-1.5 py-1'}`}
              >
                ▶ Start
              </button>
              <button
                onClick={handleEndGame}
                disabled={!state.gameStarted}
                className={`tracking-wider bg-destructive text-destructive-foreground rounded disabled:opacity-50 hover:opacity-90 transition-opacity ${isMobile ? 'flex-1 text-sm px-3 py-2.5' : 'w-full text-[9px] px-1.5 py-1'}`}
              >
                ■ End
              </button>
              <button
                onClick={handleEndTurn}
                disabled={!isPlayerTurn}
                className={`tracking-wider bg-secondary text-secondary-foreground rounded disabled:opacity-50 hover:opacity-90 transition-opacity ${isMobile ? 'flex-1 text-sm px-3 py-2.5' : 'w-full text-[9px] px-1.5 py-1'}`}
              >
                ✓ End Turn
              </button>
            </div>
          </div>

          {/* Score */}
          <div className="bg-card rounded p-2 border border-border">
            <h3 className={`text-primary font-bold tracking-widest uppercase mb-1 ${isMobile ? 'text-xs' : 'text-[9px]'}`}>Score</h3>
            <div className={`flex ${isMobile ? 'flex-row gap-4' : 'flex-col gap-1'}`}>
              <div className="flex justify-between items-center gap-2">
                <span className={`text-foreground ${isMobile ? 'text-sm' : 'text-[9px]'}`}>You</span>
                <span className={`text-primary font-bold ${isMobile ? 'text-sm' : 'text-[9px]'}`}>{score.p1}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className={`text-foreground ${isMobile ? 'text-sm' : 'text-[9px]'}`}>AI</span>
                <span className={`text-primary font-bold ${isMobile ? 'text-sm' : 'text-[9px]'}`}>{score.p2}</span>
              </div>
            </div>
          </div>

          {/* Turn controls */}
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
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Instructions below board */}
      <div className="flex justify-center w-full max-w-6xl">
        <div style={{ width: isMobile ? '100%' : (boardWidth || 480) }} className={isMobile ? 'px-1' : ''}>
          <InstructionsPanel isMobile={isMobile} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
