import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { Outlet } from "react-router-dom";
import Navbar from "./modules/navbar/navbar";
import { routes } from "./routes";
import { localeState } from "./app.state";
import { useTranslation } from "react-i18next";

export default function App() {
  const childRoutes = routes[0].children;
  const setLocale = useSetRecoilState(localeState);

  const { t } = useTranslation();

  useEffect(() => window.registerLocaleChangeListener(setLocale), [setLocale]);

  return (
    <>
      <div className="bg-primary-radial-gradient">
        <Navbar routes={childRoutes} />
        <Outlet />
      </div>
    </>
  );
}
