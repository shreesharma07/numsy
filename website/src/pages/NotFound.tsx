import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui';
import { pages } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';

export function NotFoundPage() {
  usePageMeta(pages.notFound);
  return (
    <PageHeader
      label="Error / 404"
      num="Not found"
      title="404 — Number not found."
      lede="This page didn't pass validation. It may have moved, or the link has a typo."
    >
      <div className="row">
        <Button variant="primary" to="/" icon="ph:house-bold">
          Back to home
        </Button>
        <Button to={pages.docs.path} icon="ph:book-open-bold">
          Docs
        </Button>
        <Button to={pages.playground.path} icon="ph:play-bold">
          Playground
        </Button>
      </div>
    </PageHeader>
  );
}
