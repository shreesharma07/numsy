import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { ScrollManager } from './ScrollManager';
import './SiteLayout.css';

export function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollManager />
      <Navbar />
      <main id="main" tabIndex={-1} className="site-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
