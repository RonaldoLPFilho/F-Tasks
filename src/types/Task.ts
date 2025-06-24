export interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    createDate: string;
    finishDate: string;
    jiraId: string;
    category: string;
}