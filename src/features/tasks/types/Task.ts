import { Category } from "../../categories/types/Category";
import { Comment } from "./Comment";
import { Subtask } from "./Substask";

export interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
    finishedAt: string;
    jiraId: string;
    category: Category;
    subtasks: Subtask[];
    comments: Comment[];
}