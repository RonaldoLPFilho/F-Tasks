import { Task } from "../../tasks/types/Task";

export interface Tab {
  id: string;
  name: string;
  archived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}
