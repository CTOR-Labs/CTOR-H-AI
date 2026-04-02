import React from 'react';

const instructions = [
  {
    key: 'PUT',
    desc: (
      <>Click <strong>[Put]</strong> button, then <strong>left-click</strong> any empty cell to place your piece. Up to 2×.</>
    ),
  },
  {
    key: 'MOVE',
    desc: (
      <>Click <strong>[Move]</strong> button, then <strong>drag</strong> your piece to an adjacent empty cell. Up to 2×.</>
    ),
  },
  {
    key: 'REPLACE',
    desc: (
      <>Click <strong>[Replace]</strong> button, <strong>click 2 of your pieces</strong> to remove, then <strong>click empty cell</strong> for new piece. 1×.</>
    ),
  },
  {
    key: 'END TURN',
    desc: (
      <>Click <strong>[End Turn]</strong> to finish your turn and let the AI move.</>
    ),
  },
  {
    key: 'EATING',
    desc: (
      <>A piece is captured automatically if surrounded by <strong>5+</strong> enemy pieces in its 3×3 neighbourhood.</>
    ),
  },
];

const InstructionsPanel: React.FC = () => {
  return (
    <div className="w-full mt-3 bg-card border border-border rounded p-4 font-mono text-xs">
      <h3 className="text-primary font-bold text-sm tracking-widest uppercase mb-3">
        Mouse Controls
      </h3>
      <div className="flex flex-col gap-2">
        {instructions.map((item) => (
          <div key={item.key} className="flex gap-4">
            <span className="text-primary font-bold w-24 flex-shrink-0">{item.key}</span>
            <span className="text-muted-foreground">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructionsPanel;
