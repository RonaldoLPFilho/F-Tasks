import { Task } from "./Task";

export interface TaskSection {
  id: string;
  name: string;
  archived?: boolean;
  sortOrder: number;
  tasks: Task[];
}
