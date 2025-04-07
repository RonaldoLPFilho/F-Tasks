import { ApiResponse } from "../types/ApiResponse";
import { LoginRequest } from "../types/LoginRequest";
import api from "./AxiosInterceptor";


const API_BASE = "http://localhost:8080/api/auth"

export const login = async (data: LoginRequest): Promise<ApiResponse<string>> =>{
    const response = await api.post<ApiResponse<string>>(`${API_BASE}`, data)
    console.log("valor response: " + response.data.data);
    return response.data;
}