import { useReducedMotion } from 'motion/react';
import { heroVerbs } from '../../content/home';
import { pages } from '../../content/pages';
import { pkg, tagline } from '../../content/site';
import { useNpmStats } from '../../hooks/useNpmStats';
import RotatingText from '../reactbits/RotatingText/RotatingText';
import { Button, CodeBlock, Container } from '../ui';
import { PosterArt } from './PosterArt';
import './HomeHero.css';

export function HomeHero() {
  const { version } = useNpmStats();
  const reduceMotion = useReducedMotion();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Container>
        <div className="hero__rule">
          <span className="label">{tagline}</span>
          <span className="label">Open source · MIT · v{version ?? pkg.fallbackVersion}</span>
        </div>
        <div className="hero__grid">
          <div>
            <h1 id="hero-title" className="display hero__title">
              <span className="sr-only">
                Validate, extract, sanitize and de-dupe Indian mobile numbers
              </span>
              <span aria-hidden="true">
                {/* RotatingText renders nothing visible under reduced motion, so show a static verb */}
                {reduceMotion ? (
                  <span className="hero__rotator">{heroVerbs[0]}</span>
                ) : (
                  <RotatingText
                    texts={heroVerbs}
                    mainClassName="hero__rotator"
                    elementLevelClassName="hero__rotator-char"
                    effect="slide"
                    staggerDuration={0.02}
                    staggerFrom="first"
                    rotationInterval={2400}
                    pauseOnHover
                  />
                )}
                <span className="hero__line">Indian mobile</span>
                <span className="hero__line">numbers.</span>
              </span>
            </h1>
            <p className="lede hero__lede">
              <strong>Numsy</strong> is a lightweight TypeScript toolkit and CLI that validates,
              sanitizes, extracts and de-duplicates Indian mobile numbers in CSV, Excel and free
              text, locally and in seconds.
            </p>
            <CodeBlock
              code={`$ ${pkg.install.npm}`}
              lang="sh"
              label="Install"
              className="hero__install"
            />
            <div className="row">
              <Button variant="coral" to={pages.docs.path} iconRight="ph:arrow-right-bold">
                Get started
              </Button>
              <Button variant="violet" to={pages.playground.path} icon="ph:play-bold">
                Try it live
              </Button>
              <Button href={pkg.npmUrl} icon="ph:package-bold">
                npm
              </Button>
            </div>
          </div>
          <PosterArt className="hero__art" />
        </div>
      </Container>
    </section>
  );
}
