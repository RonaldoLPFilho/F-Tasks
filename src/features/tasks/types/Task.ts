import { Category } from "../../../types/Category";
import { TaskElement } from "../elements/types/TaskElement";

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
    elements: TaskElement[];
}
