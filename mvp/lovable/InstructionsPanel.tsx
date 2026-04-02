import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-8 py-4 text-center font-mono text-xs text-muted-foreground border-t border-border">
      <p>
        Official CTOR Game site:{' '}
        <a
          href="https://ctorgame.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          https://ctorgame.com/
        </a>
      </p>
      <p className="mt-1">
        AI Development:{' '}
        <a
          href="https://github.com/CTOR-Labs/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          https://github.com/CTOR-Labs/
        </a>
      </p>
    </footer>
  );
};

export default Footer;
