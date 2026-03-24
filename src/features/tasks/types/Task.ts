import { Category } from "../../../types/Category";
import { Comment } from "../comments/types/Comment";
import { Subtask } from "../subtasks/types/Substask";

export interface Task {
    id: string;
    tabId: string;
    sectionId: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
    finishedAt?: string;
    jiraId?: string;
    active?: boolean;
    archived?: boolean;
    category?: Category | null;
    subtasks: Subtask[];
    comments: Comment[];
}
