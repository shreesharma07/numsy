import { PageHeader } from '../components/layout/PageHeader';
import { AuthorCard } from '../components/sections/AuthorCard';
import { Button, Section } from '../components/ui';
import { pages } from '../content/pages';
import { builtWithClaude, repo } from '../content/site';
import { usePageMeta } from '../hooks/usePageMeta';

export function AboutPage() {
  usePageMeta(pages.about);
  return (
    <>
      <PageHeader
        label="About / The author"
        num="Made in India"
        title="Who builds Numsy."
        lede="An open-source project, maintained in the open."
      />
      <Section id="author" num="01" label="Author">
        <AuthorCard />
      </Section>
      <Section id="project" num="02" label="The project" title="Open by default." tone="alt">
        <p className="lede">
          Numsy is MIT-licensed and developed on GitHub. Issues, ideas and pull requests are
          welcome.
        </p>
        <p className="muted">
          {builtWithClaude.aboutLine}{' '}
          <a href={builtWithClaude.claudeCodeUrl} rel="noopener">
            About Claude Code
          </a>
          .
        </p>
        <div className="row">
          <Button variant="primary" to={pages.contributors.path} icon="ph:users-three-bold">
            Contributors &amp; community
          </Button>
          <Button href={repo.url} icon="ph:github-logo-bold">
            Repository
          </Button>
          <Button to={pages.credits.path} icon="ph:heart-bold">
            Credits
          </Button>
        </div>
      </Section>
    </>
  );
}
