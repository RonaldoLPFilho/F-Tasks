import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { Subtask } from "../types/Substask";

export const createSubtask = async(data: {title: string, taskId: string}): Promise<Subtask> => {
    const response = await api.post<ApiResponse<Subtask>>(`/subtask`, data);
    return response.data.data;
}

export const toggleSubstaskCompletion = async (id: string, completed: boolean) => {
    await api.put(`/subtask/${id}/${completed}`);
}
