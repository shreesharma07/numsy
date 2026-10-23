import { useEffect, useState } from 'react';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { Icon, LogoMark } from '../components/ui';
import { ApiPage } from './ApiPage';
import { Dashboard } from './Dashboard';
import { HealthPage } from './HealthPage';
import { createLocalRuntime } from './localRuntime';
import type { Runtime } from './runtime';
import './LocalApp.css';
import './LocalPages.css';

const SITE = 'https://numsy.pages.dev';

interface Meta {
  version: string;
}

type Page = 'dashboard' | 'api' | 'health';

/** The server serves this app on all three paths */
const pageFor = (pathname: string): Page =>
  pathname.replace(/\/+$/, '') === '/api'
    ? 'api'
    : pathname.replace(/\/+$/, '') === '/api/health-page'
      ? 'health'
      : 'dashboard';

const NAV: Array<{ page: Page; href: string; label: string; icon: `ph:${string}` }> = [
  { page: 'dashboard', href: '/', label: 'Dashboard', icon: 'ph:squares-four-bold' },
  { page: 'api', href: '/api', label: 'REST API', icon: 'ph:plugs-connected-bold' },
  { page: 'health', href: '/api/health-page', label: 'Health', icon: 'ph:heartbeat-bold' },
];

const TITLES: Record<Page, string> = {
  dashboard: 'Numsy Dashboard',
  api: 'Numsy: REST API',
  health: 'Numsy: Health',
};

/**
 * Shell for `numsy dashboard`: the dashboard, REST API reference and health pages served by the
 * local Numsy server
 */
export function LocalApp() {
  const page = pageFor(window.location.pathname);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    document.title = TITLES[page];
  }, [page]);

  useEffect(() => {
    fetch('/api/meta')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Meta) => {
        setMeta(data);
        setRuntime(createLocalRuntime(data.version));
      })
      .catch(() => setOffline(true));
  }, []);

  return (
    <div className="local">
      <header className="local__bar">
        <a className="local__brand" href="/" aria-label="Numsy Dashboard home">
          <LogoMark size={34} />
          <span className="local__title">
            Numsy <span>Dashboard</span>
          </span>
        </a>
        <span className="local__badge" title="Running on this computer">
          <span className="local__dot" aria-hidden="true" />
          Local{meta ? ` · v${meta.version}` : ''}
        </span>
        <nav className="local__nav" aria-label="Local server">
          {NAV.map((item) => (
            <a
              key={item.page}
              href={item.href}
              className={item.page === page ? 'is-current' : undefined}
              aria-current={item.page === page ? 'page' : undefined}
            >
              <Icon name={item.icon} /> {item.label}
            </a>
          ))}
          <a href={`${SITE}/docs/web-ui/`} rel="noopener">
            <Icon name="ph:book-open-bold" /> Docs
          </a>
        </nav>
        <ThemeToggle />
      </header>

      <main className="local__main" id="main">
        {page === 'api' ? (
          <ApiPage version={meta?.version ?? null} />
        ) : page === 'health' ? (
          <HealthPage />
        ) : offline ? (
          <div className="dash__alert" role="alert">
            <Icon name="ph:plugs-bold" size={22} />
            <div>
              <strong>The Numsy server is not responding</strong>
              <p>
                Start it again with <code>numsy dashboard</code>, then reload this page.
              </p>
            </div>
          </div>
        ) : runtime ? (
          <Dashboard runtime={runtime} privacyHref={`${SITE}/privacy/`} />
        ) : (
          <p className="muted" role="status">
            Connecting to the Numsy server…
          </p>
        )}
      </main>

      <footer className="local__footer">
        <span>
          Numsy{meta ? ` v${meta.version}` : ''} · MIT · runs on this computer, no internet needed
        </span>
        <span>
          Stop the server with <kbd>Ctrl</kbd> + <kbd>C</kbd> in its terminal
        </span>
      </footer>
    </div>
  );
}
