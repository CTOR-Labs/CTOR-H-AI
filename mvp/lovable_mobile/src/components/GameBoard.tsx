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
  isMobile?: boolean;
}

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
  } catch {}
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
  isMobile = false,
}) => {
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());
  const prevCapturedRef = useRef<string>('');

  // On mobile: use vw-based sizing to fill screen width, ~30% larger than before
  // Desktop: keep 46px
  const cellSize = isMobile ? 36 : 46;
  const pieceSize = isMobile ? 26 : 32;

  useEffect(() => {
    const key = capturedCells.map(c => `${c.r},${c.c}`).join('|');
    if (key && key !== prevCapturedRef.current) {
      prevCapturedRef.current = key;
      const newSet = new Set(capturedCells.map(c => `${c.r},${c.c}`));
      setAnimatingCells(newSet);
      playSqueakSound();
      const timer = setTimeout(() => setAnimatingCells(new Set()), 450);
      return () => clearTimeout(timer);
    } else if (!key) {
      prevCapturedRef.current = '';
    }
  }, [capturedCells]);

  const isMainCell = (mr: number, mc: number) =>
    mr >= 1 && mr <= BOARD_SIZE && mc >= 1 && mc <= BOARD_SIZE;

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
    // Player 1: #2A4B8D, Player 2: #F5A623
    // Main field: original colors; Perimeter: light blue / light yellow
    const baseColor = isMain
      ? (value === 1 ? '#2A4B8D' : '#FF8C00')
      : (value === 1 ? '#A8D4F2' : '#FDCB6E');
    const borderColor = isMain
      ? (value === 1 ? '#1E3766' : '#E07000')
      : (value === 1 ? '#7EC0E8' : '#F0B749');
    return (
      <div
        className={`rounded-full ${isMain ? 'shadow-lg' : ''} ${isCapturing ? 'animate-capture' : ''}`}
        style={{
          width: pieceSize,
          height: pieceSize,
          backgroundColor: baseColor,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: borderColor,
          filter: undefined,
          boxShadow: isMain && !isCapturing
            ? value === 1
              ? '0 2px 8px rgba(42,75,141,0.5)'
              : '0 2px 8px rgba(245,166,35,0.4)'
            : undefined,
        }}
      />
    );
  };

  const isMoveSource = (r: number, c: number) =>
    moveFrom && moveFrom[0] === r && moveFrom[1] === c;

  const isReplaceSelected = (r: number, c: number) =>
    replaceSelected.some(([rr, cc]) => rr === r && cc === c);

  // Use vw-based sizing on mobile for full-width board
  const mobileGridSize = `calc((100vw - 8px) / ${TOTAL_SIZE})`;

  return (
    <div className="flex-shrink-0 overflow-hidden" style={{ padding: 0 }}>
      <div
        className="grid gap-0"
        style={isMobile ? {
          gridTemplateColumns: `repeat(${TOTAL_SIZE}, ${mobileGridSize})`,
          gridTemplateRows: `repeat(${TOTAL_SIZE}, ${mobileGridSize})`,
          width: '100%',
        } : {
          gridTemplateColumns: `repeat(${TOTAL_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${TOTAL_SIZE}, ${cellSize}px)`,
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

            // Exact HEX colors: perimeter #DCDDE5, center #C3D6DF
            const cellBg = isMain ? '#C3D6DF' : '#DCDDE5';
            const cellBorder = isMain ? '#8BA8B5' : '#B0B1B9';

            return (
              <div
                key={`${mr}-${mc}`}
                className={`flex items-center justify-center cursor-pointer transition-colors
                  ${highlighted ? 'ring-2 ring-accent ring-inset' : ''}
                `}
                style={{
                  ...(isMobile ? {} : { width: cellSize, height: cellSize }),
                  backgroundColor: isMoveTarget ? '#D4E8F0' : cellBg,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: cellBorder,
                  aspectRatio: isMobile ? '1' : undefined,
                }}
                onClick={() => {
                  if (isMain) onCellClick(boardR, boardC, true);
                }}
                onDragOver={(e) => { if (isMain) e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isMain) onDrop(boardR, boardC);
                }}
              >
                {isMoveTarget && value === 0 ? (
                  <div className="w-3 h-3 rounded-full bg-accent/40" />
                ) : null}
                {isMovable && value !== 0 ? (
                  <div className="relative flex items-center justify-center" style={{ width: pieceSize, height: pieceSize }}>
                    <div
                      draggable={activeAction === 'move' && board[boardR]?.[boardC] === 1}
                      onDragStart={() => onDragStart(boardR, boardC)}
                    >
                      {renderPiece(value, isMain, isCapturing)}
                    </div>
                    <div className="absolute inset-0 rounded-full ring-2 ring-accent/60 pointer-events-none" />
                  </div>
                ) : value !== 0 ? (
                  <div
                    className="flex items-center justify-center"
                    style={{ width: pieceSize, height: pieceSize }}
                    draggable={isMain && activeAction === 'move' && board[boardR]?.[boardC] === 1}
                    onDragStart={() => { if (isMain) onDragStart(boardR, boardC); }}
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
