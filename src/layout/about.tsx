import React from "react";

import {
  AboutModal,
  Grid,
  GridItem,
  List,
  ListItem,
  Content,
} from "@patternfly/react-core";

import { Theme } from "./theme-constants";

const VERSION = (window as any)["version"];

interface IButtonAboutAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutApp: React.FC<IButtonAboutAppProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AboutModal
      isOpen={isOpen}
      onClose={onClose}
      brandImageAlt="Brand Image"
      brandImageSrc={Theme.logoSrc}
      className="about-app__component"
    >
      <Content>
        <h4>About</h4>
        <p>
          <a href={Theme.websiteURL} target="_blank" rel="noopener noreferrer">
            {Theme.name}
          </a>{" "}
          allows application architects and developers to quickly decompile,
          analyze, assess and modernize large scale application portfolios and
          migrate them to Red Hat Middleware, cloud and containers.
        </p>
      </Content>
      <Content className="pf-v6-u-py-xl">
        <Grid hasGutter>
          <GridItem lg={7}>
            <span className="dt">Version</span>
          </GridItem>
          <GridItem lg={5}>{VERSION}</GridItem>
        </Grid>
      </Content>
      <Content className="pf-v6-u-py-xl">
        <h4>Links</h4>
        <List>
          <ListItem>
            <a
              href={Theme.websiteURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          </ListItem>
          <ListItem>
            <a
              href={Theme.documentationURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </ListItem>
        </List>
      </Content>
    </AboutModal>
  );
};
