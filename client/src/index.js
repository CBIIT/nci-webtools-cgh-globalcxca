import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { register } from './serviceWorkerRegistration';
import { reportWebVitals } from './reportWebVitals';
import { routes } from './routes';
import './styles/main.scss';

const root = createRoot(document.getElementById('root'));
const router = createHashRouter(routes);

root.render(
  <StrictMode>
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </StrictMode>
);

// register();
reportWebVitals(console.log);
