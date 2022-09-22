import App from "./app";
import Home from "./modules/home/home";
import RunScenarios from "./modules/run-scenarios/run-scenarios";
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
        path: "run-scenarios",
        element: <RunScenarios />,
        title: "Run Scenarios",
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