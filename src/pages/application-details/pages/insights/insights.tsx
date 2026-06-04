import React from "react";
import { useOutletContext } from "react-router-dom";

import { PageSection, Title } from "@patternfly/react-core";

import { ApplicationProcessed } from "@app/models/api-enriched";
import { ViolationsTable } from "@app/shared/components";

export const Insights: React.FC = () => {
  const application = useOutletContext<ApplicationProcessed | null>();

  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" className="pf-v6-u-mb-md">
        Insights (Zero Effort Issues)
      </Title>
      <ViolationsTable applicationId={application?.id} insightsMode={true}/>
    </PageSection>
  );
};
