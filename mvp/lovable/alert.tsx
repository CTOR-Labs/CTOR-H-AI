import React, { useState, useCallback } from 'react';

export interface PaletteColors {
  mainCellL: number;    // lightness 0-100 for main board cells
  outerCellL: number;   // lightness 0-100 for outer/mirror cells
  playerColor: string;  // HSL string for player pieces
  aiColor: string;      // HSL string for AI pieces
}

export const DEFAULT_PALETTE: PaletteColors = {
  mainCellL: 18,    // matches --board-cell: 200 30% 18%
  outerCellL: 12,   // matches --mirror-cell: 225 15% 12%
  playerColor: 'hsl(0, 0%, 10%)',
  aiColor: 'hsl(0, 0%, 90%)',
};

interface PalettePanelProps {
  palette: PaletteColors;
  onPaletteChange: (p: PaletteColors) => void;
}

/** Rainbow + grayscale stops for the color spectrum slider */
const SPECTRUM_GRADIENT =
  'linear-gradient(to right, hsl(0,0%,100%), hsl(0,0%,50%), hsl(0,0%,0%), hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(270,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%))';

/** Convert a slider position (0-100) to an HSL color string.
 *  0-30: grayscale (white→gray→black)
 *  30-100: rainbow hues */
function sliderToColor(val: number): string {
  if (val <= 10) return `hsl(0, 0%, ${100 - val * 5}%)`; // white→50% gray
  if (val <= 20) return `hsl(0, 0%, ${50 - (val - 10) * 5}%)`; // 50%→0% (black)
  // 20-100 maps to hue 0-360
  const hue = ((val - 20) / 80) * 360;
  return `hsl(${Math.round(hue)}, 85%, 50%)`;
}

/** Reverse: HSL string → slider value (approximate) */
function colorToSlider(color: string): number {
  const m = color.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/);
  if (!m) return 50;
  const [, h, s, l] = m.map(Number);
  if (s < 10) {
    // grayscale
    if (l >= 50) return Math.round((100 - l) / 5);
    return 10 + Math.round((50 - l) / 5);
  }
  return 20 + Math.round((h / 360) * 80);
}

const PalettePanel: React.FC<PalettePanelProps> = ({ palette, onPaletteChange }) => {
  // Local working copies (live preview)
  const [local, setLocal] = useState<PaletteColors>(palette);
  // Track confirmed state per block
  const [boardConfirmed, setBoardConfirmed] = useState(false);
  const [pieceConfirmed, setPieceConfirmed] = useState(false);

  // Propagate changes upward immediately for live preview
  const update = useCallback((partial: Partial<PaletteColors>) => {
    setLocal(prev => {
      const next = { ...prev, ...partial };
      onPaletteChange(next);
      return next;
    });
  }, [onPaletteChange]);

  return (
    <div className="flex flex-col gap-2 w-full flex-none font-mono text-[10px]">
      {/* Block 1: Board contrast */}
      <div className="bg-card rounded p-2 border border-border">
        <h3 className="text-primary font-bold text-[10px] tracking-widest uppercase mb-2">
          Board Contrast
        </h3>

        {/* Main cells slider */}
        <label className="text-foreground text-[9px] uppercase tracking-wider block mb-0.5">
          Main cells
        </label>
        <div className="relative h-4 mb-2">
          <div
            className="absolute inset-0 rounded"
            style={{ background: 'linear-gradient(to right, hsl(0,0%,100%), hsl(0,0%,0%))' }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={local.mainCellL}
            onChange={(e) => update({ mainCellL: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          {/* Thumb indicator */}
          <div
            className="absolute top-0 h-4 w-1 rounded bg-primary border border-primary-foreground pointer-events-none"
            style={{ left: `calc(${local.mainCellL}% - 2px)` }}
          />
        </div>
        <div
          className="h-3 rounded border border-border mb-1.5"
          style={{ backgroundColor: `hsl(200, 30%, ${100 - local.mainCellL}%)` }}
        />

        {/* Outer cells slider */}
        <label className="text-foreground text-[9px] uppercase tracking-wider block mb-0.5">
          Outer cells
        </label>
        <div className="relative h-4 mb-2">
          <div
            className="absolute inset-0 rounded"
            style={{ background: 'linear-gradient(to right, hsl(0,0%,100%), hsl(0,0%,0%))' }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={local.outerCellL}
            onChange={(e) => update({ outerCellL: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-0 h-4 w-1 rounded bg-primary border border-primary-foreground pointer-events-none"
            style={{ left: `calc(${local.outerCellL}% - 2px)` }}
          />
        </div>
        <div
          className="h-3 rounded border border-border mb-2"
          style={{ backgroundColor: `hsl(225, 15%, ${100 - local.outerCellL}%)` }}
        />

        <button
          onClick={() => setBoardConfirmed(true)}
          className="w-full text-[10px] tracking-wider bg-primary text-primary-foreground rounded px-2 py-1 hover:opacity-90 transition-opacity"
        >
          {boardConfirmed ? '✓ Confirmed' : 'Confirm (Board)'}
        </button>
      </div>

      {/* Block 2: Piece colors */}
      <div className="bg-card rounded p-2 border border-border">
        <h3 className="text-primary font-bold text-[10px] tracking-widest uppercase mb-2">
          Piece Colors
        </h3>

        {/* Player piece slider */}
        <label className="text-foreground text-[9px] uppercase tracking-wider block mb-0.5">
          Player piece
        </label>
        <div className="relative h-4 mb-1.5">
          <div
            className="absolute inset-0 rounded"
            style={{ background: SPECTRUM_GRADIENT }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={colorToSlider(local.playerColor)}
            onChange={(e) => update({ playerColor: sliderToColor(Number(e.target.value)) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-0 h-4 w-1 rounded border border-foreground pointer-events-none"
            style={{
              left: `calc(${colorToSlider(local.playerColor)}% - 2px)`,
              backgroundColor: local.playerColor,
            }}
          />
        </div>
        {/* Preview */}
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className="w-5 h-5 rounded-full border-2 shadow"
            style={{ backgroundColor: local.playerColor, borderColor: 'hsl(0,0%,30%)' }}
          />
          <span className="text-muted-foreground text-[9px]">Player</span>
        </div>

        {/* AI piece slider */}
        <label className="text-foreground text-[9px] uppercase tracking-wider block mb-0.5">
          AI piece
        </label>
        <div className="relative h-4 mb-1.5">
          <div
            className="absolute inset-0 rounded"
            style={{ background: SPECTRUM_GRADIENT }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={colorToSlider(local.aiColor)}
            onChange={(e) => update({ aiColor: sliderToColor(Number(e.target.value)) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-0 h-4 w-1 rounded border border-foreground pointer-events-none"
            style={{
              left: `calc(${colorToSlider(local.aiColor)}% - 2px)`,
              backgroundColor: local.aiColor,
            }}
          />
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className="w-5 h-5 rounded-full border-2 shadow"
            style={{ backgroundColor: local.aiColor, borderColor: 'hsl(0,0%,70%)' }}
          />
          <span className="text-muted-foreground text-[9px]">AI</span>
        </div>

        <button
          onClick={() => setPieceConfirmed(true)}
          className="w-full text-[10px] tracking-wider bg-primary text-primary-foreground rounded px-2 py-1 hover:opacity-90 transition-opacity"
        >
          {pieceConfirmed ? '✓ Confirmed' : 'Confirm (Pieces)'}
        </button>
      </div>
    </div>
  );
};

export default PalettePanel;
