import React, { useState, useCallback, useMemo } from "react";
import { useDebounce } from "usehooks-ts";

import {
  Button,
  Card,
  CardBody,
  Content,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Truncate,
  ToolbarItem,
  SearchInput,
  CardHeader,
  CardTitle,
  Toolbar,
  ToolbarContent,
  ToolbarToggleGroup,
  ToolbarItemVariant,
} from "@patternfly/react-core";

import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import FilterIcon from "@patternfly/react-icons/dist/esm/icons/filter-icon";

import { useTable, useTableControls } from "@app/shared/hooks";

import { IssueProcessed } from "@app/models/api-enriched";
import { ConditionalTableBody } from "@app/shared/components/table-controls/conditional-table-body";
import { SimplePagination } from "@app/shared/components/table-controls/simple-pagination";
import { SimpleMarkdown } from "@app/shared/components/simple-markdown";
import { getMarkdown } from "@app/utils/utils";
import { DispersedFile } from "@app/models/file";
import { useDispersedFiles } from "@app/queries/report";

interface IIssueOverviewProps {
  issue: IssueProcessed;
  onShowFile: (file: DispersedFile, issue: IssueProcessed) => void;
}

interface TableData extends DispersedFile {}

export const compareByColumnIndex = (
  a: TableData,
  b: TableData,
  columnIndex?: number
) => {
  switch (columnIndex) {
    case 0: // name
      return a.name.localeCompare(b.name);
    case 1: // count
      return a.totalIncidents - b.totalIncidents;
    default:
      return 0;
  }
};

export const IssueOverview: React.FC<IIssueOverviewProps> = ({
  issue,
  onShowFile,
}) => {
  const [filterText, setFilterText] = useState("");
  const debouncedFilterText = useDebounce<string>(filterText, 250);
  const dispersedFilesQuery = useDispersedFiles(issue);

  const items: TableData[] = useMemo(() => 
    dispersedFilesQuery.data?.filter((f) => f.totalIncidents !== 0) || [], 
  [dispersedFilesQuery.data])

  const filterItem = useCallback(
    (item: TableData) => {
      let isFilterTextFilterCompliant = true;
      if (debouncedFilterText && debouncedFilterText.trim().length > 0) {
        isFilterTextFilterCompliant =
          item.name.toLowerCase().indexOf(debouncedFilterText.toLowerCase()) !==
          -1;
      }
      return isFilterTextFilterCompliant;
    },
    [debouncedFilterText]
  );

  const {
    page: currentPage,
    sortBy: currentSortBy,
    changePage: onPageChange,
    changeSortBy: onChangeSortBy,
  } = useTableControls();

  const { pageItems, filteredItems } = useTable<TableData>({
    items,
    filterItem,
    currentPage: currentPage,
    currentSortBy: currentSortBy,
    compareToByColumn: compareByColumnIndex,
  });

  return (
    <Stack hasGutter>
      <StackItem>
        <Grid hasGutter>
          <GridItem md={5}>
            <Toolbar
              className="pf-m-toggle-group-container"
              collapseListedFiltersBreakpoint="xl"
            >
              <ToolbarContent>
                <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                  <ToolbarItem>
                    <SearchInput
                      value={filterText}
                      onChange={(_, value) => setFilterText(value)}
                      onClear={() => setFilterText("")}
                    />
                  </ToolbarItem>
                </ToolbarToggleGroup>
                <ToolbarItem
                  variant={ToolbarItemVariant.pagination}
                  align={{ default: "alignEnd" }}
                >
                  <SimplePagination
                    count={filteredItems.length}
                    params={currentPage}
                    onChange={onPageChange}
                    isTop={true}
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>

            <Table>
              <Thead>
                <Tr>
                  <Th
                    width={80}
                    sort={{
                      columnIndex: 1,
                      sortBy: { ...currentSortBy },
                      onSort: onChangeSortBy,
                    }}
                  >
                    File
                  </Th>
                  <Th width={20}>Total incidents</Th>
                </Tr>
              </Thead>
              <ConditionalTableBody
                isNoData={filteredItems.length === 0}
                numRenderedColumns={10}
              >
                {pageItems?.map((item, rowIndex) => {
                  return (
                    <Tbody key={rowIndex}>
                      <Tr>
                        <Td>
                          <FileLink
                            file={item.name}
                            defaultText={item.displayName}
                            onClick={() => onShowFile(item, issue)}
                          />
                        </Td>
                        <Td>{item.totalIncidents}</Td>
                      </Tr>
                    </Tbody>
                  );
                })}
              </ConditionalTableBody>
            </Table>

            <SimplePagination
              count={filteredItems.length}
              params={currentPage}
              onChange={onPageChange}
            />
          </GridItem>
          <GridItem md={7}>
            <Card isCompact isFullHeight>
              <CardHeader>
                <CardTitle>
                  <Content component="h2">{issue.ruleID}</Content>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <SimpleMarkdown
                  children={getMarkdown(issue.description || "", issue.links)}
                />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>
    </Stack>
  );
};

interface IFileLinkProps {
  file: string;
  defaultText: string;
  onClick: () => void;
}

export const FileLink: React.FC<IFileLinkProps> = ({
  file,
  defaultText,
  onClick,
}) => {
  return (
    <>
      {file ? (
        <Button variant="link" isInline onClick={onClick}>
          <Truncate content={defaultText || file} />
        </Button>
      ) : (
        defaultText
      )}
    </>
  );
};
