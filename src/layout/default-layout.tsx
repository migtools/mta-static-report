import React from "react";

import { Page } from "@patternfly/react-core";

import { HeaderApp } from "./header";
import { SidebarApp } from "./sidebar";

export const DefaultLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Page masthead={<HeaderApp />} sidebar={<SidebarApp />} isManagedSidebar>
      {children}
    </Page>
  );
};
