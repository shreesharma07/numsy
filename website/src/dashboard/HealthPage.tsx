import { type PointerEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Badge, Button, Icon } from '../components/ui';

interface Status {
  status: string;
  version: string;
  startedAt: string;
  uptimeSeconds: number;
  sessions: number;
  memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  runtime: { node: string; platform: string; arch: string; pid: number };
}

interface Check {
  at: number;
  ok: boolean;
  ms: number;
}

interface EndpointCheck {
  path: string;
  label: string;
  status: number;
  ms: number;
}

const ENDPOINTS = [
  { path: '/api/health', label: 'Liveness' },
  { path: '/api/meta', label: 'Metadata' },
  { path: '/api/status', label: 'Status' },
  { path: '/', label: 'Dashboard' },
];

const HISTORY = 30;
const INTERVAL_MS = 5000;

const time = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function uptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

async function timed(path: string): Promise<{ status: number; ms: number; body: unknown }> {
  const started = performance.now();
  try {
    const res = await fetch(path, { cache: 'no-store' });
    const type = res.headers.get('content-type') ?? '';
    const body = type.includes('json') ? await res.json() : await res.text();
    return { status: res.status, ms: Math.round(performance.now() - started), body };
  } catch {
    return { status: 0, ms: Math.round(performance.now() - started), body: null };
  }
}

/** Response times of recent checks: one series, one hue, hover for exact values */
function LatencyChart({ checks }: { checks: Check[] }) {
  const titleId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const plot = useRef<HTMLDivElement>(null);
  // Draw at the real pixel width so labels and markers keep their size on phones
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = plot.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(260, Math.round(entry.contentRect.width))),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const height = 140;
  const pad = { top: 14, right: 12, bottom: 22, left: 40 };
  const max = Math.max(10, ...checks.map((c) => c.ms));
  const ceiling = Math.ceil(max / 10) * 10;
  const x = (i: number) =>
    pad.left + (checks.length < 2 ? 0 : (i / (HISTORY - 1)) * (width - pad.left - pad.right));
  const y = (ms: number) => pad.top + (1 - ms / ceiling) * (height - pad.top - pad.bottom);
  const line = checks
    .map((c, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(c.ms).toFixed(1)}`)
    .join('');
  const active = hover === null ? null : checks[hover];
  const latest = checks[checks.length - 1];

  /** Nearest check to the pointer: the whole plot is the hit target, not just the 8px dots */
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!checks.length) return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * width;
    let nearest = 0;
    for (let i = 1; i < checks.length; i++) {
      if (Math.abs(x(i) - px) < Math.abs(x(nearest) - px)) nearest = i;
    }
    setHover(nearest);
  };

  return (
    <figure className="hp-chart">
      <figcaption id={titleId} className="hp-chart__title">
        Response time, last {checks.length} checks
        <span className="muted"> (ms, lower is better)</span>
      </figcaption>
      {/* Hover is a pointer convenience; the table view below carries the same values for keyboard and screen-reader users */}
      <div
        ref={plot}
        className="hp-chart__plot"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={titleId}>
          <title>
            {latest
              ? `Latest response ${latest.ms} ms across ${checks.length} checks`
              : 'No checks yet'}
          </title>
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line
                className="hp-chart__grid"
                x1={pad.left}
                x2={width - pad.right}
                y1={y(ceiling * f)}
                y2={y(ceiling * f)}
              />
              <text className="hp-chart__tick" x={pad.left - 8} y={y(ceiling * f) + 4}>
                {Math.round(ceiling * f)}
              </text>
            </g>
          ))}
          {checks.length > 1 && <path className="hp-chart__line" d={line} />}
          {checks.map((c, i) => (
            <circle
              key={c.at}
              className={c.ok ? 'hp-chart__dot' : 'hp-chart__dot hp-chart__dot--bad'}
              cx={x(i)}
              cy={y(c.ms)}
              r={hover === i ? 6 : 4}
            />
          ))}
        </svg>
        {active && hover !== null && (
          <div
            className="hp-chart__tip"
            style={{
              left: `${(x(hover) / width) * 100}%`,
              top: `${(y(active.ms) / height) * 100}%`,
            }}
          >
            <b>{active.ms} ms</b>
            <span>
              {time(active.at)} · {active.ok ? 'OK' : 'Failed'}
            </span>
          </div>
        )}
      </div>
    </figure>
  );
}

/**
 * Live health of the local Numsy server
 */
export function HealthPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointCheck[]>([]);
  const [auto, setAuto] = useState(true);
  const [checking, setChecking] = useState(false);
  const busy = useRef(false);

  const check = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setChecking(true);
    const main = await timed('/api/status');
    const ok = main.status === 200 && (main.body as Status | null)?.status === 'OK';
    setReachable(ok);
    if (ok) setStatus(main.body as Status);
    setChecks((list) => [...list, { at: Date.now(), ok, ms: main.ms }].slice(-HISTORY));
    const results = await Promise.all(ENDPOINTS.map((e) => timed(e.path)));
    setEndpoints(ENDPOINTS.map((e, i) => ({ ...e, status: results[i].status, ms: results[i].ms })));
    busy.current = false;
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  // Poll while auto-refresh is on and the tab is visible
  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [auto, check]);

  const last = checks[checks.length - 1];
  const okChecks = checks.filter((c) => c.ok);
  const avg = okChecks.length
    ? Math.round(okChecks.reduce((sum, c) => sum + c.ms, 0) / okChecks.length)
    : null;

  const tiles = status
    ? [
        { label: 'Version', value: `v${status.version}` },
        { label: 'Uptime', value: uptime(status.uptimeSeconds) },
        { label: 'Response', value: last ? `${last.ms} ms` : '-' },
        { label: 'Average', value: avg === null ? '-' : `${avg} ms` },
        { label: 'Open sessions', value: String(status.sessions) },
        { label: 'Memory (heap)', value: `${status.memory.heapUsedMb} MB` },
        { label: 'Memory (RSS)', value: `${status.memory.rssMb} MB` },
        { label: 'Node.js', value: status.runtime.node },
      ]
    : [];

  return (
    <div className="lp">
      <header className="lp-hero">
        <p className="label">Local server</p>
        <h1 className="lp-hero__title">Health</h1>
        <div
          className={`hp-banner hp-banner--${reachable === null ? 'wait' : reachable ? 'ok' : 'bad'}`}
          role="status"
        >
          <Icon
            name={
              reachable === null
                ? 'ph:circle-notch-bold'
                : reachable
                  ? 'ph:check-circle-bold'
                  : 'ph:x-circle-bold'
            }
            size={28}
          />
          <div>
            <strong>
              {reachable === null
                ? 'Checking the server…'
                : reachable
                  ? 'All systems operational'
                  : 'The server is not responding'}
            </strong>
            <span>
              {last ? `Last checked ${time(last.at)}` : 'Waiting for the first check'}
              {auto ? ` · refreshing every ${INTERVAL_MS / 1000} s` : ' · auto-refresh paused'}
            </span>
          </div>
          <div className="hp-banner__actions">
            <Button size="sm" icon="ph:arrows-clockwise-bold" onClick={check} disabled={checking}>
              Check now
            </Button>
            <Button
              size="sm"
              icon={auto ? 'ph:pause-bold' : 'ph:play-bold'}
              onClick={() => setAuto((on) => !on)}
              aria-pressed={auto}
            >
              {auto ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      </header>

      {status && (
        <dl className="hp-tiles">
          {tiles.map((tile) => (
            <div key={tile.label} className="hp-tile">
              <dt>{tile.label}</dt>
              <dd>{tile.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="hp-grid">
        <section className="lp-card" aria-labelledby="hp-latency">
          <h2 id="hp-latency" className="lp-card__title">
            Latency
          </h2>
          {checks.length ? (
            <LatencyChart checks={checks} />
          ) : (
            <p className="muted">No checks yet.</p>
          )}
          <details className="hp-table">
            <summary>Show the checks as a table</summary>
            <table>
              <caption className="sr-only">Recent health checks</caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Result</th>
                  <th scope="col">Response</th>
                </tr>
              </thead>
              <tbody>
                {[...checks].reverse().map((c) => (
                  <tr key={c.at}>
                    <td>{time(c.at)}</td>
                    <td>{c.ok ? 'OK' : 'Failed'}</td>
                    <td>{c.ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        <section className="lp-card" aria-labelledby="hp-endpoints">
          <h2 id="hp-endpoints" className="lp-card__title">
            Endpoints
          </h2>
          <ul className="hp-endpoints">
            {endpoints.map((e) => {
              const ok = e.status >= 200 && e.status < 300;
              return (
                <li key={e.path}>
                  <Icon
                    name={ok ? 'ph:check-circle-bold' : 'ph:x-circle-bold'}
                    className={ok ? 'ok' : 'bad'}
                  />
                  <span className="hp-endpoints__label">
                    {e.label}
                    <code>GET {e.path}</code>
                  </span>
                  <Badge tone={ok ? 'ok' : 'bad'}>{e.status || 'down'}</Badge>
                  <span className="hp-endpoints__ms">{e.ms} ms</span>
                </li>
              );
            })}
          </ul>
          {status && (
            <dl className="hp-runtime">
              <div>
                <dt>Platform</dt>
                <dd>
                  {status.runtime.platform} · {status.runtime.arch}
                </dd>
              </div>
              <div>
                <dt>Process</dt>
                <dd>PID {status.runtime.pid}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>{new Date(status.startedAt).toLocaleString()}</dd>
              </div>
            </dl>
          )}
        </section>
      </div>
    </div>
  );
}
