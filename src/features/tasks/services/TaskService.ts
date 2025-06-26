import {Task} from "../types/Task";
import { ApiResponse } from "../../../types/ApiResponse";
import api from "../../../services/AxiosInterceptor";



export const getAllTasks = async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>(`/tasks`);
    return response.data.data;
}

export const createTask = async (data: {title: string; description? : string; jiraId: string, category: string}): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>(`/tasks`, data);
    console.log("To enviano pro back: " + data.jiraId)
    return response.data.data
}

export const toggleTaskCompletion = async (id: number, completed: boolean) => {
    await api.put(`/tasks/${id}/${completed}`);
}

export const deleteTask =  async (id: number) => {
    await api.delete(`/tasks/${id}`);
}

export const updateTask =  async (id: number,  data: {title: string; description? : string; completed: boolean, jiraId: string, category: string}) => {
    await api.put(`/tasks/${id}`, data);
}

