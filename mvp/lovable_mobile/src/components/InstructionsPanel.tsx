import React from 'react';

const instructions = [
  {
    key: 'PUT',
    desc: 'Click on any empty cell of the main board to place your piece (up to 2 per turn).',
  },
  {
    key: 'MOVE',
    desc: 'Click your piece, then click an adjacent empty cell on the main board horizontally or vertically (up to 2 per turn).',
  },
  {
    key: 'REPLACE',
    desc: 'Click two of your pieces to remove them, then click an empty cell on the main board to place a new piece (once per turn).',
  },
  {
    key: 'EATING',
    desc: 'A piece is captured automatically if surrounded by 5+ enemy pieces in its 3×3 neighbourhood.',
  },
];

interface InstructionsPanelProps {
  isMobile?: boolean;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ isMobile = false }) => {
  const textSize = isMobile ? 'text-xs' : 'text-[9px]';
  const headingSize = isMobile ? 'text-sm' : 'text-[10px]';

  return (
    <div className="flex flex-col gap-3 w-full mt-2">
      <div className="bg-card border border-border rounded p-3 font-mono">
        <h3 className={`text-primary font-bold ${headingSize} tracking-widest uppercase mb-2`}>
          Mouse Controls
        </h3>
        <div className="flex flex-col gap-1.5">
          {instructions.map((item) => (
            <div key={item.key} className="flex gap-3">
              <span className={`text-primary font-bold w-16 flex-shrink-0 ${textSize}`}>{item.key}</span>
              <span className={`text-muted-foreground ${textSize} leading-tight`}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded p-3 font-mono">
        <h3 className={`text-primary font-bold ${headingSize} tracking-widest uppercase mb-2`}>
          Basic Rules
        </h3>
        <div className={`flex flex-col gap-3 text-muted-foreground ${textSize} leading-tight`}>
          <p>
            <strong className="text-foreground">Board</strong> — consists of a main field (highlighted in the center) and an outer field. All player actions take place on the main field. The outer cells are filled automatically by the computer, mirroring the main field pieces to show how the sides connect on a 3D torus surface.
          </p>
          <div>
            <p className="mb-1">Playing field (torus layout):</p>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded"
                src="https://www.youtube.com/embed/c2oIiGGng3I"
                title="Playing field (torus layout)"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            </div>
          </div>
          <p>
            <strong className="text-foreground">Player turn</strong> — perform any combination of Put, Move, and Replace actions in any order, or skip any of them.
          </p>
          <p>
            <strong className="text-foreground">Auto-capture</strong> — after each action, the computer finds any opponent piece surrounded by 5 or more of the current player's pieces and replaces it. There is no limit on captures per turn.
          </p>
          <div>
            <p className="mb-1">Rules:</p>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded"
                src="https://www.youtube.com/embed/5wl9Fhs6gRU"
                title="Rules"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPanel;
