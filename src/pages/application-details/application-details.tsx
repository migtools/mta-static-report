import { useEffect, useMemo } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  Content,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
} from "@patternfly/react-core";

import { useAllApplications } from "@app/queries/report";

export const ApplicationEdit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = useMatch("/applications/:applicationId/*");

  const allApplicationsQuery = useAllApplications();

  const application = useMemo(() => {
    const applicationId = routeParams?.params.applicationId;
    return (
      allApplicationsQuery.data?.find((app) => app.id === applicationId) || null
    );
  }, [routeParams?.params, allApplicationsQuery.data]);

  const tabItems = useMemo(() => {
    const result: { title: string; path: string }[] = [
      {
        title: "Dashboard",
        path: `/applications/${application?.id}/dashboard`,
      },
      {
        title: "Issues",
        path: `/applications/${application?.id}/issues`,
      },
      {
        title: "Insights",
        path: `/applications/${application?.id}/insights`,
      },
      {
        title: "Dependencies",
        path: `/applications/${application?.id}/dependencies`,
      },
      {
        title: "Technologies",
        path: `/applications/${application?.id}/technologies`,
      },
    ];

    if ((application?.ruleErrors.length || 0) > 0) {
      result.push({
        title: "Errors",
        path: `/applications/${application?.id}/errors`,
      });
    }

    return result;
  }, [
    application,
  ]);

  useEffect(() => {
    if (
      application &&
      application.ruleErrors.length === 0 &&
      location.pathname.endsWith("/errors")
    ) {
      navigate(`/applications/${application.id}/dashboard`, { replace: true });
    }
  }, [application, location.pathname, navigate]);

  return (
    <>
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/applications">Applications</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{application?.name}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection type="default">
        <Content component="h1">{application?.name}</Content>
      </PageSection>
      <PageSection type="tabs">
        <Tabs
          role="region"
          activeKey={tabItems.find((e) => e.path === location.pathname)?.path}
          onSelect={(_, tabKey) => navigate(`${tabKey}`)}
          isOverflowHorizontal={{ showTabCount: true }}
          // isFilled={true}
        >
          {tabItems.map((e, index) => (
            <Tab
              key={index}
              eventKey={e.path}
              title={<TabTitleText>{e.title}</TabTitleText>}
            />
          ))}
        </Tabs>
      </PageSection>
      <Outlet context={application} />
    </>
  );
};
