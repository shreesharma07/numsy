import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

/** Accessible tabs (WAI-ARIA tabs pattern, automatic activation, arrow/Home/End keys). */
export function Tabs({
  items,
  label,
  defaultId,
}: {
  items: TabItem[];
  label: string;
  defaultId?: string;
}) {
  const base = useId();
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const next =
      e.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : e.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(items[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={label}>
        {items.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              className="tabs__tab"
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== active}
          className="tabs__panel"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
