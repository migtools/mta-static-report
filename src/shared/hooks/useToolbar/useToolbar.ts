import { useState } from 'react';

import { ToolbarLabel } from '@patternfly/react-core';

const getToolbarLabelKey = (value: string | ToolbarLabel) => {
  return typeof value === 'string' ? value : value.key;
};

// Hook

type FilterType = string | ToolbarLabel;

interface HookState<K, T> {
  filters: Map<K, T[]>;
  isPresent: boolean;
  addFilter: (key: K, value: T) => void;
  setFilter: (key: K, value: T[]) => void;
  removeFilter: (key: K, value: FilterType | FilterType[]) => void;
  clearAllFilters: () => void;
}

export const useToolbar = <K, T extends FilterType>(
  initialValue: Map<K, T[]> | (() => Map<K, T[]>) = new Map()
): HookState<K, T> => {
  const [filters, setFilters] = useState<Map<K, T[]>>(initialValue);

  const isPresent =
    Array.from(filters.values()).reduce((previous, current) => [...previous, ...current], [])
      .length > 0;

  const addFilter = (key: K, value: T) => {
    setFilters((current) => {
      const currentLabels = current.get(key) || [];
      return new Map(current).set(key, [...currentLabels, value]);
    });
  };

  const setFilter = (key: K, value: T[]) => {
    setFilters((current) => new Map(current).set(key, value));
  };

  const removeFilter = (key: K, value: FilterType | FilterType[]) => {
    setFilters((current) => {
      let elementsToBeRemoved: FilterType[];
      if (Array.isArray(value)) {
        elementsToBeRemoved = [...value];
      } else {
        elementsToBeRemoved = [value];
      }

      const newValue = (current.get(key) || []).filter((f) => {
        const fkey = getToolbarLabelKey(f);
        return !elementsToBeRemoved.some((r) => {
          const rKey = getToolbarLabelKey(r);
          return fkey === rKey;
        });
      });

      return new Map(current).set(key, newValue);
    });
  };

  const clearAllFilters = () => {
    setFilters((current) => {
      const newVal = new Map(current);
      Array.from(newVal.keys()).forEach((key) => {
        newVal.set(key, []);
      });
      return newVal;
    });
  };

  return {
    filters,
    isPresent,
    addFilter,
    setFilter,
    removeFilter,
    clearAllFilters,
  };
};
