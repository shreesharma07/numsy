import type { TableColumn, TableRow } from '../../types';
import './Table.css';

const labelOf = (c: TableColumn) => (typeof c.header === 'string' ? c.header : c.key);

export interface TableProps {
  caption?: string;
  columns: TableColumn[];
  rows: TableRow[];
  /** Stable key per row (defaults to index + first column text) */
  rowKey?: (row: TableRow, index: number) => string;
  className?: string;
  /** Scroll region max height (e.g. playground results) */
  maxHeight?: number;
  /** On phones, render each row as a stacked card with inline labels (default true) */
  stack?: boolean;
}

export function Table({
  caption,
  columns,
  rows,
  rowKey,
  className,
  maxHeight,
  stack = true,
}: TableProps) {
  const keyOf =
    rowKey ?? ((row: TableRow, i: number) => `${i}-${String(row[columns[0].key] ?? '')}`);
  // A labelled <section> is a region landmark; tabIndex lets keyboard users scroll wide tables (WCAG 2.1.1).
  return (
    <section
      className={['table-wrap', stack && 'table-wrap--stack', className].filter(Boolean).join(' ')}
      aria-label={caption ?? 'Table'}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard-focusable
      tabIndex={0}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" style={c.width ? { width: c.width } : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={keyOf(row, i)}>
              {columns.map((c) =>
                c.rowHeader ? (
                  <th key={c.key} scope="row" data-label={labelOf(c)}>
                    {row[c.key]}
                  </th>
                ) : (
                  <td key={c.key} data-label={labelOf(c)}>
                    {row[c.key]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
