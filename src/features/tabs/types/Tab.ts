import { TaskSection } from "../../tasks/types/TaskSection";

export interface Tab {
  id: string;
  name: string;
  archived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  sections?: TaskSection[];
}
