import { PageHeader } from '../../components/layout/PageHeader';
import { FaqList } from '../../components/sections/FaqList';
import { Button, Section } from '../../components/ui';
import { pages } from '../../content/pages';
import { repo } from '../../content/site';
import { usePageMeta } from '../../hooks/usePageMeta';

export function FaqPage() {
  usePageMeta(pages.faq);
  return (
    <>
      <PageHeader
        label="Docs / FAQ"
        num="Help"
        title="Good questions."
        lede="Short answers to what people ask most."
        art={false}
      />
      <Section id="faq">
        <FaqList />
        <div className="row mt-6">
          <Button href={repo.discussions} icon="ph:chats-circle-bold">
            Ask in Discussions
          </Button>
          <Button href={repo.issues} icon="ph:bug-beetle-bold">
            Report a bug
          </Button>
        </div>
      </Section>
    </>
  );
}
