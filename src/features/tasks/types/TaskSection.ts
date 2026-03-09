import { Task } from "./Task";

export interface TaskSection {
  id: string;
  name: string;
  sortOrder: number;
  tasks: Task[];
}
