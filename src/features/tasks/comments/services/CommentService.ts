import api from "../../../../services/AxiosInterceptor"
import { ApiResponse } from "../../../../types/ApiResponse"
import { Comment } from "../types/Comment";

export const createComment = async(data: {description: string, taskId: string}): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>(`/comments`, data)
    return response.data.data;
}