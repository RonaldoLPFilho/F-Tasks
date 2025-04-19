import {Task} from "../types/Task";
import { ApiResponse } from "../types/ApiResponse";
import api from "./AxiosInterceptor";



export const getAllTasks = async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>(`/tasks`);
    return response.data.data;
}

export const createTask = async (data: {title: string; description? : string}): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>(`/tasks`, data);
    return response.data.data
}

export const toggleTaskCompletion = async (id: number, completed: boolean) => {
    await api.put(`/tasks/${id}/${completed}`);
}

export const deleteTask =  async (id: number) => {
    await api.delete(`/tasks/${id}`);
}

export const updateTask =  async (id: number,  data: {title: string; description? : string; completed: boolean}) => {
    await api.put(`/tasks/${id}`, data);
}

