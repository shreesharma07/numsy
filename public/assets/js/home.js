// Theme
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'light' || storedTheme === 'dark') {
  root.setAttribute('data-theme', storedTheme);
}

function updateThemeUI() {
  const theme = root.getAttribute('data-theme');
  const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  themeLabel.textContent = isDark ? 'Dark' : 'Light';
}

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeUI();
});

updateThemeUI();

// Icons
if (window.lucide) {
  window.lucide.createIcons();
}

// Year
document.getElementById('year').textContent = new Date().getFullYear();
