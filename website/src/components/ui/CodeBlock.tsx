import { type Lang, toLines, tokenize } from '../../lib/highlight';
import { CopyButton } from './CopyButton';
import './CodeBlock.css';

export interface CodeBlockProps {
  code: string;
  lang?: Lang;
  /** Header label, e.g. "Shell" or a filename */
  label?: string;
  copy?: boolean;
  /** Text to copy when it should differ from what is shown (e.g. without "$ " prompts) */
  copyText?: string;
  className?: string;
}

export function CodeBlock({
  code,
  lang = 'ts',
  label,
  copy = true,
  copyText,
  className,
}: CodeBlockProps) {
  const lines = toLines(tokenize(code, lang));
  const toCopy = copyText ?? (lang === 'sh' ? code.replace(/^\$ /gm, '') : code);
  return (
    <div className={className ? `code ${className}` : 'code'}>
      {(label || copy) && (
        <div className="code__head">
          <span className="label code__label">{label ?? lang}</span>
          {copy && <CopyButton text={toCopy} />}
        </div>
      )}
      <pre className="code__pre">
        <code>
          {/* one block per line: long lines wrap with a hanging indent instead of scrolling */}
          {lines.map((line, n) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lines are a static, ordered list
            <span key={n} className="code__line">
              {line.length === 0
                ? '\n'
                : line.map((t, i) =>
                    t.kind === 'plain' ? (
                      t.text
                    ) : (
                      // biome-ignore lint/suspicious/noArrayIndexKey: tokens are a static, ordered list
                      <span key={i} className={`tok-${t.kind}`}>
                        {t.text}
                      </span>
                    ),
                  )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
