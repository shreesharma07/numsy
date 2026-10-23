/**
 * Processing settings shared by the dashboard UI, the website and the REST API.
 * One plain, JSON-safe object that maps onto AnalyzeOptions + DatasetOptions.
 */

import { AnalyzeOptions, DedupeMode } from '../common/interfaces';
import { DatasetOptions, OutputOptions, ROW_SETS, RowSet } from './dataset';
import { NUMBER_STYLES, NumberStyle } from './rules';

export interface Settings {
  /** Phone column; empty string = auto-detect */
  phoneColumn: string;
  /** Name column; empty string = auto-detect, "none" = no name column */
  nameColumn: string;
  dedupe: DedupeMode;
  strict: boolean;
  multiple: 'all' | 'first';
  skipEmpty: boolean;
  numberStyle: NumberStyle;
  /** Rows to export */
  only: RowSet;
  /** Header row in csv/xlsx exports */
  header: boolean;
  /** Custom name for the number column in exports; empty = default */
  numberHeader: string;
  /** Export at most this many rows; 0 = all */
  maxRows: number;
  /** full rows, or only the name + number columns */
  columns: 'full' | 'numbers';
}

export const DEFAULT_SETTINGS: Settings = {
  phoneColumn: '',
  nameColumn: '',
  dedupe: 'off',
  strict: true,
  multiple: 'all',
  skipEmpty: false,
  numberStyle: 'plain',
  only: 'all',
  header: true,
  numberHeader: '',
  maxRows: 0,
  columns: 'full',
};

const DEDUPE_MODES: DedupeMode[] = ['off', 'first', 'last'];

const pick = <T>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

const text = (value: unknown) => (typeof value === 'string' ? value.slice(0, 200) : '');

/**
 * Builds a complete Settings object from untrusted input (query strings, JSON bodies, storage)
 */
export function resolveSettings(input: unknown): Settings {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const bool = (key: keyof Settings) =>
    typeof raw[key] === 'boolean'
      ? (raw[key] as boolean)
      : raw[key] === 'true'
        ? true
        : raw[key] === 'false'
          ? false
          : (DEFAULT_SETTINGS[key] as boolean);

  return {
    phoneColumn: text(raw.phoneColumn),
    nameColumn: text(raw.nameColumn),
    dedupe: pick(raw.dedupe, DEDUPE_MODES, DEFAULT_SETTINGS.dedupe),
    strict: bool('strict'),
    multiple: pick(raw.multiple, ['all', 'first'] as const, DEFAULT_SETTINGS.multiple),
    skipEmpty: bool('skipEmpty'),
    numberStyle: pick(raw.numberStyle, NUMBER_STYLES, DEFAULT_SETTINGS.numberStyle),
    only: pick(raw.only, ROW_SETS, DEFAULT_SETTINGS.only),
    header: bool('header'),
    numberHeader: text(raw.numberHeader).trim().slice(0, 60),
    maxRows: Math.max(0, Math.min(Math.floor(Number(raw.maxRows) || 0), 10_000_000)),
    columns: pick(raw.columns, ['full', 'numbers'] as const, DEFAULT_SETTINGS.columns),
  };
}

/**
 * Options for analyzeRows
 */
export function toAnalyzeOptions(settings: Settings): AnalyzeOptions {
  return {
    phoneColumn: settings.phoneColumn || undefined,
    nameColumn:
      settings.nameColumn === ''
        ? undefined
        : settings.nameColumn === 'none'
          ? null
          : settings.nameColumn,
    dedupe: settings.dedupe,
    strict: settings.strict,
    multiple: settings.multiple,
    skipEmpty: settings.skipEmpty,
  };
}

/**
 * How exports are shaped
 */
export function toOutputOptions(settings: Settings): OutputOptions {
  return {
    header: settings.header,
    numberHeader: settings.numberHeader,
    maxRows: settings.maxRows,
    columns: settings.columns,
  };
}

/**
 * Options for the dataset builders
 */
export function toDatasetOptions(settings: Settings): DatasetOptions {
  return {
    only: settings.only,
    numberStyle: settings.numberStyle,
    strict: settings.strict,
    dedupe: settings.dedupe !== 'off',
  };
}
