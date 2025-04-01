import axios from "axios";
import {Task} from "../types/Task";

const API_BASE = "http://localhost:8080/api";

export const getAllTasks = async (): Promise<Task[]> => {
    const response = await axios.get<Task[]>(`${API_BASE}/tasks`);
    return response.data;
}

export const createTask = async (data: {title: string; description? : string}) => {
    await axios.post(`${API_BASE}/tasks`, data);
}

export const toggleTaskCompletion = async (id: number, completed: boolean) => {
    await axios.put(`${API_BASE}/tasks/${id}/${completed}`);
}

