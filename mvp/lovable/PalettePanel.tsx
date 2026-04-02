import React from 'react';
import { Button } from '@/components/ui/button';
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
}

const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  gameOver,
  currentPlayer,
  putsLeft,
  movesLeft,
  replacesLeft,
  activeAction,
  winner,
  message,
  onEndTurn,
  onSelectAction,
}) => {
  const isPlayerTurn = currentPlayer === 1 && gameStarted && !gameOver;

  return (
    <div className="flex flex-col gap-3 w-[280px] max-w-[280px] flex-none font-mono">
      {/* Turn indicator */}
      <div className="bg-card border border-border rounded p-2 text-center text-xs tracking-widest uppercase text-muted-foreground">
        {!gameStarted ? 'Game not running' : gameOver ? 'Game over' : currentPlayer === 1 ? 'Your turn' : 'AI thinking...'}
      </div>

      {/* Turn counters */}
      <div className={`bg-card rounded p-4 border border-border ${!isPlayerTurn ? 'opacity-40 pointer-events-none' : ''}`}>
        <h3 className="text-primary font-bold text-xs tracking-widest uppercase mb-2">Your Turn</h3>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-foreground text-sm">Put</span>
            <span className="text-primary font-bold text-sm">{putsLeft}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground text-sm">Move</span>
            <span className="text-primary font-bold text-sm">{movesLeft}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground text-sm">Replace</span>
            <span className="text-primary font-bold text-sm">{replacesLeft}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={`bg-card rounded p-4 border border-border ${!isPlayerTurn ? 'opacity-40 pointer-events-none' : ''}`}>
        <h3 className="text-primary font-bold text-xs tracking-widest uppercase mb-2">Actions</h3>
        <div className="flex flex-col gap-2">
          <Button
            variant={activeAction === 'put' ? 'default' : 'outline'}
            disabled={putsLeft === 0}
            onClick={() => onSelectAction('put')}
            className="w-full text-xs tracking-wider"
          >
            [ Put ] Place piece
          </Button>
          <Button
            variant={activeAction === 'move' ? 'default' : 'outline'}
            disabled={movesLeft === 0}
            onClick={() => onSelectAction('move')}
            className="w-full text-xs tracking-wider"
          >
            [ Move ] Move piece
          </Button>
          <Button
            variant={activeAction === 'replace' ? 'default' : 'outline'}
            disabled={replacesLeft === 0}
            onClick={() => onSelectAction('replace')}
            className="w-full text-xs tracking-wider"
          >
            [ Replace ] Swap pieces
          </Button>
          <Button
            onClick={onEndTurn}
            disabled={!isPlayerTurn}
            variant="secondary"
            className="w-full text-xs tracking-wider"
          >
            ✓ End Turn
          </Button>
        </div>
      </div>

      {/* Status message */}
      <div className="bg-card rounded p-3 border border-border">
        <p className="text-muted-foreground text-xs">{message}</p>
      </div>

      {/* Game over */}
      {gameOver && (
        <div className="bg-primary/20 rounded p-4 border border-primary text-center">
          <h3 className="text-primary font-bold text-lg">
            {winner === 0 ? 'Draw!' : winner === 1 ? 'You win!' : 'Computer wins!'}
          </h3>
        </div>
      )}
    </div>
  );
};

export default GameControls;
