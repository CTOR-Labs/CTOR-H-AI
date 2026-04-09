import React, { useState, useCallback } from 'react';

export interface PaletteColors {
  mainCellL: number;
  outerCellL: number;
  playerColor: string;
  aiColor: string;
}

export const DEFAULT_PALETTE: PaletteColors = {
  mainCellL: 18,
  outerCellL: 12,
  playerColor: 'hsl(0, 0%, 10%)',
  aiColor: 'hsl(0, 0%, 90%)',
};

interface PalettePanelProps {
  palette: PaletteColors;
  onPaletteChange: (p: PaletteColors) => void;
}

const SPECTRUM_GRADIENT =
  'linear-gradient(to right, hsl(0,0%,100%), hsl(0,0%,50%), hsl(0,0%,0%), hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(270,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%))';

function sliderToColor(val: number): string {
  if (val <= 10) return `hsl(0, 0%, ${100 - val * 5}%)`;
  if (val <= 20) return `hsl(0, 0%, ${50 - (val - 10) * 5}%)`;
  const hue = ((val - 20) / 80) * 360;
  return `hsl(${Math.round(hue)}, 85%, 50%)`;
}

function colorToSlider(color: string): number {
  const m = color.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/);
  if (!m) return 50;
  const [, h, s, l] = m.map(Number);
  if (s < 10) {
    if (l >= 50) return Math.round((100 - l) / 5);
    return 10 + Math.round((50 - l) / 5);
  }
  return 20 + Math.round((h / 360) * 80);
}

const PalettePanel: React.FC<PalettePanelProps> = ({ palette, onPaletteChange }) => {
  const [local, setLocal] = useState<PaletteColors>(palette);

  const update = useCallback((partial: Partial<PaletteColors>) => {
    setLocal(prev => {
      const next = { ...prev, ...partial };
      onPaletteChange(next);
      return next;
    });
  }, [onPaletteChange]);

  return (
    <div className="flex flex-col gap-1 w-full flex-none font-mono text-[9px]">
      {/* Board Contrast — horizontal sliders */}
      <div className="bg-card rounded p-1.5 border border-border">
        <h3 className="text-primary font-bold text-[8px] tracking-widest uppercase mb-1">
          Board Contrast
        </h3>
        <div className="flex gap-1 items-center">
          <div className="flex-1 relative h-3">
            <div className="absolute inset-0 rounded" style={{ background: 'linear-gradient(to right, hsl(0,0%,100%), hsl(0,0%,0%))' }} />
            <input type="range" min={0} max={100} value={local.mainCellL}
              onChange={(e) => update({ mainCellL: Number(e.target.value) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" />
            <div className="absolute top-0 h-3 w-1 rounded bg-primary border border-primary-foreground pointer-events-none"
              style={{ left: `calc(${local.mainCellL}% - 2px)` }} />
          </div>
          <div className="w-3 h-3 rounded border border-border flex-none"
            style={{ backgroundColor: `hsl(200, 30%, ${100 - local.mainCellL}%)` }} />
          <div className="flex-1 relative h-3">
            <div className="absolute inset-0 rounded" style={{ background: 'linear-gradient(to right, hsl(0,0%,100%), hsl(0,0%,0%))' }} />
            <input type="range" min={0} max={100} value={local.outerCellL}
              onChange={(e) => update({ outerCellL: Number(e.target.value) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" />
            <div className="absolute top-0 h-3 w-1 rounded bg-primary border border-primary-foreground pointer-events-none"
              style={{ left: `calc(${local.outerCellL}% - 2px)` }} />
          </div>
          <div className="w-3 h-3 rounded border border-border flex-none"
            style={{ backgroundColor: `hsl(225, 15%, ${100 - local.outerCellL}%)` }} />
        </div>
      </div>

      {/* Piece Colors — horizontal sliders */}
      <div className="bg-card rounded p-1.5 border border-border">
        <h3 className="text-primary font-bold text-[8px] tracking-widest uppercase mb-1">
          Piece Colors
        </h3>
        <div className="flex gap-1 items-center mb-1">
          <div className="w-3 h-3 rounded-full border flex-none"
            style={{ backgroundColor: local.playerColor, borderColor: 'hsl(0,0%,30%)' }} />
          <div className="flex-1 relative h-3">
            <div className="absolute inset-0 rounded" style={{ background: SPECTRUM_GRADIENT }} />
            <input type="range" min={0} max={100} value={colorToSlider(local.playerColor)}
              onChange={(e) => update({ playerColor: sliderToColor(Number(e.target.value)) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" />
            <div className="absolute top-0 h-3 w-1 rounded border border-foreground pointer-events-none"
              style={{ left: `calc(${colorToSlider(local.playerColor)}% - 2px)`, backgroundColor: local.playerColor }} />
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full border flex-none"
            style={{ backgroundColor: local.aiColor, borderColor: 'hsl(0,0%,70%)' }} />
          <div className="flex-1 relative h-3">
            <div className="absolute inset-0 rounded" style={{ background: SPECTRUM_GRADIENT }} />
            <input type="range" min={0} max={100} value={colorToSlider(local.aiColor)}
              onChange={(e) => update({ aiColor: sliderToColor(Number(e.target.value)) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" />
            <div className="absolute top-0 h-3 w-1 rounded border border-foreground pointer-events-none"
              style={{ left: `calc(${colorToSlider(local.aiColor)}% - 2px)`, backgroundColor: local.aiColor }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalettePanel;
