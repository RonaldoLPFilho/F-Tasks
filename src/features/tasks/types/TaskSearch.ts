import { Task } from "./Task";

export interface TaskSearchMatch {
  field: string;
  label: string;
  snippet: string;
  matchedTerms: string[];
}

export interface TaskSearchResult {
  task: Task;
  tabName?: string | null;
  tabArchived?: boolean;
  sectionName?: string | null;
  sectionArchived?: boolean;
  score: number;
  matches: TaskSearchMatch[];
}
