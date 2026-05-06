import api from "../../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../../types/ApiResponse";
import { CommentElement, DueDateElement, SubtaskElement } from "../types/TaskElement";

export const createSubtaskElement = async (taskId: string, title: string): Promise<SubtaskElement> => {
    const response = await api.post<ApiResponse<SubtaskElement>>(`/tasks/${taskId}/elements/subtask`, { title, taskId });
    return response.data.data;
};

export const createCommentElement = async (taskId: string, description: string): Promise<CommentElement> => {
    const response = await api.post<ApiResponse<CommentElement>>(`/tasks/${taskId}/elements/comment`, { description, taskId });
    return response.data.data;
};

export const deleteElement = async (elementId: string): Promise<void> => {
    await api.delete(`/elements/${elementId}`);
};

export const toggleSubtaskCompletion = async (elementId: string, completed: boolean): Promise<void> => {
    await api.patch(`/elements/${elementId}/toggle/${completed}`);
};

export const createDueDateElement = async (taskId: string, dueDate: string): Promise<DueDateElement> => {
    const response = await api.post<ApiResponse<DueDateElement>>(`/tasks/${taskId}/elements/due-date`, { dueDate, taskId });
    return response.data.data;
};

export const updateDueDateElement = async (elementId: string, dueDate: string): Promise<void> => {
    await api.patch(`/elements/${elementId}/due-date`, { dueDate });
};
