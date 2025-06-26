export interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
    finishedAt: string;
    jiraId: string;
    category: string;
}