import { useState } from 'react';
import { Badge, Button, Callout, CodeBlock, CopyButton, Icon, Table } from '../components/ui';
import { type ApiEndpoint, type HttpMethod, apiGroups, errorSpec, settingsSpec } from './apiSpec';

const METHOD_TONE: Record<HttpMethod, 'ok' | 'amber' | 'bad'> = {
  GET: 'ok',
  POST: 'amber',
  DELETE: 'bad',
};

function MethodBadge({ method }: { method: HttpMethod }) {
  return <Badge tone={METHOD_TONE[method]}>{method}</Badge>;
}

interface LiveResponse {
  status: number;
  ms: number;
  body: string;
}

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [live, setLive] = useState<LiveResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const tryIt = async () => {
    setBusy(true);
    const started = performance.now();
    try {
      const res = await fetch(endpoint.path, { cache: 'no-store' });
      const text = await res.text();
      let body = text;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // not JSON: show it as is
      }
      setLive({ status: res.status, ms: Math.round(performance.now() - started), body });
    } catch (error) {
      setLive({ status: 0, ms: 0, body: `Request failed: ${(error as Error).message}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="endpoint" id={endpoint.id} aria-labelledby={`${endpoint.id}-title`}>
      <header className="endpoint__head">
        <MethodBadge method={endpoint.method} />
        <code className="endpoint__path">{endpoint.path}</code>
        <h3 id={`${endpoint.id}-title`} className="endpoint__summary">
          {endpoint.summary}
        </h3>
        {endpoint.tryable && (
          <Button size="sm" variant="primary" icon="ph:play-bold" onClick={tryIt} disabled={busy}>
            {busy ? 'Calling…' : 'Try it'}
          </Button>
        )}
      </header>
      <div className="endpoint__body">
        <p className="endpoint__desc">{endpoint.description}</p>
        {endpoint.fields && (
          <Table
            caption={endpoint.body === 'multipart' ? 'Form fields (multipart)' : 'JSON body'}
            stack={false}
            columns={[
              { key: 'name', header: 'Field', rowHeader: true },
              { key: 'type', header: 'Type' },
              { key: 'description', header: 'Description' },
            ]}
            rows={endpoint.fields.map((field) => ({
              name: (
                <>
                  <code>{field.name}</code>
                  {field.required && <span className="endpoint__req">required</span>}
                </>
              ),
              type: <code>{field.type}</code>,
              description: field.description,
            }))}
          />
        )}
        <div className="endpoint__examples">
          <CodeBlock code={endpoint.curl} lang="sh" label="Request" />
          <CodeBlock
            code={endpoint.response}
            lang={endpoint.response.startsWith('{') ? 'json' : 'text'}
            label="Response"
            copy={false}
          />
        </div>
        {live && (
          <div className="endpoint__live" aria-live="polite">
            <p className="endpoint__live-meta">
              <Badge tone={live.status >= 200 && live.status < 300 ? 'ok' : 'bad'}>
                {live.status || 'error'}
              </Badge>
              <span>Live response from this server in {live.ms} ms</span>
            </p>
            <CodeBlock code={live.body} lang="json" label="Live response" />
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * REST API reference for `numsy dashboard`, with live "Try it" calls for the read-only endpoints
 */
export function ApiPage({ version }: { version: string | null }) {
  const base = window.location.origin;

  return (
    <div className="lp">
      <header className="lp-hero">
        <p className="label">Local server{version ? ` · v${version}` : ''}</p>
        <h1 className="lp-hero__title">REST API</h1>
        <p className="lp-hero__lede">
          Everything the dashboard does, over HTTP. The same engine and settings as the{' '}
          <code>numsy</code> CLI, with JSON in and files out.
        </p>
        <div className="lp-base">
          <span className="label">Base URL</span>
          <code>{base}</code>
          <CopyButton text={base} />
        </div>
        <ul className="lp-facts">
          <li>
            <Icon name="ph:lock-key-bold" /> Listens on 127.0.0.1
          </li>
          <li>
            <Icon name="ph:shield-check-bold" /> Same-origin requests only
          </li>
          <li>
            <Icon name="ph:hard-drives-bold" /> Uploads stay in memory
          </li>
        </ul>
      </header>

      <div className="lp-layout">
        <nav className="lp-toc" aria-label="Endpoints">
          {apiGroups.map((group) => (
            <div key={group.id} className="lp-toc__group">
              <a className="lp-toc__title" href={`#${group.id}`}>
                {group.title}
              </a>
              <ul>
                {group.endpoints.map((endpoint) => (
                  <li key={endpoint.id}>
                    <a href={`#${endpoint.id}`}>
                      <span className={`lp-toc__method lp-toc__method--${endpoint.method}`}>
                        {endpoint.method}
                      </span>
                      {endpoint.path}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="lp-toc__group">
            <a className="lp-toc__title" href="#settings">
              Settings
            </a>
            <a className="lp-toc__title" href="#errors">
              Errors
            </a>
          </div>
        </nav>

        <div className="lp-main">
          <Callout tone="note" title="Your data stays on this computer">
            <p>
              Uploads are parsed in memory and dropped an hour after last use or when the server
              stops. Numsy does not store file contents, never sells or shares them with third
              parties, and never uses them for AI training.{' '}
              <a href="https://numsy.pages.dev/privacy/">Privacy &amp; data disclaimer</a>
            </p>
          </Callout>

          <section className="lp-section" aria-labelledby="flow">
            <h2 id="flow">Quick start</h2>
            <CodeBlock
              lang="sh"
              label="Shell"
              code={`# 1. Parse a file into a session
curl -F "file=@contacts.xlsx" ${base}/api/parse

# 2. Read the de-duplicated valid rows
curl -H "Content-Type: application/json" ${base}/api/view \\
  -d '{"sessionId":"…","settings":{"dedupe":"first","only":"valid"}}'

# 3. Export them as Excel with a "Mobile" column
curl -OJ -H "Content-Type: application/json" ${base}/api/export \\
  -d '{"sessionId":"…","format":"xlsx","settings":{"dedupe":"first","only":"valid","numberHeader":"Mobile"}}'`}
            />
          </section>

          {apiGroups.map((group) => (
            <section key={group.id} className="lp-section" aria-labelledby={group.id}>
              <h2 id={group.id}>{group.title}</h2>
              <p className="lp-section__lede">{group.description}</p>
              {group.endpoints.map((endpoint) => (
                <EndpointCard key={endpoint.id} endpoint={endpoint} />
              ))}
            </section>
          ))}

          <section className="lp-section" aria-labelledby="settings">
            <h2 id="settings">Settings</h2>
            <p className="lp-section__lede">
              Send any of these in <code>settings</code> (JSON) or as form fields. Unknown or
              invalid values fall back to the default.
            </p>
            <Table
              caption="Settings"
              columns={[
                { key: 'field', header: 'Field', rowHeader: true },
                { key: 'values', header: 'Values' },
                { key: 'defaultValue', header: 'Default' },
                { key: 'cli', header: 'CLI flag' },
              ]}
              rows={settingsSpec.map((s) => ({
                field: <code>{s.field}</code>,
                values: s.values,
                defaultValue: <code>{s.defaultValue}</code>,
                cli: <code>{s.cli}</code>,
              }))}
            />
          </section>

          <section className="lp-section" aria-labelledby="errors">
            <h2 id="errors">Errors</h2>
            <p className="lp-section__lede">
              Errors are JSON: <code>{'{ "statusCode": 400, "message": "…" }'}</code>.
            </p>
            <Table
              caption="Status codes"
              columns={[
                { key: 'code', header: 'Status', rowHeader: true, width: '6rem' },
                { key: 'meaning', header: 'Meaning' },
              ]}
              rows={errorSpec.map((e) => ({ code: <code>{e.code}</code>, meaning: e.meaning }))}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
