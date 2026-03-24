import { Tab } from "../../tabs/types/Tab";
import { TaskSection } from "../../tasks/types/TaskSection";
import { Task } from "../../tasks/types/Task";
import { TaskSearchMatch } from "../../tasks/types/TaskSearch";

export type ArchivedItemType = "TAB" | "SECTION" | "TASK";

export interface ArchivedSearchResult {
  type: ArchivedItemType;
  id: string;
  title: string;
  subtitle?: string | null;
  tab?: Tab | null;
  section?: TaskSection | null;
  task?: Task | null;
  parentTabId?: string | null;
  parentTabName?: string | null;
  parentTabArchived?: boolean;
  parentSectionId?: string | null;
  parentSectionName?: string | null;
  parentSectionArchived?: boolean;
  score: number;
  matches: TaskSearchMatch[];
}
