import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  EmptyState,
  EmptyStateVariant,
  Gallery,
  GalleryItem,
  Label,
  LabelGroup,
  PageSection,
} from "@patternfly/react-core";
import InfoAltIcon from "@patternfly/react-icons/dist/esm/icons/info-alt-icon";

import { ApplicationProcessed } from "@app/models/api-enriched";

import { TagDto } from "@app/api/report";

export const Technologies: React.FC = () => {
  const application = useOutletContext<ApplicationProcessed | null>();

  const allTags: TagDto[] = useMemo(() => application?.tags || [], [application])

  const tagsByCategory: {[key: string]: string[]} = allTags.reduce<{[key: string]: string[]}>((acc, tag) => {
    acc[tag.category.name] = acc[tag.category.name] ? [...acc[tag.category.name], tag.name] : [tag.name];
    return acc
  }, {})

  const sortedTagsByCategory = Object.entries(tagsByCategory).sort((a, b) => 
    a[0] === "Uncategorized" ? 1 : (a[1] ? (b[1] ? a[1].length - b[1].length:0):0))

  return (
    <>
      <PageSection>
        <Gallery hasGutter minWidths={{ md: "400px" }}>
          {sortedTagsByCategory.map(([category, tags], index) => (
            <GalleryItem key={index}>
              <Card isFullHeight>
                <CardTitle>
                  {category}
                </CardTitle>
                <Divider />
                <CardBody>
                  {
                    tags.length > 0 ? (
                      <LabelGroup numLabels={5}>
                        {
                          tags.map((value, tagIndex) => 
                            <Label variant="outline">{value}</Label>)
                        }
                      </LabelGroup>
                    ) : (
                      <EmptyState variant={EmptyStateVariant.sm} icon={InfoAltIcon} headingLevel="h4" titleText="No data to show">
                      </EmptyState>
                    )
                  }
                </CardBody>
              </Card>
            </GalleryItem>
          ))}
        </Gallery>
      </PageSection>
    </>
  );
};
