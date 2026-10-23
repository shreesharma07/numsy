import { Fragment } from 'react';

/**
 * Renders the tiny markup used in content/*.ts strings: `inline code` and **bold**.
 * Content stays plain data; no HTML injection.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        const key = `${i}-${part}`;
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={key}>{part.slice(1, -1)}</code>;
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={key}>{part.slice(2, -2)}</strong>;
        return <Fragment key={key}>{part}</Fragment>;
      })}
    </>
  );
}
