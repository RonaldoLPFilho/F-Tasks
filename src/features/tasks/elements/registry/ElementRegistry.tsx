import { ComponentType } from 'react';
import { ElementRendererProps, ElementType } from '../types/TaskElement';
import { SubtaskElementRenderer } from '../components/SubtaskElementRenderer';
import { CommentElementRenderer } from '../components/CommentElementRenderer';
import { DueDateElementRenderer } from '../components/DueDateElementRenderer';

export const elementLabels: Record<ElementType, string> = {
    SUBTASK: 'Checklist',
    COMMENT: 'Observações',
    DUE_DATE: 'Data entrega',
};

export const elementRenderers: Record<ElementType, ComponentType<ElementRendererProps>> = {
    SUBTASK: SubtaskElementRenderer,
    COMMENT: CommentElementRenderer,
    DUE_DATE: DueDateElementRenderer,
};
