import { Task } from "../types/Task";
import { TaskSearchResult } from "../types/TaskSearch";
import { ApiResponse } from "../../../types/ApiResponse";
import api from "../../../services/AxiosInterceptor";

export interface SectionUpdatePayload {
  sectionId: string;
  orderedIds: string[];
}

export const getAllTasks = async (tabId?: string): Promise<Task[]> => {
  const params = tabId ? { tabId } : {};
  const response = await api.get<ApiResponse<Task[]>>("/tasks", { params });
  return response.data.data;
};

export const searchTasks = async (
  query: string,
  tabId?: string,
  limit = 25
): Promise<TaskSearchResult[]> => {
  const response = await api.get<ApiResponse<TaskSearchResult[]>>("/tasks/search", {
    params: {
      q: query,
      tabId,
      limit,
    },
  });

  return response.data.data;
};

export const createTask = async (data: {
  title: string;
  description?: string;
  tabId: string;
  categoryId?: string;
  jiraId?: string;
  completed?: boolean;
}): Promise<Task> => {
  const response = await api.post<ApiResponse<Task>>("/tasks", data);
  return response.data.data;
};

export const toggleTaskCompletion = async (
  id: string,
  completed: boolean
): Promise<void> => {
  await api.put(`/tasks/${id}/${completed}`);
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const updateTask = async (
  id: string,
  data: {
    title: string;
    description?: string;
    completed: boolean;
    jiraId?: string;
    categoryId?: string;
  }
): Promise<void> => {
  await api.put(`/tasks/${id}`, data);
};

export const reorderTasks = async (
  tabId: string,
  sectionUpdates: SectionUpdatePayload[]
): Promise<void> => {
  await api.patch("/tasks/reorder", { tabId, sectionUpdates });
};
