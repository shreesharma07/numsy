import type { NumberStyle, Settings } from '@numsy/engine';
import { useEffect, useId, useState } from 'react';
import type { LoadedSource } from './runtime';

interface SettingsPanelProps {
  settings: Settings;
  source: LoadedSource | null;
  /** Columns the analysis actually used */
  detected: { phone: string | null; name: string | null } | null;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onReset: () => void;
}

interface Choice<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

function Segmented<T extends string>({
  legend,
  name,
  value,
  choices,
  onChange,
  help,
}: {
  legend: string;
  name: string;
  value: T;
  choices: Choice<T>[];
  onChange: (value: T) => void;
  help?: string;
}) {
  const helpId = useId();
  return (
    <fieldset className="opt" aria-describedby={help ? helpId : undefined}>
      <legend className="opt__legend">{legend}</legend>
      <div className="opt__seg">
        {choices.map((choice) => (
          <label
            key={choice.value}
            className={value === choice.value ? 'is-on' : undefined}
            title={choice.hint}
          >
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            {choice.label}
          </label>
        ))}
      </div>
      {help && (
        <p id={helpId} className="opt__help">
          {help}
        </p>
      )}
    </fieldset>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  help?: string;
}) {
  const helpId = useId();
  return (
    <div className="opt opt--toggle">
      <label className="toggle">
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={help ? helpId : undefined}
        />
        <span className="toggle__track" aria-hidden="true" />
        <span>{label}</span>
      </label>
      {help && (
        <p id={helpId} className="opt__help">
          {help}
        </p>
      )}
    </div>
  );
}

const STYLES: Choice<NumberStyle>[] = [
  { value: 'plain', label: '98765…', hint: '9876501234' },
  { value: 'e164', label: '+91…', hint: '+919876501234' },
  { value: 'spaced', label: '+91 ·', hint: '+91 98765 01234' },
];

/**
 * Filters (columns, duplicates, rules) and output settings (style, header, columns, row cap)
 */
export function SettingsPanel({
  settings,
  source,
  detected,
  onChange,
  onReset,
}: SettingsPanelProps) {
  const phoneId = useId();
  const nameId = useId();
  const headerId = useId();
  const maxId = useId();
  const columns = source?.kind === 'file' ? source.columns : [];
  // Open on desktop; collapsed on narrow screens so results follow the input directly
  const [open, setOpen] = useState(true);
  useEffect(() => {
    setOpen(!window.matchMedia?.('(max-width: 960px)').matches);
  }, []);

  return (
    <details
      className="dash__panel settings"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="dash__panel-head settings__summary">
        <h2 className="label">Settings</h2>
        <span className="settings__chevron" aria-hidden="true" />
      </summary>
      <button type="button" className="dash__link settings__reset" onClick={onReset}>
        Reset to defaults
      </button>

      {columns.length > 0 && (
        <div className="settings__group">
          <h3 className="settings__title">Columns</h3>
          <label className="opt" htmlFor={phoneId}>
            <span className="opt__legend">Phone column</span>
            <select
              id={phoneId}
              value={settings.phoneColumn}
              onChange={(e) => onChange('phoneColumn', e.target.value)}
            >
              <option value="">
                Auto-detect{source?.detected.phoneColumn ? ` (${source.detected.phoneColumn})` : ''}
              </option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="opt" htmlFor={nameId}>
            <span className="opt__legend">Name column</span>
            <select
              id={nameId}
              value={settings.nameColumn}
              onChange={(e) => onChange('nameColumn', e.target.value)}
            >
              <option value="">
                Auto-detect{source?.detected.nameColumn ? ` (${source.detected.nameColumn})` : ''}
              </option>
              <option value="none">No name column</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          {detected?.phone && (
            <p className="opt__help">
              Using <strong>{detected.phone}</strong>
              {detected.name ? (
                <>
                  {' '}
                  and <strong>{detected.name}</strong>
                </>
              ) : null}
              .
            </p>
          )}
        </div>
      )}

      <div className="settings__group">
        <h3 className="settings__title">Filters</h3>
        <Segmented
          legend="Duplicates"
          name="dedupe"
          value={settings.dedupe}
          onChange={(v) => onChange('dedupe', v)}
          choices={[
            { value: 'off', label: 'Keep all' },
            { value: 'first', label: 'Keep first' },
            { value: 'last', label: 'Keep last' },
          ]}
          help={
            settings.dedupe === 'off'
              ? 'Repeats stay in the results and are listed under Duplicates.'
              : `Repeats are removed, keeping the ${settings.dedupe} occurrence of each number.`
          }
        />
        <Toggle
          label="Reject dummy numbers"
          checked={settings.strict}
          onChange={(v) => onChange('strict', v)}
          help="Rejects patterns like 9999999999 and 1234567890. Off checks the shape only."
        />
        {source?.kind !== 'text' && (
          <>
            <Toggle
              label="Only the first number per cell"
              checked={settings.multiple === 'first'}
              onChange={(v) => onChange('multiple', v ? 'first' : 'all')}
              help="Off gives one row per number when a cell holds several."
            />
            <Toggle
              label="Skip empty phone cells"
              checked={settings.skipEmpty}
              onChange={(v) => onChange('skipEmpty', v)}
              help="Leave rows without a number out of the invalid set."
            />
          </>
        )}
      </div>

      <div className="settings__group">
        <h3 className="settings__title">Output</h3>
        <Segmented
          legend="Number style"
          name="style"
          value={settings.numberStyle}
          onChange={(v) => onChange('numberStyle', v)}
          choices={STYLES}
          help={STYLES.find((s) => s.value === settings.numberStyle)?.hint}
        />
        <Segmented
          legend="Columns"
          name="columns"
          value={settings.columns}
          onChange={(v) => onChange('columns', v)}
          choices={[
            { value: 'full', label: 'All columns' },
            { value: 'numbers', label: 'Name + number' },
          ]}
        />
        <label className="opt" htmlFor={headerId}>
          <span className="opt__legend">Number column header</span>
          <input
            id={headerId}
            type="text"
            maxLength={60}
            placeholder="Default (sanitizedPhone)"
            value={settings.numberHeader}
            onChange={(e) => onChange('numberHeader', e.target.value)}
          />
        </label>
        <Toggle
          label="Include header row"
          checked={settings.header}
          onChange={(v) => onChange('header', v)}
          help="Applies to CSV and Excel exports."
        />
        <label className="opt" htmlFor={maxId}>
          <span className="opt__legend">Max rows to export</span>
          <input
            id={maxId}
            type="number"
            min={0}
            step={100}
            inputMode="numeric"
            value={settings.maxRows || ''}
            placeholder="All rows"
            onChange={(e) =>
              onChange('maxRows', Math.max(0, Math.floor(Number(e.target.value) || 0)))
            }
          />
        </label>
      </div>
    </details>
  );
}
