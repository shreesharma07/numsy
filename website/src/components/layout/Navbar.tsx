import { useEffect, useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { primaryNav, repo } from '../../content/site';
import { useGitHubRepo } from '../../hooks/useGitHubRepo';
import { formatCount } from '../../lib/format';
import type { NavLink } from '../../types';
import { Button, Container, Icon, LogoMark, Wordmark } from '../ui';
import { ThemeToggle } from './ThemeToggle';
import './Navbar.css';

function isActive(link: NavLink, pathname: string, hash: string): boolean {
  if (!link.to) return false;
  const [path, h] = link.to.split('#');
  const samePath = pathname.replace(/\/$/, '') === path.replace(/\/$/, '');
  return h ? samePath && hash === `#${h}` : samePath;
}

export function Navbar() {
  const { pathname, hash } = useLocation();
  const { stars } = useGitHubRepo();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // close the mobile menu on navigation / Escape
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on route change only
  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="navbar">
      <Container className="navbar__inner">
        <Link className="navbar__brand" to="/" aria-label="Numsy — home">
          <LogoMark size={36} />
          <Wordmark height={18} className="navbar__wordmark" />
        </Link>
        <nav aria-label="Primary" className="navbar__nav">
          <ul id={menuId} className={open ? 'navbar__links is-open' : 'navbar__links'}>
            {primaryNav.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to ?? '/'}
                  className="navbar__link"
                  aria-current={isActive(link, pathname, hash) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="navbar__actions">
          <ThemeToggle />
          <Button
            variant="primary"
            href={repo.url}
            icon="ph:github-logo-bold"
            aria-label={`Star Numsy on GitHub (${formatCount(stars, 'unknown')} stars)`}
          >
            <span className="navbar__star-label">Star</span>
            <span className="navbar__stars">{formatCount(stars)}</span>
          </Button>
          <button
            type="button"
            className="btn btn--ghost btn--md btn--icon navbar__menu"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'ph:x-bold' : 'ph:list-bold'} />
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </Container>
    </header>
  );
}
