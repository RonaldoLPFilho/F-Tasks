import { ApiResponse } from "../types/ApiResponse"
import { RegisterRequest } from "../types/RegisterRequest"
import api from "./AxiosInterceptor"


const API_BASE = "http://localhost:8080/api/auth"

export const register = async (data: RegisterRequest): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(`${API_BASE}/register`, data);
    return response.data;
}