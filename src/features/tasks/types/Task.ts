import { Category } from "../../../types/Category";
import { Comment } from "../comments/types/Comment";
import { Subtask } from "../subtasks/types/Substask";

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