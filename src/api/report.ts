export interface ReportDto {
    id: string;
    name: string;
    files: FileDto;
    rulesets?: RulesetDto[];
    depItems?: DependencyItemDto[];
    issues?: IssueDto[];
    insights?: IssueDto[];
    dependencies?: DependencyDto[];
    tags?: TagDto[];
}

export interface RulesetDto {
    name: string;
    description: string;
    tags: string[];
    violations: {
        [key: string]: IssueDto;
    }
    insights?: {
        [key: string]: IssueDto;
    }
    errors?: {
        [key: string]: string;
    }
}

export interface IssueDto {
    ruleset?: string;
    rule?: string;
    name?: string;
    description: string;
    category?: string;
    labels: string[];
    incidents: IncidentDto[];
    links: LinkDto[];
    effort?: number;
}

export interface IncidentDto {
    uri?: string;
    file?: string;
    message: string;
    codeSnip?: string;
    lineNumber?: number;
    line?: number;
    variables: {
        [key: string]: Object;
    }
}

export interface LinkDto {
    url: string;
    title: string;
}

export interface DependencyItemDto {
  fileURI: string;
  provider: string;
  dependencies: DependencyDto[];
}

export interface DependencyDto {
  provider?: string;
  resolvedIdentifier?: string;
  sha?: string;
  name: string;
  version: string;
  indirect: boolean;
  labels: string[];
  fileURIPrefix: string;
}

export interface FileDto {
  [filename: string]: string;
}

export interface TagDto {
    name: string;
    category: TagCategoryDto;
}

export interface TagCategoryDto {
    id?: string;
    name: string;
}