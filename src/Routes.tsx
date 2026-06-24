import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Bullseye, Spinner } from "@patternfly/react-core";

// At least one page should not have lazy() for not having "[mini-css-extract-plugin] Conflicting order." error
const ApplicationList = lazy(() => import("./pages/application-list"));
const IssuesList = lazy(() => import("./pages/issues-list"));
const InsightsList = lazy(() => import("./pages/insights-list"));
const DependenciesList = lazy(() => import("./pages/dependencies-list"));
const AppEdit = lazy(() => import("./pages/application-details"));
const AppEditDashboard = lazy(
  () => import("./pages/application-details/pages/dashboard")
);
const AppEditIssues = lazy(
  () => import("./pages/application-details/pages/issues")
);
const AppEditRuleErrors = lazy(
  () => import("./pages/application-details/pages/rule-errors")
);
const AppEditDependencies = lazy(
  () => import("./pages/application-details/pages/dependencies")
);
const AppTechnologies = lazy(
  () => import("./pages/application-details/pages/technologies")
);
const AppInsights = lazy(
  () => import("./pages/application-details/pages/insights")
)

export type ApplicationRoute = {
  applicationId: string;
};

export const AppRoutes = () => {
  const routes = [
    {
      Component: ApplicationList,
      path: "/applications",
      hasDescendant: false,
    },
    // Issues
    {
      Component: IssuesList,
      path: "/issues",
      hasDescendant: false,
    },
    {
      Component: IssuesList,
      path: "/issues/applications",
      hasDescendant: false,
    },
    {
      Component: IssuesList,
      path: "/issues/applications/:applicationId",
      hasDescendant: false,
    },
    // Insights
    {
      Component: InsightsList,
      path: "/insights",
      hasDescendant: false,
    },
    {
      Component: InsightsList,
      path: "/insights/applications",
      hasDescendant: false,
    },
    {
      Component: InsightsList,
      path: "/insights/applications/:applicationId",
      hasDescendant: false,
    },
    // Dependencies
    {
      Component: DependenciesList,
      path: "/dependencies",
      hasDescendant: false,
    },
    {
      Component: DependenciesList,
      path: "/dependencies/applications",
      hasDescendant: false,
    },
    {
      Component: DependenciesList,
      path: "/dependencies/applications/:applicationId",
      hasDescendant: false,
    },
    // Edit application
    {
      Component: AppEdit,
      path: "/applications/:projectId",
      children: [
        {
          Component: () => <Navigate to="dashboard" replace />,
          path: "",
        },
        {
          Component: AppEditDashboard,
          path: "dashboard",
        },
        {
          Component: AppEditIssues,
          path: "issues",
        },
        {
          Component: AppEditRuleErrors,
          path: "errors",
        },
        {
          Component: AppInsights,
          path: "insights",
        },
        {
          Component: AppEditDependencies,
          path: "dependencies",
        },
        {
          Component: AppTechnologies,
          path: "technologies",
        },
      ],
    },
  ];

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <Routes>
        {routes.map(({ path, hasDescendant, Component, children }, index) => (
          <Route
            key={index}
            path={!hasDescendant ? path : `${path}/*`}
            element={<Component />}
          >
            {children?.map(
              ({ path: childPath, Component: ChildComponent }, childIndex) => (
                <Route
                  key={childIndex}
                  path={childPath}
                  element={<ChildComponent />}
                />
              )
            )}
          </Route>
        ))}
        <Route path="/" element={<Navigate to="/applications" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};
