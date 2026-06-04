import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Select,
  SelectOption,
  SelectList,
  SelectProps,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
} from "@patternfly/react-core";

import "./simple-context.css";

export interface Context {
  key: string;
  label: string;
}

interface ISimpleContext {
  allContexts: Context[];
  currentContext?: Context;
  selectContext: (key: string) => void;
}

const SimpleContext = createContext<ISimpleContext>({
  allContexts: [],
  currentContext: undefined,
  selectContext: () => undefined,
});

interface ISimpleContextProviderProps {
  allContexts: Context[];
  children: React.ReactNode;
}

export const SimpleContextProvider: React.FunctionComponent<
  ISimpleContextProviderProps
> = ({ allContexts, children }: ISimpleContextProviderProps) => {
  const [selectedContextKey, setSelectedContextKey] = useState<string>();

  return (
    <SimpleContext.Provider
      value={{
        allContexts,
        currentContext: allContexts.find((f) => f.key === selectedContextKey),
        selectContext: (key: string) => setSelectedContextKey(key),
      }}
    >
      {children}
    </SimpleContext.Provider>
  );
};

export const useSimpleContext = (): ISimpleContext => useContext(SimpleContext);

// Helpers components

export interface ISimpleContextSelectorProps {
  contextKeyFromURL?: string;
  props?: Omit<SelectProps, "isOpen" | "onOpenChange" | "toggle">;
  onChange: (context: Context) => void;
}

export const SimpleContextSelector: React.FC<ISimpleContextSelectorProps> = ({
  contextKeyFromURL,
  props,
  onChange,
}) => {
  const { allContexts, currentContext, selectContext } = useSimpleContext();

  useEffect(() => {
    const currentContextKey = contextKeyFromURL ?? currentContext?.key;

    if (typeof currentContextKey === "string") {
      selectContext(currentContextKey);
    }
  }, [contextKeyFromURL, currentContext, selectContext]);

  const [filterText, setFilterText] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const onSelect = (value: Context) => {
    setIsSelectorOpen(false);
    selectContext(value.key);
    onChange(value);
  };

  return (
    <Select
      isOpen={isSelectorOpen}
      selected={currentContext?.key}
      onSelect={(_event, itemId) => {
        const found = allContexts.find((c) => c.key === String(itemId));
        if (found) onSelect(found);
      }}
      onOpenChange={setIsSelectorOpen}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsSelectorOpen((prev) => !prev)}
          isExpanded={isSelectorOpen}
          isFullWidth
          className="firstChildBordered"
        >
          {currentContext?.label}
        </MenuToggle>
      )}
      {...props}
    >
      <TextInputGroup>
        <TextInputGroupMain
          value={filterText}
          onChange={(_, value) => setFilterText(value)}
        />
      </TextInputGroup>
      <SelectList>
        {allContexts
          .filter(
            (f) =>
              f.label.toLowerCase().indexOf(filterText.toLowerCase()) !== -1
          )
          .map((item, index) => (
            <SelectOption key={index} value={item.key}>
              {item.label}
            </SelectOption>
          ))}
      </SelectList>
    </Select>
  );
};
