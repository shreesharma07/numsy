import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

/** Base path comes from vite.config.ts (`base: '/numsy/'`). */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}
