// Shared by the server pages: theme toggle (same storage key as the dashboard, light by default) and version
(() => {
  const STORAGE_KEY = 'numsy-theme';
  const root = document.documentElement;
  const button = document.getElementById('themeToggle');

  const current = () => root.getAttribute('data-theme') || 'light';
  const label = () => {
    if (button) button.textContent = current() === 'dark' ? 'Light theme' : 'Dark theme';
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch {}
  label();

  button?.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    label();
  });

  fetch('/api/meta')
    .then((res) => res.json())
    .then((meta) => {
      for (const el of document.querySelectorAll('[data-version]')) el.textContent = `v${meta.version}`;
    })
    .catch(() => {});
})();
