import { Navigate } from "react-router-dom";
import App from "./app";
// import Home from "./modules/home/home";
import RunScenario from "./modules/run-scenario/run-scenario";
import ScenarioResults from "./modules/run-scenario/scenario-results";
import CompareScenarios from "./modules/compare-scenarios/compare-scenarios";

export const routes = [
  {
    element: <App />,
    children: [
      // {
      //   path: "/",
      //   element: <Home />,
      //   title: "Home",
      //   navbar: true,
      //   end: true,
      // },
      {
        path: "run-scenario",
        element: <RunScenario />,
        title: "Run Scenario",
        navbar: true,
        end: false,
      },
      {
        path: "run-scenario/results",
        element: <ScenarioResults />,
        title: "Run Scenario - Results",
        navbar: false,
        end: true,
      },
      {
        path: "compare-scenarios",
        element: <CompareScenarios />,
        title: "Compare Scenarios",
        navbar: true,
        end: true,
      },      
      {
        path: "*",
        element: <Navigate to="/run-scenario" />,
        navbar: false,
      }
    ]
  },
];