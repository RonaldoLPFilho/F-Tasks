export type ElementType = 'SUBTASK' | 'COMMENT' | 'DUE_DATE';

export interface TaskElement {
    id: string;
    elementType: ElementType;
    sortOrder: number;
    createdAt: string;
}

export interface SubtaskElement extends TaskElement {
    elementType: 'SUBTASK';
    title: string;
    completed: boolean;
}

export interface CommentElement extends TaskElement {
    elementType: 'COMMENT';
    description: string;
    author: string;
}

export interface DueDateElement extends TaskElement {
    elementType: 'DUE_DATE';
    dueDate: string;
    dueTime?: string | null;
}

export interface ElementRendererProps {
    taskId: string;
    currentElements: TaskElement[];
    onUpdate: (elements: TaskElement[]) => void;
    onRemoveSection?: () => void;
    readOnly?: boolean;
    highlightTerms?: string[];
}
