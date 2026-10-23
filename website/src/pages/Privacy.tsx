import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Callout, Section } from '../components/ui';
import { pages } from '../content/pages';
import { repo } from '../content/site';
import { usePageMeta } from '../hooks/usePageMeta';
import './Privacy.css';

const UPDATED = '23 October 2026';

export function PrivacyPage() {
  usePageMeta(pages.privacy);
  return (
    <>
      <PageHeader
        label="Legal / Privacy & data"
        num="Policy"
        title="Your data stays yours."
        lede="Numsy never receives the files or numbers you process. We don't store them, sell them, share them with third parties or use them to train AI."
      />
      <Section id="summary">
        <div className="privacy">
          <Callout tone="note" title="In short">
            <ul>
              <li>
                <strong>No storage.</strong> Numsy keeps no copy of your Excel, CSV or pasted
                contents anywhere outside your own device.
              </li>
              <li>
                <strong>No selling or sharing.</strong> We never sell, rent, share or disclose file
                contents to third parties.
              </li>
              <li>
                <strong>No AI training.</strong> Your data is never used to train, fine-tune or
                evaluate any AI or machine-learning model, by us or by anyone we work with.
              </li>
              <li>
                <strong>No tracking of you.</strong> The npm package, CLI and local dashboard send
                no analytics or telemetry. This website counts visits with cookieless Cloudflare Web
                Analytics, which never sees your files and collects no personal data.
              </li>
            </ul>
          </Callout>

          <h2 id="playground">Website playground</h2>
          <p>
            The <Link to={pages.playground.path}>playground</Link> runs the Numsy engine inside a
            Web Worker in your browser tab. When you choose a file, the browser reads it locally; it
            is never uploaded, and there is no Numsy server behind the website. Closing or
            refreshing the tab discards everything.
          </p>
          <p>
            The playground remembers your <em>settings</em> (filters and output options, never file
            contents) in your browser's local storage so they are ready next time. Clear your site
            data to remove them.
          </p>

          <h2 id="local">Local dashboard and CLI</h2>
          <p>
            <code>numsy dashboard</code> starts a server on your own computer. By default it listens
            on <code>127.0.0.1</code>, so other devices can't reach it. Files you open are parsed in
            memory, kept only while you work with them (at most an hour after last use, or until the
            server stops), and are not written to disk. The older <code>/api/upload</code> endpoint
            writes temporary files to a private folder that is cleaned up automatically.
          </p>
          <p>
            The <code>numsy</code> CLI and the library read only the files you give them and write
            only the outputs you ask for. Neither makes network requests.
          </p>

          <h2 id="website">What the website itself loads</h2>
          <p>
            To render pages, this site loads fonts from Google Fonts and public project statistics
            (stars, contributors, version and downloads) from the GitHub and npm APIs and Socket. It
            is hosted on Cloudflare Pages, which, like any web host, processes standard request data
            such as IP addresses to deliver pages. None of these requests contain your files or
            numbers.
          </p>
          <p>
            The site also uses{' '}
            <a href="https://www.cloudflare.com/web-analytics/">Cloudflare Web Analytics</a> to
            count page views and measure page speed. It sets no cookies, does not fingerprint
            browsers, does not follow you across sites and does not collect personal data. It runs
            only on this website, never inside the local dashboard or the npm package, and it has no
            access to the files or text you add to the playground.
          </p>

          <h2 id="responsibility">Your responsibilities</h2>
          <p>
            Phone numbers are personal data. When you process contact lists with Numsy you remain
            the data controller and are responsible for having a lawful basis to do so, for example
            under India's Digital Personal Data Protection Act, 2023.
          </p>

          <h2 id="disclaimer">Disclaimer</h2>
          <p>
            Numsy is open-source software provided “as is” under the{' '}
            <a href={`${repo.url}/blob/main/LICENSE`}>MIT License</a>, without warranty of any kind.
            Validation is rule-based: a “valid” result means a number is well-formed as an Indian
            mobile number, not that it is registered, reachable or belongs to a particular person.
          </p>

          <h2 id="contact">Contact</h2>
          <p>
            Questions about this policy: open an issue on <a href={`${repo.url}/issues`}>GitHub</a>.
            Security concerns: follow the{' '}
            <a href={`${repo.url}/blob/main/SECURITY.md`}>security policy</a>.
          </p>
          <p className="muted">Last updated {UPDATED}.</p>
        </div>
      </Section>
    </>
  );
}
