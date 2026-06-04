import React from "react";
import { useMatch, useNavigate } from "react-router-dom";

import {
  Content,
  Divider,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";

import { ALL_APPLICATIONS_ID } from "@app/Constants";
import { Context, SimpleContextSelector } from "@app/context/simple-context";
import { ViolationsTable } from "@app/shared/components/violations-table";

export const InsightsList: React.FC = () => {
  const matchInsightsPage = useMatch("/insights");
  const matchAllApplicationsPage = useMatch("/insights/applications");
  const matchSingleApplicationPage = useMatch(
    "/insights/applications/:applicationId"
  );

  const applicationId = matchInsightsPage
    ? undefined
    : matchAllApplicationsPage
    ? ALL_APPLICATIONS_ID
    : matchSingleApplicationPage?.params.applicationId;

  const navigate = useNavigate();

  const onContextChange = (context: Context) => {
    navigate("/insights/applications/" + context.key);
  };

  return (
    <>
      <PageSection>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>Application:</ToolbarItem>
            <ToolbarItem>
              <SimpleContextSelector
                contextKeyFromURL={applicationId}
                onChange={onContextChange}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <Divider />
      <PageSection>
        <Content component="h1">Insights</Content>
        <Content component="p">
          This report provides a concise summary of all insights identified - issues with zero effort.
        </Content>
      </PageSection>
      <PageSection>
        <ViolationsTable applicationId={applicationId} insightsMode={true} />
      </PageSection>
    </>
  );
};