import { useEffect, useState } from 'react';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { Icon, LogoMark } from '../components/ui';
import { Dashboard } from './Dashboard';
import { createLocalRuntime } from './localRuntime';
import type { Runtime } from './runtime';
import './LocalApp.css';

const SITE = 'https://numsy.pages.dev';

interface Meta {
  version: string;
}

/**
 * Shell for `numsy dashboard`: the dashboard served by the local Numsy server
 */
export function LocalApp() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [offline, setOffline] = useState(false);

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
        <a className="local__brand" href="/" aria-label="Reload Numsy Dashboard">
          <LogoMark size={34} />
          <span className="local__title">
            Numsy <span>Dashboard</span>
          </span>
        </a>
        <span className="local__badge" title="Running on this computer">
          <span className="local__dot" aria-hidden="true" />
          Local{meta ? ` · v${meta.version}` : ''}
        </span>
        <nav className="local__nav" aria-label="Server">
          <a href="/api">
            <Icon name="ph:plugs-connected-bold" /> REST API
          </a>
          <a href="/api/health-page">
            <Icon name="ph:heartbeat-bold" /> Health
          </a>
          <a href={`${SITE}/docs/web-ui/`} rel="noopener">
            <Icon name="ph:book-open-bold" /> Docs
          </a>
        </nav>
        <ThemeToggle />
      </header>

      <main className="local__main">
        {offline ? (
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
