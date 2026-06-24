import { useSelectionState } from "@app/shared/hooks/useSelectionState";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { RuleErrorProcessed } from "@app/models/api-enriched";
import { ConditionalTableBody } from "@app/shared/components/table-controls/conditional-table-body";

export interface IRuleErrorsProps {
  ruleErrors: RuleErrorProcessed[];
}

const areRowsEqual = (a: RuleErrorProcessed, b: RuleErrorProcessed) =>
  a.id === b.id;

export function RuleErrors({ ruleErrors }: IRuleErrorsProps) {
  const {
    isItemSelected: isRowExpanded,
    toggleItemSelected: toggleRowExpanded,
  } = useSelectionState<RuleErrorProcessed>({
    items: ruleErrors,
    isEqual: areRowsEqual,
  });

  const showApplicationColumn =
    new Set(ruleErrors.map((ruleError) => ruleError.appID)).size > 1;

  const numColumns = showApplicationColumn ? 4 : 3;

  return (
    <Table isExpandable>
      <Thead>
        <Tr>
          <Th></Th>
          <Th width={40}>Rule</Th>
          {showApplicationColumn && <Th width={20}>Application</Th>}
          <Th width={25}>Ruleset</Th>
        </Tr>
      </Thead>
      <ConditionalTableBody
        isNoData={ruleErrors.length === 0}
        numRenderedColumns={numColumns}
      >
        {ruleErrors.map((ruleError, rowIndex) => (
          <Tbody key={ruleError.id} isExpanded={isRowExpanded(ruleError)}>
            <Tr>
              <Td
                expand={{
                  rowIndex,
                  isExpanded: isRowExpanded(ruleError),
                  onToggle: () => toggleRowExpanded(ruleError),
                }}
              />
              <Td dataLabel="Rule">{ruleError.ruleID}</Td>
              {showApplicationColumn && (
                <Td dataLabel="Application">{ruleError.applicationName}</Td>
              )}
              <Td dataLabel="Ruleset">{ruleError.rulesetName}</Td>
            </Tr>
            {isRowExpanded(ruleError) ? (
              <Tr isExpanded>
                <Td colSpan={numColumns}>
                  <pre
                    className="pf-v6-u-m-sm"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: 0,
                      fontFamily: "inherit",
                      fontSize: "inherit",
                    }}
                  >
                    {ruleError.message}
                  </pre>
                </Td>
              </Tr>
            ) : null}
          </Tbody>
        ))}
      </ConditionalTableBody>
    </Table>
  );
};
