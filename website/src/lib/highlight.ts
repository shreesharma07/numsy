/**
 * Tiny, dependency-free syntax tokenizer for the code samples on this site
 * (TypeScript and shell). Good enough for docs; not a general-purpose highlighter.
 */
export type TokenKind = 'plain' | 'comment' | 'string' | 'keyword' | 'prompt';
export interface Token {
  kind: TokenKind;
  text: string;
}
export type Lang = 'ts' | 'sh' | 'json' | 'text';

const TS_KEYWORDS =
  /^(?:import|from|export|const|let|new|await|async|return|true|false|null|undefined|function|type|interface)\b/;

export function tokenize(code: string, lang: Lang): Token[] {
  if (lang === 'text') return [{ kind: 'plain', text: code }];
  const out: Token[] = [];
  const push = (kind: TokenKind, text: string) => {
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ kind, text });
  };
  let i = 0;
  let lineStart = true;
  while (i < code.length) {
    const rest = code.slice(i);
    if (lang === 'sh' && lineStart && rest.startsWith('$ ')) {
      push('prompt', '$ ');
      i += 2;
      lineStart = false;
      continue;
    }
    const comment = lang === 'sh' ? /^#[^\n]*/.exec(rest) : /^\/\/[^\n]*/.exec(rest);
    if (comment && (lang !== 'sh' || lineStart || /\s$/.test(code.slice(0, i)))) {
      push('comment', comment[0]);
      i += comment[0].length;
      continue;
    }
    const str = /^(['"`])(?:\\.|(?!\1)[^\\\n])*\1/.exec(rest);
    if (str) {
      push('string', str[0]);
      i += str[0].length;
      lineStart = false;
      continue;
    }
    if (lang === 'ts' && /^[A-Za-z_]/.test(rest) && !/[\w$.]/.test(code[i - 1] ?? '')) {
      const kw = TS_KEYWORDS.exec(rest);
      if (kw) {
        push('keyword', kw[0]);
        i += kw[0].length;
        lineStart = false;
        continue;
      }
    }
    const ch = code[i];
    push('plain', ch);
    lineStart = ch === '\n' ? true : lineStart && /\s/.test(ch);
    i += 1;
  }
  return out;
}
