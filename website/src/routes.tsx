import { Route, Routes } from 'react-router-dom';
import { DocsLayout } from './components/layout/DocsLayout';
import { SiteLayout } from './components/layout/SiteLayout';
import { AboutPage } from './pages/About';
import { ContributorsPage } from './pages/Contributors';
import { CreditsPage } from './pages/Credits';
import { ApiPage } from './pages/docs/Api';
import { CliPage } from './pages/docs/Cli';
import { FaqPage } from './pages/docs/Faq';
import { FormatsPage } from './pages/docs/Formats';
import { GettingStartedPage } from './pages/docs/GettingStarted';
import { WebUiPage } from './pages/docs/WebUi';
import { HomePage } from './pages/Home';
import { NotFoundPage } from './pages/NotFound';
import { PlaygroundPage } from './pages/Playground';
import { PrivacyPage } from './pages/Privacy';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="docs" element={<DocsLayout />}>
          <Route index element={<GettingStartedPage />} />
          <Route path="cli" element={<CliPage />} />
          <Route path="api" element={<ApiPage />} />
          <Route path="formats" element={<FormatsPage />} />
          <Route path="web-ui" element={<WebUiPage />} />
          <Route path="faq" element={<FaqPage />} />
        </Route>
        <Route path="playground" element={<PlaygroundPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contributors" element={<ContributorsPage />} />
        <Route path="credits" element={<CreditsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
