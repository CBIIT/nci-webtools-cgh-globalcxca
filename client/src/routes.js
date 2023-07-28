import { Navigate } from "react-router-dom";
import App from "./app";
import Home from "./modules/home/home";
import RunScenario from "./modules/run-scenario/run-scenario";
import ScenarioResults from "./modules/run-scenario/scenario-results";
import CompareScenarios from "./modules/compare-scenarios/compare-scenarios";
import About from "./modules/about/about";
import { useTranslation, Trans } from "react-i18next";

export const routes = [
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
        title: <Trans i18nKey="navbar.home" />,
        navbar: true,
        end: true,
      },
      {
        path: "run-scenario",
        element: <RunScenario />,
        title: <Trans i18nKey="navbar.runScenario" />,
        navbar: true,
        end: false,
      },
      {
        path: "run-scenario/results",
        element: <ScenarioResults />,
        title: <Trans i18nKey="navbar.runScenarioResults" />,
        navbar: false,
        end: true,
      },
      {
        path: "compare-scenarios",
        element: <CompareScenarios />,
        title: <Trans i18nKey="navbar.compareScenarios" />,
        navbar: true,
        end: true,
      },
      {
        path: "about",
        element: <About />,
        title: <Trans i18nKey="navbar.about" />,
        navbar: true,
        end: true,
      },
      {
        path: "*",
        element: <Navigate to="/run-scenario" />,
        navbar: false,
      },
    ],
  },
];
