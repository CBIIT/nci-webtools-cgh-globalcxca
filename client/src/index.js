import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
// import { register } from './serviceWorkerRegistration';
import { reportWebVitals } from "./reportWebVitals";
import { routes } from "./routes";
import "./styles/main.scss";
import "./locales/locales.js"; // Import the locales.js file
import { LanguageProvider } from "./locales/languageContext";
import ReactDOM from "react-dom";
import LanguageSelect from "./locales/languageSelect";
const root = createRoot(document.getElementById("root"));
const router = createHashRouter(routes);

root.render(
  <StrictMode>
    <LanguageProvider>
      <RecoilRoot>
        <RouterProvider router={router} />
      </RecoilRoot>
    </LanguageProvider>
  </StrictMode>
);
ReactDOM.render(
  <LanguageSelect />,
  document.getElementById("languageSelectContainer")
);

// register();
reportWebVitals(console.log);
