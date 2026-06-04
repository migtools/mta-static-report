import React, { useState } from 'react';

import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  Badge,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

export interface OptionWithValue<T = string> {
  value: T;
  toString: () => string;
  compareTo?: (selectOption: any) => boolean;
  props?: Partial<any>;
}

type OptionLike = string | OptionWithValue;

export interface ISimpleSelectProps {
  "aria-label": string;
  "aria-labelledby"?: string;
  onChange: (selection: OptionLike) => void;
  options: OptionLike[];
  value?: OptionLike | OptionLike[];
  variant?: "default" | "checkbox";
  placeholderText?: string;
  maxHeight?: number;
  hasInlineFilter?: boolean;
  onClear?: () => void;
  toggleIcon?: React.ReactNode;
  width?: number;
}

const optionToString = (option: OptionLike): string => {
  if (typeof option === "string") return option;
  return option.toString();
};

const optionToId = (option: OptionLike): string => {
  if (typeof option === "string") return option;
  return String(option.value);
};

const isOptionSelected = (
  option: OptionLike,
  selected: OptionLike | OptionLike[] | undefined
): boolean => {
  if (!selected) return false;
  const selectedArr = Array.isArray(selected) ? selected : [selected];
  return selectedArr.some((s) => {
    if (typeof option === "string" && typeof s === "string") {
      return option === s;
    }
    if (typeof option !== "string" && typeof s !== "string") {
      if (option.compareTo) return option.compareTo(s);
      return option.toString() === s.toString();
    }
    return optionToString(option) === optionToString(s);
  });
};

export const SimpleSelect: React.FC<ISimpleSelectProps> = ({
  onChange,
  options,
  value,
  variant = "default",
  placeholderText = "Select...",
  maxHeight,
  hasInlineFilter,
  onClear,
  toggleIcon,
  width,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  const isCheckbox = variant === "checkbox";

  const filteredOptions = hasInlineFilter && filterValue
    ? options.filter((o) =>
        optionToString(o).toLowerCase().includes(filterValue.toLowerCase())
      )
    : options;

  const selectedCount = Array.isArray(value) ? value.length : value ? 1 : 0;

  const onSelectHandler = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: string | number | undefined
  ) => {
    const selected = options.find((o) => optionToId(o) === String(itemId));
    if (selected) {
      onChange(selected);
    }
    if (!isCheckbox) {
      setIsOpen(false);
    }
  };

  const toggleText = isCheckbox
    ? placeholderText
    : value
    ? Array.isArray(value)
      ? value.map(optionToString).join(", ")
      : optionToString(value)
    : placeholderText;

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen((prev) => !prev)}
      isExpanded={isOpen}
      style={width ? { width: `${width}px` } as React.CSSProperties : undefined}
      icon={toggleIcon}
    >
      {toggleText}
      {isCheckbox && selectedCount > 0 && (
        <>
          {" "}
          <Badge isRead>{selectedCount}</Badge>
        </>
      )}
    </MenuToggle>
  );

  return (
    <Select
      aria-label={props["aria-label"]}
      isOpen={isOpen}
      selected={
        Array.isArray(value)
          ? value.map(optionToId)
          : value
          ? optionToId(value)
          : undefined
      }
      onSelect={onSelectHandler}
      onOpenChange={(open) => setIsOpen(open)}
      toggle={toggle}
      role={isCheckbox ? "menu" : "listbox"}
      maxMenuHeight={maxHeight ? `${maxHeight}px` : undefined}
      isScrollable={!!maxHeight}
    >
      {hasInlineFilter && (
        <TextInputGroup>
          <TextInputGroupMain
            value={filterValue}
            onChange={(_event, val) => setFilterValue(val)}
            placeholder="Filter..."
          />
          {filterValue && (
            <TextInputGroupUtilities>
              <Button
                variant="plain"
                onClick={() => setFilterValue("")}
                aria-label="Clear filter"
              >
                <TimesIcon />
              </Button>
            </TextInputGroupUtilities>
          )}
        </TextInputGroup>
      )}
      <SelectList>
        {filteredOptions.map((option, index) => {
          const label = optionToString(option);
          const selected = isOptionSelected(option, value);
          return (
            <SelectOption
              key={`${index}-${label}`}
              value={optionToId(option)}
              hasCheckbox={isCheckbox}
              isSelected={selected}
            >
              {label}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};
