import { builtWithClaude as c } from '../../content/site';
import { Button, Icon, RichText } from '../ui';
import './BuiltWithClaude.css';

const ICONS = ['ph:sparkle-duotone', 'ph:robot-duotone', 'ph:code-duotone'] as const;

/**
 * Poster-style "Built with Claude" credit. Text + Phosphor icons only — no third-party
 * logo artwork. Used at the top of /credits and near the end of the home page.
 */
export function BuiltWithClaude({ headingLevel = 2, id }: { headingLevel?: 2 | 3; id?: string }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section className="bwc" id={id} aria-labelledby={headingId}>
      <div className="bwc__icons" aria-hidden="true">
        {ICONS.map((name, i) => (
          <span key={name} className={`bwc__icon bwc__icon--${i}`}>
            <Icon name={name} size={40} />
          </span>
        ))}
      </div>
      <p className="label bwc__label">{c.label}</p>
      <H id={headingId} className="display bwc__title">
        {c.title}
      </H>
      <p className="bwc__body">
        <RichText text={c.body} />
      </p>
      <ul className="bwc__built" aria-label="What was built with Claude">
        {c.built.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className="row">
        <Button variant="primary" href={c.claudeCodeUrl} icon="ph:terminal-window-bold">
          Claude Code
        </Button>
        <Button href={c.claudeUrl} icon="ph:chat-circle-text-bold">
          claude.ai
        </Button>
      </div>
      <p className="bwc__note">{c.disclaimer}</p>
    </section>
  );
}
