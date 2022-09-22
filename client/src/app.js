import { Outlet } from "react-router-dom";
import Navbar from './modules/navbar/navbar';
import { routes } from './routes';

export default function App() {
  const childRoutes = routes[0]
    .children
    .filter((route) => !route.notFound);

  return (
    <>
      <div className="bg-primary-radial-gradient">
        <Navbar routes={childRoutes} />
        <Outlet />
      </div>
    </>
  );
}
