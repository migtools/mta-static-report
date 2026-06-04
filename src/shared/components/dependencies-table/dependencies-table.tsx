import React, { useMemo, useState, useEffect, useCallback } from "react";

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Label,
  Split,
  SplitItem,
  SearchInput,
  ToolbarItem,
  ToolbarLabel,
  ToolbarLabelGroup,
  ToolbarFilter,
  Toolbar,
  ToolbarContent,
  ToolbarToggleGroup,
  ToolbarItemVariant,
} from "@patternfly/react-core";
import ArrowUpIcon from "@patternfly/react-icons/dist/esm/icons/arrow-up-icon";
import FilterIcon from "@patternfly/react-icons/dist/esm/icons/filter-icon";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { useDebounce } from "usehooks-ts";

import { DependencyDto } from "@app/api/report";
import { ALL_APPLICATIONS_ID } from "@app/Constants";
import { useAllApplications } from "@app/queries/report";
import { SimpleSelect, OptionWithValue } from "@app/shared/components/simple-select";
import { SimplePagination } from "@app/shared/components/table-controls/simple-pagination";
import { ConditionalTableBody } from "@app/shared/components/table-controls/conditional-table-body";
import { useTable, useTableControls, useToolbar } from "@app/shared/hooks";

const compareToByColumn = (
  a: DependencyDto,
  b: DependencyDto,
  columnIndex?: number
) => {
  switch (columnIndex) {
    case 1: // name
      return a.name.localeCompare(b.name);
    case 3: // version
      return a.version === b.version ? 0 : 1;
    case 4: // indirect
      return a.indirect === b.indirect ? 0 : 1;
    default:
      return 0;
  }
};

const toOption = (option: string | ToolbarLabel): OptionWithValue => {
  if (typeof option === "string") {
    const toStringFn = () => option;
    return {
      value: option,
      toString: toStringFn,
      compareTo: (other: string | OptionWithValue) => {
        return typeof other === "string"
          ? toStringFn().toLowerCase().includes(other.toLocaleLowerCase())
          : option === other.value;
      },
    };
  } else {
    const toStringFn = () => option.node as string;
    return {
      value: option.key,
      toString: toStringFn,
      compareTo: (other: string | OptionWithValue) => {
        return typeof other === "string"
          ? toStringFn().toLowerCase().includes(other.toLowerCase())
          : option.key === other.value;
      },
    };
  }
};

const toToolbarLabel = (option: OptionWithValue): ToolbarLabel => {
  return {
    key: option.value,
    node: option.toString(),
  };
};

export interface IDependenciesTableProps {
  applicationId?: string;
}

export const DependenciesTable: React.FC<IDependenciesTableProps> = ({
  applicationId,
}) => {
  const allApplicationsQuery = useAllApplications();

  // Filters
  const [filterText, setFilterText] = useState("");
  const { filters, setFilter, removeFilter, clearAllFilters } = useToolbar<
    "labels" | "relationship",
    ToolbarLabel
  >();

  const debouncedFilterText = useDebounce<string>(filterText, 250);
  const debouncedFilters = useDebounce<
    Map<"labels" | "relationship", ToolbarLabel[]>
  >(filters, 100);

  const dependencies = useMemo(() => {
    if (!allApplicationsQuery.data || applicationId === undefined) {
      return [];
    }
    return applicationId === ALL_APPLICATIONS_ID
      ? allApplicationsQuery.data?.flatMap((a) => a.dependencies || [])
      : allApplicationsQuery.data?.find((f) => f.id === applicationId)
          ?.dependencies || [];
  }, [allApplicationsQuery.data, applicationId]);

  const allLabels: string[] = useMemo(() => {
    return Array.from(new Set(dependencies?.flatMap((d) => d.labels)));
  }, [dependencies]);

  // Rows

  const {
    page: currentPage,
    sortBy: currentSortBy,
    changePage: onPageChange,
    changeSortBy: onChangeSortBy,
  } = useTableControls();

  const filterItem = useCallback(
    (item: DependencyDto) => {
      let isFilterTextFilterCompliant = true;
      if (debouncedFilterText && debouncedFilterText.trim().length > 0) {
        isFilterTextFilterCompliant =
          item.name.toLowerCase().indexOf(debouncedFilterText.toLowerCase()) !==
          -1;
      }

      let isLabelFilterCompliant = true;
      const selectedLabels = debouncedFilters.get("labels") || [];
      if (selectedLabels.length > 0) {
        isLabelFilterCompliant = selectedLabels.some((f) =>
          item.labels?.includes(f.key)
        );
      }

      let isRelationshipFilterCompliant = true;
      const selectedRelation = debouncedFilters.get("relationship") || [];
      if (selectedRelation.length > 0) {
        isLabelFilterCompliant = selectedRelation.some(
          (f) =>
            (f.key === "Direct" && !item.indirect) ||
            (f.key === "Indirect" && item.indirect)
        );
      }

      return (
        isFilterTextFilterCompliant &&
        isLabelFilterCompliant &&
        isRelationshipFilterCompliant
      );
    },
    [debouncedFilterText, debouncedFilters]
  );

  const { pageItems, filteredItems } = useTable<DependencyDto>({
    items: dependencies,
    currentPage,
    currentSortBy,
    compareToByColumn,
    filterItem,
  });

  // Reset pagination when application change
  useEffect(() => {
    onPageChange({ page: 1, perPage: currentPage.perPage });
  }, [applicationId, onPageChange, currentPage.perPage]);

  return (
    <>
      {applicationId === undefined ? (
        <Bullseye>
          <EmptyState headingLevel="h4" icon={ArrowUpIcon} titleText="Select an application">
            <EmptyStateBody>
              Select an application whose data you want to get access to.
            </EmptyStateBody>
          </EmptyState>
        </Bullseye>
      ) : (
        <>
          <Toolbar
            className="pf-m-toggle-group-container"
            collapseListedFiltersBreakpoint="xl"
            clearAllFilters={clearAllFilters}
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
                <ToolbarFilter
                  labels={filters.get("labels")}
                  deleteLabel={(
                    category: string | ToolbarLabelGroup,
                    chip: ToolbarLabel | string
                  ) => removeFilter("labels", chip)}
                  deleteLabelGroup={() => setFilter("labels", [])}
                  categoryName={{ key: "labels", name: "Labels" }}
                >
                  <SimpleSelect
                    maxHeight={300}
                    variant="checkbox"
                    aria-label="labels"
                    aria-labelledby="labels"
                    placeholderText="Labels"
                    value={filters.get("labels")?.map(toOption)}
                    options={allLabels.map(toOption)}
                    onChange={(option) => {
                      const optionValue = option as OptionWithValue<string>;

                      const elementExists = (
                        filters.get("labels") || []
                      ).some((f) => f.key === optionValue.value);
                      let newElements: ToolbarLabel[];
                      if (elementExists) {
                        newElements = (filters.get("labels") || []).filter(
                          (f) => f.key !== optionValue.value
                        );
                      } else {
                        newElements = [
                          ...(filters.get("labels") || []),
                          toToolbarLabel(optionValue),
                        ];
                      }

                      setFilter("labels", newElements);
                    }}
                    hasInlineFilter
                    onClear={() => setFilter("labels", [])}
                  />
                </ToolbarFilter>
                <ToolbarFilter
                  labels={filters.get("relationship")}
                  deleteLabel={(
                    category: string | ToolbarLabelGroup,
                    chip: ToolbarLabel | string
                  ) => removeFilter("relationship", chip)}
                  deleteLabelGroup={() => setFilter("relationship", [])}
                  categoryName={{ key: "relationship", name: "Relation" }}
                >
                  <SimpleSelect
                    maxHeight={300}
                    variant="checkbox"
                    aria-label="relationship"
                    aria-labelledby="relationship"
                    placeholderText="Relation"
                    value={filters.get("relationship")?.map(toOption)}
                    options={["Direct", "Indirect"].map(toOption)}
                    onChange={(option) => {
                      const optionValue = option as OptionWithValue<string>;

                      const elementExists = (
                        filters.get("relationship") || []
                      ).some((f) => f.key === optionValue.value);
                      let newElements: ToolbarLabel[];
                      if (elementExists) {
                        newElements = (
                          filters.get("relationship") || []
                        ).filter((f) => f.key !== optionValue.value);
                      } else {
                        newElements = [
                          ...(filters.get("relationship") || []),
                          toToolbarLabel(optionValue),
                        ];
                      }

                      setFilter("relationship", newElements);
                    }}
                    hasInlineFilter
                    onClear={() => setFilter("relationship", [])}
                  />
                </ToolbarFilter>
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
                  width={50}
                  sort={{
                    columnIndex: 1,
                    sortBy: { ...currentSortBy },
                    onSort: onChangeSortBy,
                  }}
                  modifier="truncate"
                >
                  Name
                </Th>
                <Th width={30}>Labels</Th>
                <Th width={10} modifier="truncate">
                  Version
                </Th>
                <Th
                  width={10}
                  sort={{
                    columnIndex: 4,
                    sortBy: { ...currentSortBy },
                    onSort: onChangeSortBy,
                  }}
                  modifier="truncate"
                >
                  Relation
                </Th>
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
                      <Td>{item.name}</Td>
                      <Td>
                        <Split hasGutter>
                          {item.labels?.map((label, index) => (
                            <SplitItem key={index}>
                              <Label isCompact color="blue">
                                {label.replace("konveyor.io/source=", "")}
                              </Label>
                            </SplitItem>
                          ))}
                        </Split>
                      </Td>
                      <Td>{item.version}</Td>
                      <Td>{item.indirect ? "Indirect" : "Direct"}</Td>
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
        </>
      )}
    </>
  );
};
