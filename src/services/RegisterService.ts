import { ApiResponse } from "../types/ApiResponse"
import { RegisterRequest } from "../types/RegisterRequest"
import api from "./AxiosInterceptor"


export const register = async (data: RegisterRequest): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(`/auth/register`, data);
    return response.data;
}