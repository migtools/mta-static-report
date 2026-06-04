import React, { useEffect, useRef, useState } from "react";

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  EmptyState,
  EmptyStateVariant,
} from "@patternfly/react-core";

import {
  CodeEditor,
  CodeEditorProps,
  Language,
} from "@patternfly/react-code-editor";

import InfoAltIcon from "@patternfly/react-icons/dist/esm/icons/info-alt-icon";

import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import { LinkDto } from "@app/api/report";
import { ConditionalRender } from "@app/shared/components/conditional-render";
import { SimpleMarkdown } from "@app/shared/components/simple-markdown";
import { getMarkdown } from "@app/utils/utils";
import { IssueProcessed } from "@app/models/api-enriched";
import { IncidentCoordinates } from "@app/models/file";

const codeLineRegex = /^\s*([0-9]+)( {2})?(.*)$/;

interface IFileEditorProps {
  name: string;
  displayName: string;
  codeSnip: string;
  isLoading: boolean;
  incidents: IncidentCoordinates[];
  issue: IssueProcessed;
  props?: Partial<
    Omit<CodeEditorProps, "ref" | "code" | "options" | "onEditorDidMount">
  >;
}

export const FileEditor: React.FC<IFileEditorProps> = ({
  name,
  displayName,
  codeSnip,
  isLoading,
  incidents,
  issue,
  props,
}) => {
  let absoluteToRelativeLineNum = (lineNum: number) => lineNum;
  let relativeToAbsoluteLineNum = (lineNum: number) => lineNum;
  const codeSnipNumberedLines = codeSnip.split("\n");
  const codeSnipTrimmedLines: string[] = [];
  let codeSnipStartLine = 1;
  codeSnipNumberedLines.forEach((numberedLine, index) => {
    const match = numberedLine.match(codeLineRegex);
    if (match && !isNaN(Number(match[1]))) {
      const lineNum = Number(match[1]);
      if (index === 0) codeSnipStartLine = lineNum;
      const lineCode = match[3] || "";
      codeSnipTrimmedLines.push(lineCode);
    }
  });
  codeSnip = codeSnipTrimmedLines.join("\n");
  absoluteToRelativeLineNum = (lineNum: number) => lineNum - (codeSnipStartLine - 1);
  relativeToAbsoluteLineNum = (lineNum: number) => lineNum + (codeSnipStartLine - 1);

  // Editor
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<typeof monacoEditor>();
  useEffect(() => {
    return () => {
      monacoRef.current?.editor.getModels().forEach((model) => model.dispose());
      editorRef.current?.dispose();
    };
  }, [editorRef, monacoRef]);

  // Disposables
  const [disposables, setDisposables] = useState<monacoEditor.IDisposable[]>(
    []
  );
  useEffect(() => {
    return () => {
      disposables.forEach((disposable) => disposable && disposable.dispose());
    };
  }, [disposables]);

  // const drawerRef = React.useRef<any>();
  // const [isDrawerExpanded, setIsDrawerExpanded] = useState(
  //   incidents ? true : false
  // );
  // const onDrawerExpand = () => {
  //   drawerRef.current && drawerRef.current.focus();
  // };

  const fileExtension = name?.split('.')?.pop();

  /**
   * Adds a hover text to the hint line
   */
  const addHover = (
    monaco: typeof monacoEditor,
    incidents: IncidentCoordinates[],
    links: LinkDto[]
  ) => {
    return incidents.map((inc) => {
      return monaco.languages.registerHoverProvider("*", {
        provideHover: (model, position) => {
          if (position.lineNumber !== absoluteToRelativeLineNum(inc.lineNumber)) {
            return undefined;
          }

          return {
            range: new monaco.Range(inc.lineNumber!, 1, inc.lineNumber!, 1),
            contents: [
              {
                value: getMarkdown(inc.message, links),
              },
            ],
          };
        },
      });
    });
  };

  /**
   * Underlines the hint line
   */
  const addMarkers = (
    monaco: typeof monacoEditor,
    incidents: IncidentCoordinates[]
  ) => {
    const markers = incidents
      .filter((inc) => inc.lineNumber && inc.lineNumber !== 0)
      ?.map((inc) => {
        const marker: monacoEditor.editor.IMarkerData = {
          startLineNumber: absoluteToRelativeLineNum(inc.lineNumber),
          endLineNumber: absoluteToRelativeLineNum(inc.lineNumber),
          startColumn: 0,
          endColumn: 1000,
          message: issue.description,
          severity: monaco.MarkerSeverity.Warning,
        }
        return marker
      })

    const model = monaco.editor.getModels()[0];
    monaco.editor.setModelMarkers(model, "*", markers);
  };

  const onEditorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    editor.layout();
    editor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });

    let newDisposables: monacoEditor.IDisposable[] = [];

    // Add markers
    addMarkers(monaco, incidents);

    // Add hovers
    const hovers = addHover(monaco, incidents, issue.links);
    newDisposables = newDisposables.concat(hovers);

    setDisposables(newDisposables);

    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  return (
    <Drawer isExpanded={true} isInline>
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            isResizable
          >
            <DrawerHead>
              <Card isLarge>
                <CardHeader>
                  <CardTitle>
                    <Content component="h1">{issue.name}</Content>
                    <Content component="small">{issue.ruleID}</Content>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {issue.description && (
                    <SimpleMarkdown
                      children={getMarkdown(
                        issue.description,
                        issue.links,
                      )}
                    />
                  )}
                </CardBody>
              </Card>
            </DrawerHead>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          <ConditionalRender
            when={isLoading}
            then={<span>Loading...</span>}
          >
            {
              codeSnip === "" ? (<EmptyState variant={EmptyStateVariant.lg} icon={InfoAltIcon} headingLevel="h4" titleText="Code snippet unavailable" />) : (<CodeEditor
                isDarkTheme
                isLineNumbersVisible
                isReadOnly={true}
                isMinimapVisible
                isLanguageLabelVisible
                isDownloadEnabled={false}
                title={displayName}
                code={codeSnip ? codeSnip : ""}
                language={Object.values(Language).find(
                  (l) => l === fileExtension?.toLowerCase()
                )}
                options={{
                  glyphMargin: true,
                  "semanticHighlighting.enabled": true,
                  renderValidationDecorations: "on",
                  hover: { above: false },
                  lineNumbers: (lineNum: number) =>
                    String(relativeToAbsoluteLineNum(lineNum))
                }}
                onEditorDidMount={(
                  editor: monacoEditor.editor.IStandaloneCodeEditor,
                  monaco: typeof monacoEditor
                ) => {
                  onEditorDidMount(editor, monaco);
                }}
                height={`${window.innerHeight - 300}px`}
                {...props}
              />)

            }
          </ConditionalRender>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
