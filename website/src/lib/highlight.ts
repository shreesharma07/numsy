/**
 * Tiny, dependency-free syntax tokenizer for the code samples on this site
 * (TypeScript, shell and JSON). Good enough for docs; not a general-purpose highlighter.
 */
export type TokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'keyword'
  | 'prompt'
  | 'number'
  | 'fn'
  | 'type'
  | 'prop'
  | 'cmd'
  | 'flag'
  | 'var'
  | 'op';
export interface Token {
  kind: TokenKind;
  text: string;
}
export type Lang = 'ts' | 'sh' | 'json' | 'text';

const TS_KEYWORDS = new Set(
  'import from export default const let var new await async return true false null undefined function type interface if else for of in throw try catch as typeof void'.split(
    ' ',
  ),
);
const JSON_KEYWORDS = new Set(['true', 'false', 'null']);

const IDENT = /^[A-Za-z_$][\w$]*/;
const NUMBER = /^-?\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?/i;
const TS_OP = /^(?:=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\.\.\.|[=+\-*/<>!?|&])/;
const SH_OP = /^(?:&&|\|\||[|;<>])/;

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
  /** shell: the next word is a command (start of line, after a pipe, && or ;) */
  let expectCmd = true;
  while (i < code.length) {
    const rest = code.slice(i);
    const prev = code[i - 1] ?? '';
    const take = (kind: TokenKind, text: string) => {
      push(kind, text);
      i += text.length;
      lineStart = false;
    };

    if (lang === 'sh' && lineStart && rest.startsWith('$ ')) {
      take('prompt', '$ ');
      expectCmd = true;
      continue;
    }
    const comment =
      lang === 'sh' ? /^#[^\n]*/.exec(rest) : lang === 'ts' ? /^\/\/[^\n]*/.exec(rest) : null;
    if (comment && (lang !== 'sh' || lineStart || /\s/.test(prev))) {
      take('comment', comment[0]);
      continue;
    }
    const str = /^(['"`])(?:\\.|(?!\1)[^\\\n])*\1/.exec(rest);
    if (str) {
      // JSON keys and quoted object keys read as properties
      const isKey = lang !== 'sh' && /^\s*:/.test(code.slice(i + str[0].length));
      take(isKey ? 'prop' : 'string', str[0]);
      expectCmd = false;
      continue;
    }

    if (lang === 'sh') {
      const v = /^\$(?:\{[^}\n]*\}|[A-Za-z_]\w*)/.exec(rest);
      if (v) {
        take('var', v[0]);
        continue;
      }
      const flag = /^--?[A-Za-z][\w-]*/.exec(rest);
      if (flag && (/\s/.test(prev) || prev === '')) {
        take('flag', flag[0]);
        continue;
      }
      const op = SH_OP.exec(rest);
      if (op) {
        take('op', op[0]);
        expectCmd = op[0] !== '>' && op[0] !== '<';
        continue;
      }
      const word = /^[A-Za-z_.][\w.\-/@]*/.exec(rest);
      if (word && (/\s/.test(prev) || prev === '')) {
        take(expectCmd ? 'cmd' : 'plain', word[0]);
        expectCmd = false;
        continue;
      }
    } else {
      const num = NUMBER.exec(rest);
      if (num && !/[\w$.]/.test(prev)) {
        take('number', num[0]);
        continue;
      }
      const id = IDENT.exec(rest);
      if (id && !/[\w$]/.test(prev)) {
        const word = id[0];
        const after = code.slice(i + word.length);
        const keywords = lang === 'json' ? JSON_KEYWORDS : TS_KEYWORDS;
        let kind: TokenKind = 'plain';
        if (keywords.has(word) && prev !== '.') kind = 'keyword';
        else if (lang === 'ts' && /^\s*\(/.test(after)) kind = 'fn';
        else if (lang === 'ts' && /^[A-Z]/.test(word)) kind = 'type';
        else if (lang === 'ts' && (prev === '.' || /^\??\s*:(?!:)/.test(after))) kind = 'prop';
        take(kind, word);
        continue;
      }
      const op = lang === 'ts' ? TS_OP.exec(rest) : null;
      if (op) {
        take('op', op[0]);
        continue;
      }
    }

    const ch = code[i];
    push('plain', ch);
    if (ch === '\n') {
      lineStart = true;
      // a trailing backslash continues the same shell command
      expectCmd = code[i - 1] !== '\\';
    } else if (!/\s/.test(ch)) {
      lineStart = false;
    }
    i += 1;
  }
  return out;
}

/** Splits a token stream into lines (tokens never span lines after this). */
export function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const t of tokens) {
    const parts = t.text.split('\n');
    parts.forEach((text, n) => {
      if (n > 0) lines.push([]);
      if (text) lines[lines.length - 1].push({ kind: t.kind, text });
    });
  }
  return lines;
}
