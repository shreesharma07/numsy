// Polls /api/health and /api/meta for the health page
(() => {
  const $ = (id) => document.getElementById(id);

  async function check() {
    const started = performance.now();
    try {
      const [health, meta] = await Promise.all([
        fetch('/api/health', { cache: 'no-store' }).then((res) => res.json()),
        fetch('/api/meta', { cache: 'no-store' }).then((res) => res.json()),
      ]);
      const ok = health.status === 'OK';
      $('title').textContent = ok ? 'All systems go' : 'Something is wrong';
      $('status').textContent = health.status;
      $('status').className = ok ? 'ok' : 'bad';
      $('version').textContent = `v${meta.version}`;
      $('latency').textContent = `${Math.round(performance.now() - started)} ms`;
      $('checked').textContent = new Date(health.timestamp).toLocaleTimeString();
    } catch {
      $('title').textContent = 'Server not reachable';
      $('status').textContent = 'DOWN';
      $('status').className = 'bad';
      $('latency').textContent = '—';
      $('checked').textContent = new Date().toLocaleTimeString();
    }
  }

  $('refresh').addEventListener('click', check);
  check();
})();
