import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./modules/navbar/navbar";
import { routes } from "./routes";
import { localeState } from "./app.state";
import { useTranslation } from "react-i18next";

export default function App() {
  const childRoutes = routes[0].children;
  const setLocale = useSetRecoilState(localeState);
  const { t, i18n } = useTranslation();
  const location = useLocation();


  // useEffect(() => window.registerLocaleChangeListener(setLocale), [setLocale]);

  useEffect(() => {
    const unregisterLocaleChangeListener = window.registerLocaleChangeListener(
      (locale) => {
        i18n.changeLanguage(locale);
      }
    );

    return () => {
      unregisterLocaleChangeListener();
    };
  }, [i18n]);

  useEffect(() => {
    // Select the element with id 'logoBanner'
    const logoBanner = document.getElementById("logoBanner");

    // Determine the container class based on the current route
    const containerClass =
      location.pathname === "/run-scenario" ? "container-fluid" : "container";

    // Update the class
    if (logoBanner) {
      logoBanner.className = containerClass;
    }
  }, [location]);
  
  return (
    <>
      <div className="bg-primary-radial-gradient">
        <Navbar routes={childRoutes} />
        <Outlet />
      </div>
    </>
  );
}
