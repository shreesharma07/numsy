import { Link } from 'react-router-dom';
import { author, builtWithClaude, sitemap } from '../../content/site';
import { Container, FlagIndia, Icon, LogoMark, Wordmark } from '../ui';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <Container>
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label="Numsy home">
              <LogoMark size={40} className="footer__mark" />
              <Wordmark height={22} />
            </Link>
            <p className="footer__tag display">
              Bold numbers.
              <br />
              <span>Cleaner data.</span>
            </p>
            <p className="footer__blurb">
              Validate, extract and de-dupe Indian mobile numbers from CSV, Excel and text.
            </p>
          </div>
          {sitemap.map((group) => (
            <nav key={group.title} aria-label={`${group.title} links`} className="footer__col">
              <h2 className="label footer__heading">{group.title}</h2>
              <ul>
                {group.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to}>{l.label}</Link>
                    ) : (
                      <a href={l.href} rel="noopener">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer__bottom">
          <span>© 2026 {author.name} · MIT</span>
          <a className="footer__claude" href={builtWithClaude.claudeCodeUrl} rel="noopener">
            <Icon name="ph:sparkle-duotone" /> Built with Claude Code
          </a>
          <a className="footer__claude" href="https://pages.cloudflare.com" rel="noopener">
            <Icon name="ph:cloud-bold" /> Hosted on Cloudflare Pages
          </a>
          <span>
            Made in India <FlagIndia className="footer__flag" />
          </span>
        </div>
      </Container>
    </footer>
  );
}
