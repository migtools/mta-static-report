import React from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";

import { Nav, NavItem, NavList, PageSidebar } from "@patternfly/react-core";

import { useSimpleContext } from "@app/context/simple-context";

// Wrapper component to adapt PatternFly's href prop to React Router's to prop
const NavLinkAdapter = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof RouterNavLink> & { href?: string }
>(({ href, ...props }, ref) => {
  return <RouterNavLink ref={ref} to={href || "#"} {...props} />;
});
NavLinkAdapter.displayName = "NavLinkAdapter";

export const SidebarApp: React.FC = () => {
  const { currentContext } = useSimpleContext();
  const location = useLocation();

  const renderPageNav = () => {
    return (
      <Nav id="nav-sidebar" aria-label="Nav">
        <NavList>
          <NavItem
            itemId="applications"
            to="/applications"
            component={NavLinkAdapter}
            isActive={location.pathname.startsWith("/applications")}
          >
            Applications
          </NavItem>
          <NavItem
            itemId="issues"
            to={
              !currentContext
                ? "/issues/applications"
                : "/issues/applications/" + currentContext.key
            }
            component={NavLinkAdapter}
            isActive={location.pathname.startsWith("/issues")}
          >
            Issues
          </NavItem>
          <NavItem
            itemId="insights"
            to={
              !currentContext
                ? "/insights/applications"
                : "/insights/applications/" + currentContext.key
            }
            component={NavLinkAdapter}
            isActive={location.pathname.startsWith("/insights")}
          >
            Insights
          </NavItem>
          <NavItem
            itemId="dependencies"
            to={
              !currentContext
                ? "/dependencies/applications"
                : "/dependencies/applications/" + currentContext.key
            }
            component={NavLinkAdapter}
            isActive={location.pathname.startsWith("/dependencies")}
          >
            Dependencies
          </NavItem>
        </NavList>
      </Nav>
    );
  };

  return <PageSidebar>{renderPageNav()}</PageSidebar>;
};
