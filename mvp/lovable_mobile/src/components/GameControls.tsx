import React from 'react';
import { ActionType } from '@/lib/gameLogic';

interface GameControlsProps {
  gameStarted: boolean;
  gameOver: boolean;
  currentPlayer: 1 | 2;
  putsLeft: number;
  movesLeft: number;
  replacesLeft: number;
  activeAction: ActionType;
  score: { p1: number; p2: number };
  winner: 0 | 1 | 2 | null;
  message: string;
  onStartGame: () => void;
  onEndGame: () => void;
  onEndTurn: () => void;
  onSelectAction: (action: ActionType) => void;
  isMobile?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  gameOver,
  currentPlayer,
  putsLeft,
  movesLeft,
  replacesLeft,
  winner,
  message,
  isMobile = false,
}) => {
  const isPlayerTurn = currentPlayer === 1 && gameStarted && !gameOver;

  return (
    <div className="flex flex-col gap-1 w-full font-mono">
      {/* Turn indicator */}
      <div
        className={`bg-card border border-border rounded p-1 text-center tracking-widest uppercase ${
          isPlayerTurn
            ? 'text-primary font-bold animate-pulse border-primary/50'
            : 'text-muted-foreground'
        } ${isMobile ? 'text-xs py-2' : 'text-[7px]'}`}
      >
        {!gameStarted ? 'Not started' : gameOver ? 'Game over' : currentPlayer === 1 ? 'Your turn' : 'AI thinking...'}
      </div>

      {/* Status message */}
      {message && isPlayerTurn && (
        <div className={`bg-card border border-primary/40 rounded p-1 text-center text-primary font-semibold animate-pulse ${isMobile ? 'text-xs py-2' : 'text-[7px]'}`}>
          {message}
        </div>
      )}

      {/* Turn counters */}
      <div className={`bg-card rounded p-1.5 border border-border ${!isPlayerTurn ? 'opacity-40 pointer-events-none' : ''}`}>
        <h3 className={`text-primary font-bold tracking-widest uppercase mb-0.5 ${isMobile ? 'text-xs' : 'text-[7px]'}`}>Actions</h3>
        <div className={`flex ${isMobile ? 'flex-row gap-4' : 'flex-col gap-0.5'}`}>
          <div className="flex justify-between items-center gap-2">
            <span className={`text-foreground ${isMobile ? 'text-sm' : 'text-[8px]'}`}>Put</span>
            <span className={`text-primary font-bold ${isMobile ? 'text-sm' : 'text-[8px]'}`}>{putsLeft}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className={`text-foreground ${isMobile ? 'text-sm' : 'text-[8px]'}`}>Move</span>
            <span className={`text-primary font-bold ${isMobile ? 'text-sm' : 'text-[8px]'}`}>{movesLeft}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className={`text-foreground ${isMobile ? 'text-sm' : 'text-[8px]'}`}>Replace</span>
            <span className={`text-primary font-bold ${isMobile ? 'text-sm' : 'text-[8px]'}`}>{replacesLeft}</span>
          </div>
        </div>
      </div>

      {/* Game over */}
      {gameOver && (
        <div className="bg-primary/20 rounded p-1.5 border border-primary text-center">
          <h3 className={`text-primary font-bold ${isMobile ? 'text-base' : 'text-xs'}`}>
            {winner === 0 ? 'Draw!' : winner === 1 ? 'You win!' : 'AI wins!'}
          </h3>
        </div>
      )}
    </div>
  );
};

export default GameControls;
