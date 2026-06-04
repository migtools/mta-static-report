import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useSelectionState } from "@app/shared/hooks/useSelectionState";
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  SearchInput,
  Split,
  SplitItem,
  Tab,
  Tabs,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarItem,
  ToolbarItemVariant,
  ToolbarLabel,
  ToolbarLabelGroup,
  ToolbarToggleGroup,
} from "@patternfly/react-core";
import ArrowUpIcon from "@patternfly/react-icons/dist/esm/icons/arrow-up-icon";
import FilterIcon from "@patternfly/react-icons/dist/esm/icons/filter-icon";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { useDebounce } from "usehooks-ts";

import { compareByCategoryFn } from "@app/models/api-enriched";
import { ALL_APPLICATIONS_ID } from "@app/Constants";
import { IssueProcessed } from "@app/models/api-enriched";
import { useAllApplications, useCodeSnip } from "@app/queries/report";
import { SimpleSelect, OptionWithValue } from "@app/shared/components/simple-select";
import { FileEditor } from "@app/shared/components/file-editor";
import { ConditionalTableBody } from "@app/shared/components/table-controls/conditional-table-body";
import { SimplePagination } from "@app/shared/components/table-controls/simple-pagination";
import {
  useModal,
  useTable,
  useTableControls,
  useToolbar,
} from "@app/shared/hooks";

import { IssueOverview } from "./components/issue-overview";
import { DispersedFile } from "@app/models/file";

export interface TableData extends IssueProcessed { }

const areRowsEquals = (a: TableData, b: TableData) => {
  return a.id === b.id;
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

export const compareByColumnIndex = (
  a: IssueProcessed,
  b: IssueProcessed,
  columnIndex?: number
) => {
  switch (columnIndex) {
    case 1: // name
      return a.id.localeCompare(b.id);
    case 6: // Total incidents
      return a.totalIncidents - b.totalIncidents;
    case 7: // Total storypoints
      return a.totalEffort - b.totalEffort;
    default:
      return 0;
  }
};

export const compareByColumnIndexInsightsMode = (
  a: IssueProcessed,
  b: IssueProcessed,
  columnIndex?: number
) => {
  switch (columnIndex) {
    case 1: // name
      return a.id.localeCompare(b.id);
    case 4: // Total incidents
      return a.totalIncidents - b.totalIncidents;
    case 5: // Total storypoints
      return a.totalEffort - b.totalEffort;
    default:
      return 0;
  }
};

interface SelectedFile {
  file: DispersedFile;
  issue: IssueProcessed;
}

export interface IViolationsTableProps {
  applicationId?: string;
  insightsMode?: boolean;
}

export const ViolationsTable: React.FC<IViolationsTableProps> = ({
  applicationId,
  insightsMode,
}) => {
  const allApplications = useAllApplications();


  const [fileEditorTabId, setFileEditorTabId] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<DispersedFile>({} as DispersedFile);

  const codeSnipQuery = useCodeSnip(selectedFile, fileEditorTabId);

  const codeSnip: string = useMemo(() => codeSnipQuery.data || "", [codeSnipQuery.data])

  // Filters
  const [filterText, setFilterText] = useState("");
  const { filters, setFilter, removeFilter, clearAllFilters } = useToolbar<
    "category" | "effort" | "sourceTechnology" | "targetTechnology",
    ToolbarLabel
  >();

  const debouncedFilterText = useDebounce<string>(filterText, 250);
  const debouncedFilters = useDebounce<
    Map<
      "category" | "effort" | "sourceTechnology" | "targetTechnology",
      ToolbarLabel[]
    >
  >(filters, 100);

  const {
    data: fileModalData,
    isOpen: isFileModalOpen,
    action: fileModalAction,
    open: openFileModal,
    close: closeFileModal,
  } = useModal<"showFile", SelectedFile>();


  const issues: TableData[] = useMemo(() => {
    if (!allApplications.data || applicationId === undefined) {
      return [];
    }

    return applicationId === ALL_APPLICATIONS_ID
      ? (insightsMode ? allApplications.data?.flatMap((a) => a.insights) : 
        allApplications.data?.flatMap((a) => a.issues))
      : (insightsMode ? (allApplications.data?.find((f) => f.id === applicationId)?.insights || []) : 
        allApplications.data?.find((f) => f.id === applicationId)?.issues || []);
  }, [allApplications.data, insightsMode, applicationId]);

  const technologies = useMemo(() => {
    const sources = new Set<string>();
    const targets = new Set<string>();

    issues.forEach((elem) => {
      elem.sourceTechnologies?.forEach((e) => sources.add(e));
      elem.targetTechnologies?.forEach((e) => targets.add(e));
    });

    return { source: Array.from(sources), target: Array.from(targets) };
  }, [issues]);

  const categories = useMemo(() => {
    const allCategories = (issues || []).map((i) => i.category);
    return Array.from(new Set(allCategories)).sort(
      compareByCategoryFn((e) => e)
    );
  }, [issues]);

  const efforts = useMemo(() => {
    const allEfforts = (issues || []).map((e) => e.effort.toString());
    return Array.from(new Set(allEfforts)).sort();
  }, [issues]);

  const {
    isItemSelected: isRowExpanded,
    toggleItemSelected: toggleRowExpanded,
  } = useSelectionState<TableData>({
    items: issues,
    isEqual: areRowsEquals,
  });

  const {
    page: currentPage,
    sortBy: currentSortBy,
    changePage: onPageChange,
    changeSortBy: onChangeSortBy,
  } = useTableControls();

  const filterItem = useCallback(
    (item: TableData) => {
      let isFilterTextFilterCompliant = true;
      if (debouncedFilterText && debouncedFilterText.trim().length > 0) {
        isFilterTextFilterCompliant =
          item.name.toLowerCase().indexOf(debouncedFilterText.toLowerCase()) !==
          -1;
      }

      let isCategoryFilterCompliant = true;
      const selectedCategories = debouncedFilters.get("category") || [];
      if (selectedCategories.length > 0) {
        isCategoryFilterCompliant = selectedCategories.some(
          (f) => item.category === f.key
        );
      }

      let isLevelOfEffortCompliant = true;
      const selectedLevelOfEfforts = debouncedFilters.get("effort") || [];
      if (selectedLevelOfEfforts.length > 0) {
        isLevelOfEffortCompliant = selectedLevelOfEfforts.some(
          (f) => item.effort.toString() === f.key
        );
      }

      let isSourceCompliant = true;
      const selectedSources = debouncedFilters.get("sourceTechnology") || [];
      if (selectedSources.length > 0) {
        isSourceCompliant = selectedSources.some((f) => {
          return item.sourceTechnologies?.includes(f.key);
        });
      }

      let isTargetCompliant = true;
      const selectedTargets = debouncedFilters.get("targetTechnology") || [];
      if (selectedTargets.length > 0) {
        isTargetCompliant = selectedTargets.some((f) => {
          return item.targetTechnologies?.includes(f.key);
        });
      }

      return (
        isFilterTextFilterCompliant &&
        isCategoryFilterCompliant &&
        isLevelOfEffortCompliant &&
        isSourceCompliant &&
        isTargetCompliant
      );
    },
    [debouncedFilterText, debouncedFilters]
  );

  const { pageItems, filteredItems } = useTable<TableData>({
    items: issues,
    currentPage: currentPage,
    currentSortBy: currentSortBy,
    compareToByColumn: insightsMode ? compareByColumnIndexInsightsMode : compareByColumnIndex,
    filterItem: filterItem,
  });

  // Reset pagination when application change
  useEffect(() => {
    onPageChange({ page: 1, perPage: currentPage.perPage });
  }, [
    debouncedFilterText,
    debouncedFilters,
    onPageChange,
    currentPage.perPage,
  ]);

  return (
    <>
      <>
        {applicationId === undefined ? (
          <Bullseye>
            <EmptyState icon={ArrowUpIcon} titleText="Select an application" headingLevel="h4">
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
                  {
                    insightsMode ? (<></>) : (
                      <ToolbarFilter
                        labels={filters.get("category")}
                        deleteLabel={(
                          category: string | ToolbarLabelGroup,
                          label: ToolbarLabel | string
                        ) => removeFilter("category", label)}
                        deleteLabelGroup={() => setFilter("category", [])}
                        categoryName={{ key: "category", name: "Category" }}
                      >
                        <SimpleSelect
                          maxHeight={300}
                          variant="checkbox"
                          aria-label="category"
                          aria-labelledby="category"
                          placeholderText="Category"
                          value={filters.get("category")?.map(toOption)}
                          options={categories.map(toOption)}
                          onChange={(option) => {
                            const optionValue = option as OptionWithValue<string>;

                            const elementExists = (
                              filters.get("category") || []
                            ).some((f) => f.key === optionValue.value);
                            let newElements: ToolbarLabel[];
                            if (elementExists) {
                              newElements = (
                                filters.get("category") || []
                              ).filter((f) => f.key !== optionValue.value);
                            } else {
                              newElements = [
                                ...(filters.get("category") || []),
                                toToolbarLabel(optionValue),
                              ];
                            }

                            setFilter("category", newElements);
                          }}
                          hasInlineFilter
                          onClear={() => setFilter("category", [])}
                        />
                      </ToolbarFilter>
                    )
                  }
                  {
                    insightsMode ? (<></>) : (
                      <ToolbarFilter
                        labels={filters.get("effort")}
                        deleteLabel={(
                          category: string | ToolbarLabelGroup,
                          label: ToolbarLabel | string
                        ) => removeFilter("effort", label)}
                        deleteLabelGroup={() => setFilter("effort", [])}
                        categoryName={{
                          key: "effort",
                          name: "Effort",
                        }}
                      >
                        <SimpleSelect
                          maxHeight={300}
                          variant="checkbox"
                          aria-label="effort"
                          aria-labelledby="effort"
                          placeholderText="Effort"
                          value={filters.get("effort")?.map(toOption)}
                          options={efforts.map(toOption)}
                          onChange={(option) => {
                            const optionValue = option as OptionWithValue<string>;

                            const elementExists = (
                              filters.get("effort") || []
                            ).some((f) => f.key === optionValue.value);
                            let newElements: ToolbarLabel[];
                            if (elementExists) {
                              newElements = (filters.get("effort") || []).filter(
                                (f) => f.key !== optionValue.value
                              );
                            } else {
                              newElements = [
                                ...(filters.get("effort") || []),
                                toToolbarLabel(optionValue),
                              ];
                            }

                            setFilter("effort", newElements);
                          }}
                          hasInlineFilter
                          onClear={() => setFilter("effort", [])}
                        />
                      </ToolbarFilter>
                    )
                  }
                  {technologies.source.length > 0 && (
                    <ToolbarFilter
                      labels={filters.get("sourceTechnology")}
                      deleteLabel={(
                        category: string | ToolbarLabelGroup,
                        label: ToolbarLabel | string
                      ) => removeFilter("sourceTechnology", label)}
                      deleteLabelGroup={() =>
                        setFilter("sourceTechnology", [])
                      }
                      categoryName={{
                        key: "sourceTechnology",
                        name: "Source",
                      }}
                    >
                      <SimpleSelect
                        maxHeight={300}
                        variant="checkbox"
                        aria-label="sourceTechnology"
                        aria-labelledby="sourceTechnology"
                        placeholderText="Source"
                        value={filters.get("sourceTechnology")?.map(toOption)}
                        options={technologies.source.map(toOption)}
                        onChange={(option) => {
                          const optionValue =
                            option as OptionWithValue<string>;

                          const elementExists = (
                            filters.get("sourceTechnology") || []
                          ).some((f) => f.key === optionValue.value);
                          let newElements: ToolbarLabel[];
                          if (elementExists) {
                            newElements = (
                              filters.get("sourceTechnology") || []
                            ).filter((f) => f.key !== optionValue.value);
                          } else {
                            newElements = [
                              ...(filters.get("sourceTechnology") || []),
                              toToolbarLabel(optionValue),
                            ];
                          }

                          setFilter("sourceTechnology", newElements);
                        }}
                        hasInlineFilter
                        onClear={() => setFilter("sourceTechnology", [])}
                      />
                    </ToolbarFilter>
                  )}
                  {technologies.target.length > 0 && (
                    <ToolbarFilter
                      labels={filters.get("targetTechnology")}
                      deleteLabel={(
                        category: string | ToolbarLabelGroup,
                        label: ToolbarLabel | string
                      ) => removeFilter("targetTechnology", label)}
                      deleteLabelGroup={() =>
                        setFilter("targetTechnology", [])
                      }
                      categoryName={{
                        key: "targetTechnology",
                        name: "Target",
                      }}
                    >
                      <SimpleSelect
                        maxHeight={300}
                        variant="checkbox"
                        aria-label="targetTechnology"
                        aria-labelledby="targetTechnology"
                        placeholderText="Target"
                        value={filters.get("targetTechnology")?.map(toOption)}
                        options={technologies.target.map(toOption)}
                        onChange={(option) => {
                          const optionValue =
                            option as OptionWithValue<string>;

                          const elementExists = (
                            filters.get("targetTechnology") || []
                          ).some((f) => f.key === optionValue.value);
                          let newElements: ToolbarLabel[];
                          if (elementExists) {
                            newElements = (
                              filters.get("targetTechnology") || []
                            ).filter((f) => f.key !== optionValue.value);
                          } else {
                            newElements = [
                              ...(filters.get("targetTechnology") || []),
                              toToolbarLabel(optionValue),
                            ];
                          }

                          setFilter("targetTechnology", newElements);
                        }}
                        hasInlineFilter
                        onClear={() => setFilter("targetTechnology", [])}
                      />
                    </ToolbarFilter>
                  )}
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

            <Table isExpandable>
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th
                    width={35}
                    sort={{
                      columnIndex: 1,
                      sortBy: { ...currentSortBy },
                      onSort: onChangeSortBy,
                    }}
                  >
                    Issue
                  </Th>
                  {
                    insightsMode ? (<></>) : (<Th width={10}>Category</Th>)
                  }
                  <Th width={10} modifier="wrap">
                    Source
                  </Th>
                  <Th width={10} modifier="wrap">
                    Target
                  </Th>
                  {
                    insightsMode ? (<></>) : (<>
                      <Th width={15} modifier="truncate">
                        Effort
                      </Th></>)
                  }
                  {
                    insightsMode ? (                      
                    <Th
                      width={10}
                      sort={{
                        columnIndex: 6,
                        sortBy: { ...currentSortBy },
                        onSort: onChangeSortBy,
                      }}
                    >
                      Total occurrences
                    </Th>) : (
                      <Th
                        width={10}
                        sort={{
                          columnIndex: 6,
                          sortBy: { ...currentSortBy },
                          onSort: onChangeSortBy,
                        }}
                      >
                        Total incidents
                      </Th>
                    )
                  }
                  {
                    insightsMode ? (<></>) : (
                      <Th
                        width={10}
                        sort={{
                          columnIndex: 7,
                          sortBy: { ...currentSortBy },
                          onSort: onChangeSortBy,
                        }}
                      >
                        Total effort
                      </Th>
                    )
                  }

                </Tr>
              </Thead>
              <ConditionalTableBody
                isNoData={filteredItems.length === 0}
                numRenderedColumns={10}
              >
                {pageItems?.map((item, rowIndex) => {
                  return (
                    <Tbody key={rowIndex} isExpanded={isRowExpanded(item)}>
                      <Tr>
                        <Td
                          expand={{
                            rowIndex,
                            isExpanded: isRowExpanded(item),
                            onToggle: () => toggleRowExpanded(item),
                          }}
                        />
                        <Td>{item.name}</Td>
                        {insightsMode ? (<></>) : (<Td>{item.category}</Td>)}
                        <Td>
                          <Split hasGutter>
                            {item.sourceTechnologies?.map((technology) => (
                              <SplitItem key={technology}>
                                <Label isCompact color="blue">
                                  {technology}
                                </Label>
                              </SplitItem>
                            ))}
                          </Split>
                        </Td>
                        <Td>
                          <Split hasGutter>
                            {item.targetTechnologies?.map((technology) => (
                              <SplitItem key={technology}>
                                <Label isCompact color="blue">
                                  {technology}
                                </Label>
                              </SplitItem>
                            ))}
                          </Split>
                        </Td>
                        {insightsMode ? (<></>) : (<Td>{item.effort.toString()}</Td>)}
                        <Td>{item.totalIncidents}</Td>
                        {insightsMode ? (<></>) : (<Td>{item.totalEffort}</Td>)}
                      </Tr>
                      {isRowExpanded(item) ? (
                        <Tr isExpanded>
                          <Td colSpan={9}>
                            <div className="pf-v6-u-m-sm">
                              <IssueOverview
                                issue={item}
                                onShowFile={(file, issue) => {
                                  openFileModal("showFile", {
                                    file,
                                    issue,
                                  })
                                  setSelectedFile(file)
                                }
                                }
                              />
                            </div>
                          </Td>
                        </Tr>
                      ) : null}
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

      <Modal
        isOpen={isFileModalOpen && fileModalAction === "showFile"}
        onClose={closeFileModal}
        variant="default"
        position="top"
        disableFocusTrap
      >
        <ModalHeader title={`File ${fileModalData?.file?.name || ""}`} />
        <ModalBody>
          {Object.keys(fileModalData?.file?.incidents || {}).length > 1 ? (
            <Tabs
              activeKey={fileEditorTabId}
              onSelect={(_event, tabKey) =>
                setFileEditorTabId(tabKey as number)}>
              {
                Object.values(fileModalData?.file?.incidents || {}).flatMap((incidents, idx) => (
                  <Tab
                    key={idx}
                    eventKey={idx}
                    title={`Line #${fileModalData?.file.ranges[idx * 2]} - #${fileModalData?.file.ranges[idx * 2 + 1]}`} // TODO i18n
                  >
                    {fileEditorTabId === idx ? (
                      <FileEditor
                        name={fileModalData?.file.name || ""}
                        displayName={fileModalData?.file.displayName || ""}
                        codeSnip={codeSnip}
                        isLoading={codeSnipQuery.isLoading || codeSnipQuery.isFetching}
                        issue={fileModalData?.issue || {} as IssueProcessed}
                        incidents={incidents}
                      />
                    ) : null}
                  </Tab>))
              }
            </Tabs>
          ) : (
            <FileEditor
              name={fileModalData?.file.name || ""}
              displayName={fileModalData?.file.displayName || ""}
              codeSnip={codeSnip}
              isLoading={codeSnipQuery.isLoading || codeSnipQuery.isFetching}
              issue={fileModalData?.issue || {} as IssueProcessed}
              incidents={fileModalData?.file?.incidents[0] || []} />
          )}
        </ModalBody>
        <ModalFooter>
          <Button key="close" variant="primary" onClick={closeFileModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
