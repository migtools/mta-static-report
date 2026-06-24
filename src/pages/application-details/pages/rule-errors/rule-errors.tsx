import { useOutletContext } from "react-router-dom";

import {
  EmptyState,
  EmptyStateBody,
  PageSection,
} from "@patternfly/react-core";
import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";

import { ApplicationProcessed } from "@app/models/api-enriched";
import { RuleErrors } from "@app/shared/components";

export function RuleErrorsPage() {
  const application = useOutletContext<ApplicationProcessed | null>();

  if (!application) {
    return null;
  }

  if (application.ruleErrors.length === 0) {
    return (
      <PageSection>
        <EmptyState
          icon={CheckCircleIcon}
          titleText="No errors"
          headingLevel="h4"
        >
          <EmptyStateBody>
            All rules completed successfully during analysis.
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <RuleErrors ruleErrors={application.ruleErrors} />
    </PageSection>
  );
};
