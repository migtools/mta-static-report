import React from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Spinner,
} from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { Tbody, Td, Tr } from '@patternfly/react-table';

export interface IConditionalTableBodyProps {
  numRenderedColumns: number;
  isLoading?: boolean;
  isError?: boolean;
  isNoData?: boolean;
  errorEmptyState?: React.ReactNode;
  noDataEmptyState?: React.ReactNode;
  children: React.ReactNode;
}

export const ConditionalTableBody: React.FC<IConditionalTableBodyProps> = ({
  numRenderedColumns,
  isLoading = false,
  isError = false,
  isNoData = false,
  errorEmptyState = null,
  noDataEmptyState = null,
  children,
}) => {
  const error = (
    <EmptyState
      variant={EmptyStateVariant.sm}
      icon={ExclamationCircleIcon}
      status="danger"
      headingLevel="h2"
      titleText="Unable to connect"
    >
      <EmptyStateBody>
        There was an error retrieving data. Check your connection and try again.
      </EmptyStateBody>
    </EmptyState>
  );

  const noData = (
    <EmptyState
      variant={EmptyStateVariant.sm}
      icon={CubesIcon}
      headingLevel="h2"
      titleText="No data available"
    >
      <EmptyStateBody>No data available to be shown here.</EmptyStateBody>
    </EmptyState>
  );

  return (
    <>
      {isLoading ? (
        <Tbody>
          <Tr>
            <Td colSpan={numRenderedColumns}>
              <Bullseye>
                <Spinner size="xl" />
              </Bullseye>
            </Td>
          </Tr>
        </Tbody>
      ) : isError ? (
        <Tbody aria-label="Table error">
          <Tr>
            <Td colSpan={numRenderedColumns}>
              <Bullseye>{errorEmptyState || error}</Bullseye>
            </Td>
          </Tr>
        </Tbody>
      ) : isNoData ? (
        <Tbody aria-label="Table no data">
          <Tr>
            <Td colSpan={numRenderedColumns}>
              <Bullseye>{noDataEmptyState || noData}</Bullseye>
            </Td>
          </Tr>
        </Tbody>
      ) : (
        children
      )}
    </>
  );
};
