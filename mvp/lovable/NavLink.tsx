import React, { useMemo, useState, useEffect, useRef } from 'react';
import { CellValue, BOARD_SIZE, TOTAL_SIZE, getAdjacentEmpty } from '@/lib/gameLogic';

interface GameBoardProps {
  mirror: CellValue[][];
  board: CellValue[][];
  onCellClick: (r: number, c: number, isMain: boolean) => void;
  onDragStart: (r: number, c: number) => void;
  onDrop: (r: number, c: number) => void;
  activeAction: string | null;
  moveFrom: [number, number] | null;
  replaceSelected: [number, number][];
  capturedCells: { r: number; c: number; player: CellValue }[];
  /** Dynamic board cell lightness (0-100, higher = darker via 100-val formula) */
  mainCellL?: number;
  outerCellL?: number;
  /** Dynamic piece colors as HSL strings */
  playerColor?: string;
  aiColor?: string;
}

// Generate a short squeak sound using Web Audio API
function playSqueakSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Audio not available
  }
}

const GameBoard: React.FC<GameBoardProps> = ({
  mirror,
  board,
  onCellClick,
  onDragStart,
  onDrop,
  activeAction,
  moveFrom,
  replaceSelected,
  capturedCells,
  mainCellL,
  outerCellL,
  playerColor,
  aiColor,
}) => {
  // Track cells currently animating capture
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());
  const prevCapturedRef = useRef<string>('');

  useEffect(() => {
    const key = capturedCells.map(c => `${c.r},${c.c}`).join('|');
    if (key && key !== prevCapturedRef.current) {
      prevCapturedRef.current = key;
      const newSet = new Set(capturedCells.map(c => `${c.r},${c.c}`));
      setAnimatingCells(newSet);
      playSqueakSound();
      // Clear after animation
      const timer = setTimeout(() => setAnimatingCells(new Set()), 450);
      return () => clearTimeout(timer);
    } else if (!key) {
      prevCapturedRef.current = '';
    }
  }, [capturedCells]);

  const isMainCell = (mr: number, mc: number) => {
    return mr >= 1 && mr <= BOARD_SIZE && mc >= 1 && mc <= BOARD_SIZE;
  };

  const moveTargets = useMemo(() => {
    if (activeAction !== 'move' || !moveFrom) return new Set<string>();
    const adj = getAdjacentEmpty(board, moveFrom[0], moveFrom[1]);
    return new Set(adj.map(([r, c]) => `${r},${c}`));
  }, [activeAction, moveFrom, board]);

  const movablePieces = useMemo(() => {
    if (activeAction !== 'move' || moveFrom) return new Set<string>();
    const set = new Set<string>();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === 1 && getAdjacentEmpty(board, r, c).length > 0) {
          set.add(`${r},${c}`);
        }
      }
    }
    return set;
  }, [activeAction, moveFrom, board]);

  const renderPiece = (value: CellValue, isMain: boolean, isCapturing: boolean) => {
    if (value === 0) return null;
    // Use dynamic colors if provided, otherwise fall back to CSS classes
    const useDynamic = (value === 1 && playerColor) || (value === 2 && aiColor);
    const dynamicBg = value === 1 ? playerColor : aiColor;
    const colorClass = useDynamic
      ? ''
      : value === 1
        ? 'bg-piece-black border-piece-black-border'
        : 'bg-piece-white border-piece-white-border';
    return (
      <div
        className={`w-8 h-8 rounded-full border-2 ${colorClass} ${
          isMain ? 'shadow-lg' : 'opacity-90'
        } ${isCapturing ? 'animate-capture' : ''}`}
        style={{
          ...(useDynamic ? { backgroundColor: dynamicBg, borderColor: 'hsla(0,0%,50%,0.5)' } : {}),
          ...(isMain && !isCapturing ? { boxShadow: value === 1 ? '0 2px 8px rgba(0,0,0,0.6)' : '0 2px 8px rgba(255,255,255,0.3)' } : {}),
        }}
      />
    );
  };

  const isMoveSource = (r: number, c: number) =>
    moveFrom && moveFrom[0] === r && moveFrom[1] === c;

  const isReplaceSelected = (r: number, c: number) =>
    replaceSelected.some(([rr, cc]) => rr === r && cc === c);

  return (
    <div className="flex-shrink-0 p-2 bg-board-bg rounded border-2 border-board-border-outer shadow-2xl">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${TOTAL_SIZE}, 46px)`,
          gridTemplateRows: `repeat(${TOTAL_SIZE}, 46px)`,
        }}
      >
        {Array.from({ length: TOTAL_SIZE }).map((_, mr) =>
          Array.from({ length: TOTAL_SIZE }).map((_, mc) => {
            const isMain = isMainCell(mr, mc);
            const value = mirror[mr][mc];
            const boardR = mr - 1;
            const boardC = mc - 1;
            const highlighted = isMain && (isMoveSource(boardR, boardC) || isReplaceSelected(boardR, boardC));
            const isMoveTarget = isMain && moveTargets.has(`${boardR},${boardC}`);
            const isMovable = isMain && movablePieces.has(`${boardR},${boardC}`);
            const isCapturing = isMain && animatingCells.has(`${boardR},${boardC}`);

            // Dynamic cell background colors
            const cellStyle: React.CSSProperties = {};
            if (isMain && mainCellL !== undefined) {
              cellStyle.backgroundColor = `hsl(200, 30%, ${100 - mainCellL}%)`;
            }
            if (!isMain && outerCellL !== undefined) {
              cellStyle.backgroundColor = `hsl(225, 15%, ${100 - outerCellL}%)`;
            }

            return (
              <div
                key={`${mr}-${mc}`}
                className={`
                  w-[46px] h-[46px] flex items-center justify-center border cursor-pointer transition-colors
                  ${isMain
                    ? `bg-board-cell border-board-border hover:bg-board-cell-hover`
                    : `bg-mirror-cell border-mirror-border`
                  }
                  ${highlighted ? 'ring-2 ring-accent ring-inset' : ''}
                  ${isMoveTarget ? 'bg-board-cell-hover' : ''}
                `}
                style={cellStyle}
                onClick={() => {
                  if (isMain) {
                    onCellClick(boardR, boardC, true);
                  }
                }}
                onDragOver={(e) => {
                  if (isMain) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isMain) onDrop(boardR, boardC);
                }}
              >
                {isMoveTarget && value === 0 ? (
                  <div className="w-3 h-3 rounded-full bg-accent/40" />
                ) : null}
                {isMovable && value !== 0 ? (
                  <div className="relative">
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      draggable={activeAction === 'move' && board[boardR]?.[boardC] === 1}
                      onDragStart={() => onDragStart(boardR, boardC)}
                    >
                      {renderPiece(value, isMain, isCapturing)}
                    </div>
                    <div className="absolute inset-0 rounded-full ring-2 ring-accent/60 pointer-events-none" />
                  </div>
                ) : value !== 0 ? (
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    draggable={isMain && activeAction === 'move' && board[boardR]?.[boardC] === 1}
                    onDragStart={() => {
                      if (isMain) onDragStart(boardR, boardC);
                    }}
                  >
                    {renderPiece(value, isMain, isCapturing)}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;
