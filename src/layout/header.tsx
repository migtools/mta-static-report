import React, { useReducer, useState } from "react";

import {
  Brand,
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  MenuToggleElement,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import HelpIcon from "@patternfly/react-icons/dist/esm/icons/help-icon";
import BarsIcon from "@patternfly/react-icons/dist/js/icons/bars-icon";
import EllipsisVIcon from "@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon";

// import avatarImage from "@app/images/avatar.svg";

import { AboutApp } from "./about";
import { Theme } from "./theme-constants";

export const HeaderApp: React.FC = () => {
  const [isAboutOpen, toggleIsAboutOpen] = useReducer((state) => !state, false);
  const [isKebabDropdownOpen, setIsKebabDropdownOpen] = useState(false);

  return (
    <>
      <AboutApp isOpen={isAboutOpen} onClose={toggleIsAboutOpen} />
      <Masthead display={{ default: "inline" }}>
        <MastheadToggle>
          <PageToggleButton variant="plain" aria-label="Global navigation">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadMain>
          <MastheadBrand>
            <MastheadLogo>
              <Brand
                src={Theme.logoNavbarSrc}
                alt="Brand"
                heights={{ default: "36px" }}
              >
                <source media="(min-width: 768px)" srcSet={Theme.logoNavbarSrc} />
                <source srcSet={Theme.logoNavbarSrc} />
              </Brand>
            </MastheadLogo>
          </MastheadBrand>
        </MastheadMain>
        <MastheadContent>
          <Toolbar isFullHeight isStatic>
            <ToolbarContent>
              <ToolbarGroup
                variant="action-group-plain"
                align={{ default: "alignEnd" }}
                gap={{ default: "gapNone", md: "gapMd" }}
              >
                <ToolbarGroup
                  variant="action-group-plain"
                  visibility={{ default: "hidden", lg: "visible" }}
                >
                  <ToolbarItem>
                    <Button
                      aria-label="About"
                      variant={ButtonVariant.plain}
                      onClick={toggleIsAboutOpen}
                      icon={<HelpIcon />}
                    />
                  </ToolbarItem>
                </ToolbarGroup>
                <ToolbarItem
                  visibility={{
                    default: "hidden",
                    md: "visible",
                    lg: "hidden",
                  }}
                >
                  <Dropdown
                    isOpen={isKebabDropdownOpen}
                    onSelect={() =>
                      setIsKebabDropdownOpen(!isKebabDropdownOpen)
                    }
                    onOpenChange={(isOpen: boolean) =>
                      setIsKebabDropdownOpen(isOpen)
                    }
                    popperProps={{ position: "right" }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() =>
                          setIsKebabDropdownOpen(!isKebabDropdownOpen)
                        }
                        isExpanded={isKebabDropdownOpen}
                        variant="plain"
                        aria-label="Settings and help"
                      >
                        <EllipsisVIcon aria-hidden="true" />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="about" onClick={toggleIsAboutOpen}>
                        <HelpIcon /> About
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </MastheadContent>
      </Masthead>
    </>
  );
};
