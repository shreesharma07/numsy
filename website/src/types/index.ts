import type { ReactNode } from 'react';

export type Tone = 'coral' | 'amber' | 'violet' | 'ink' | 'surface';

export type ThemeName = 'light' | 'dark';

export interface NavLink {
  label: string;
  /** Internal route (may include a #hash) */
  to?: string;
  /** External URL */
  href?: string;
}

export interface SitemapGroup {
  title: string;
  links: NavLink[];
}

export type LoadState = 'loading' | 'ready' | 'error';

export interface RepoStats {
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  state: LoadState;
}

export interface NpmStats {
  version: string | null;
  weeklyDownloads: number | null;
  state: LoadState;
}

export interface Contributor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
}

export interface TableColumn {
  key: string;
  header: ReactNode;
  /** Render the first column as a row header (<th scope="row">) */
  rowHeader?: boolean;
  width?: string;
}

export type TableRow = Record<string, ReactNode>;

export interface PlaygroundRow {
  original: string;
  sanitized: string;
  formatted: string;
  isValid: boolean;
  duplicate: boolean;
  reason: string | null;
}
