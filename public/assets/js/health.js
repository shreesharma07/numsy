document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        console.log('Lucide icons initialized');
    } else {
        console.error('Lucide library not loaded');
    }

    // Theme Management
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (systemDark) {
        html.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        text.textContent = theme === 'dark' ? 'Light' : 'Dark';
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Check health on load
    console.log('Calling checkHealth on page load');
    checkHealth();
});

async function checkHealth() {
    console.log('checkHealth function called');
    const statusIcon = document.getElementById('statusIcon');
    const statusTitle = document.getElementById('statusTitle');
    const statusDescription = document.getElementById('statusDescription');
    const infoGrid = document.getElementById('infoGrid');
    const statusValue = document.getElementById('statusValue');
    const timestampValue = document.getElementById('timestampValue');
    const responseTimeValue = document.getElementById('responseTimeValue');

    console.log('Elements found:', { statusIcon, statusTitle, infoGrid });

    // Reset to loading state
    statusIcon.className = 'status-icon loading';
    statusIcon.setAttribute('data-lucide', 'activity');
    statusTitle.className = 'loading';
    statusTitle.textContent = 'Checking Health...';
    statusDescription.textContent = 'Connecting to Numsy API...';
    infoGrid.style.display = 'none';
    lucide.createIcons();

    const startTime = Date.now();

    try {
        console.log('Fetching /api/health...');
        const response = await fetch('/api/health');
        const data = await response.json();
        const responseTime = Date.now() - startTime;

        console.log('Health check response:', { status: response.status, data });

        if (response.ok && data.status === 'OK') {
            // Success state
            statusIcon.className = 'status-icon success';
            statusIcon.setAttribute('data-lucide', 'check-circle');
            statusTitle.className = 'success';
            statusTitle.textContent = 'All Systems Operational';
            statusDescription.textContent = 'Numsy API is running smoothly';

            statusValue.textContent = data.status;
            statusValue.style.color = 'var(--success)';
            timestampValue.textContent = new Date(data.timestamp).toLocaleString();
            responseTimeValue.textContent = `${responseTime}ms`;

            infoGrid.style.display = 'grid';
        } else {
            throw new Error('Health check failed');
        }
    } catch (error) {
        // Error state
        statusIcon.className = 'status-icon error';
        statusIcon.setAttribute('data-lucide', 'x-circle');
        statusTitle.className = 'error';
        statusTitle.textContent = 'Service Unavailable';
        statusDescription.textContent = 'Unable to connect to Numsy API. Please try again later.';
    }

    lucide.createIcons();
}
