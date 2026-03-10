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
  sectionName?: string | null;
  score: number;
  matches: TaskSearchMatch[];
}
