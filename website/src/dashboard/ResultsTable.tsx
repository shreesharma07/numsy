import type { ViewResult } from '@numsy/engine';
import { useId } from 'react';
import { Badge, Button } from '../components/ui';

interface ResultsTableProps {
  view: ViewResult;
  search: string;
  onSearch: (value: string) => void;
  busy: boolean;
  allColumns: boolean;
  canShowAllColumns: boolean;
  onAllColumns: (value: boolean) => void;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}

const STATUS = {
  valid: { tone: 'ok', label: 'Valid' },
  invalid: { tone: 'bad', label: 'Invalid' },
  duplicate: { tone: 'amber', label: 'Duplicate' },
} as const;

const NUMERIC = new Set([
  'sanitizedPhone',
  'originalPhone',
  'phone',
  'number',
  'sanitized',
  'input',
]);

/**
 * One page of results with search, column mode and pagination
 */
export function ResultsTable({
  view,
  search,
  onSearch,
  busy,
  allColumns,
  canShowAllColumns,
  onAllColumns,
  onPage,
  onPageSize,
}: ResultsTableProps) {
  const searchId = useId();
  const sizeId = useId();
  const first = view.total ? (view.page - 1) * view.pageSize + 1 : 0;
  const last = Math.min(view.page * view.pageSize, view.total);

  return (
    <section className="results" aria-label="Rows">
      <div className="results__tools">
        <label className="results__search" htmlFor={searchId}>
          <span className="sr-only">Search rows</span>
          <input
            id={searchId}
            type="search"
            placeholder="Search names, numbers, reasons…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>
        {canShowAllColumns && (
          <label className="results__check">
            <input
              type="checkbox"
              checked={allColumns}
              onChange={(e) => onAllColumns(e.target.checked)}
            />
            Show all columns
          </label>
        )}
      </div>

      <div className={busy ? 'results__scroll is-busy' : 'results__scroll'}>
        {view.rows.length === 0 ? (
          <p className="results__empty">
            {search ? 'No rows match your search.' : 'No rows in this set.'}
          </p>
        ) : (
          <table className="results__table">
            <caption className="sr-only">
              Rows {first} to {last} of {view.total}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="results__n">
                  #
                </th>
                <th scope="col">Status</th>
                {view.columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.n} className={`is-${row.status}`}>
                  <td className="results__n">{row.n}</td>
                  <td>
                    <Badge tone={STATUS[row.status].tone}>{STATUS[row.status].label}</Badge>
                  </td>
                  {view.columns.map((column) => (
                    <td
                      key={column.key}
                      className={NUMERIC.has(column.key) ? 'results__mono' : undefined}
                    >
                      {row.cells[column.key] === '' ? (
                        <span className="muted">-</span>
                      ) : (
                        row.cells[column.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <nav className="results__pager" aria-label="Pages">
        <span className="results__range" aria-live="polite">
          {first.toLocaleString('en-IN')}–{last.toLocaleString('en-IN')} of{' '}
          {view.total.toLocaleString('en-IN')}
        </span>
        <label className="results__size" htmlFor={sizeId}>
          <span>Rows</span>
          <select
            id={sizeId}
            value={view.pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
          >
            {[25, 50, 100, 250, 500].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="results__pages">
          <Button
            size="sm"
            iconOnly
            icon="ph:caret-double-left-bold"
            disabled={view.page <= 1}
            onClick={() => onPage(1)}
          >
            First page
          </Button>
          <Button
            size="sm"
            iconOnly
            icon="ph:caret-left-bold"
            disabled={view.page <= 1}
            onClick={() => onPage(view.page - 1)}
          >
            Previous page
          </Button>
          <span className="results__page">
            {view.page} / {view.pages}
          </span>
          <Button
            size="sm"
            iconOnly
            icon="ph:caret-right-bold"
            disabled={view.page >= view.pages}
            onClick={() => onPage(view.page + 1)}
          >
            Next page
          </Button>
          <Button
            size="sm"
            iconOnly
            icon="ph:caret-double-right-bold"
            disabled={view.page >= view.pages}
            onClick={() => onPage(view.pages)}
          >
            Last page
          </Button>
        </div>
      </nav>
    </section>
  );
}
