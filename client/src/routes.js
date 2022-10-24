import App from "./app";
import Home from "./modules/home/home";
import RunScenario from "./modules/run-scenario/run-scenario";
import RunScenarioResults from "./modules/run-scenario/run-scenario-results";
import CompareScenarios from "./modules/compare-scenarios/compare-scenarios";
import About from "./modules/about/about";

export const routes = [
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
        title: "Home",
      },
      {
        path: "run-scenario",
        element: <RunScenario />,
        title: "Run Scenario",
        children: [
          {
            path: "results",
            element: <RunScenarioResults />,
            title: "Run Scenario - Results",
          }
        ]
      },
      {
        path: "compare-scenarios",
        element: <CompareScenarios />,
        title: "Compare Scenarios",
      },      
      {
        path: "about",
        element: <About />,
        title: "About",
      },
      {
        path: "*",
        element: <div>Not Found</div>,
        notFound: true,
      }
    ]
  },
];