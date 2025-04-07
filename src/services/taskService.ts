import {Task} from "../types/Task";
import { ApiResponse } from "../types/ApiResponse";
import api from "./AxiosInterceptor";

const API_BASE = "http://localhost:8080/api";

export const getAllTasks = async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>(`${API_BASE}/tasks`);
    return response.data.data;
}

export const createTask = async (data: {title: string; description? : string}): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>(`${API_BASE}/tasks`, data);
    return response.data.data
}

export const toggleTaskCompletion = async (id: number, completed: boolean) => {
    await api.put(`${API_BASE}/tasks/${id}/${completed}`);
}

export const deleteTask =  async (id: number) => {
    await api.delete(`${API_BASE}/tasks/${id}`);
}

export const updateTask =  async (id: number,  data: {title: string; description? : string; completed: boolean}) => {
    await api.put(`${API_BASE}/tasks/${id}`, data);
}

