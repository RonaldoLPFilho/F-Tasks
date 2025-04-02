import axios from "axios";
import {Task} from "../types/Task";
import { ApiResponse } from "../types/ApiResponse";

const API_BASE = "http://localhost:8080/api";

export const getAllTasks = async (): Promise<Task[]> => {
    const response = await axios.get<ApiResponse<Task[]>>(`${API_BASE}/tasks`);
    return response.data.data;
}

export const createTask = async (data: {title: string; description? : string}): Promise<Task> => {
    const response = await axios.post<ApiResponse<Task>>(`${API_BASE}/tasks`, data);
    return response.data.data
}

export const toggleTaskCompletion = async (id: number, completed: boolean) => {
    await axios.put(`${API_BASE}/tasks/${id}/${completed}`);
}

export const deleteTask =  async (id: number) => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
}

export const updateTask =  async (id: number,  data: {title: string; description? : string; completed: boolean}) => {
    await axios.put(`${API_BASE}/tasks/${id}`, data);
}

