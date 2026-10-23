import { Link, Outlet, useLocation } from 'react-router-dom';
import { docsNav } from '../../content/site';
import { Container } from '../ui';
import './DocsLayout.css';

/** Docs pages: sticky sidebar (desktop) / horizontal chip list (mobile) + page content. */
export function DocsLayout() {
  const { pathname, hash } = useLocation();
  const here = pathname.replace(/\/$/, '');
  return (
    <div className="docs">
      <Container className="docs__grid">
        <nav className="docs__nav" aria-label="Documentation">
          {docsNav.map((group) => (
            <div key={group.title} className="docs__group">
              <p className="label docs__group-title">{group.title}</p>
              <ul>
                {group.links.map((l) => {
                  if (!l.to) {
                    return (
                      <li key={l.label}>
                        <a href={l.href} rel="noopener" className="docs__link">
                          {l.label} ↗
                        </a>
                      </li>
                    );
                  }
                  const [path, h] = l.to.split('#');
                  const active =
                    here === path && (h ? hash === `#${h}` || (!hash && h === 'about') : true);
                  return (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="docs__link"
                        aria-current={active ? 'page' : undefined}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="docs__content">
          <Outlet />
        </div>
      </Container>
    </div>
  );
}
