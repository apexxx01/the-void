import React, { createElement } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function GlitchText({ text, className = "", as = "span" }: GlitchTextProps) {
  return createElement(
    as,
    {
      className: `glitch ${className}`,
      "data-text": text,
      "data-testid": `glitch-text-${text.substring(0, 10).replace(/\s+/g, '-')}`,
    },
    text
  );
}
