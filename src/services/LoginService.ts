import { ApiResponse } from "../types/ApiResponse";
import { LoginRequest } from "../types/LoginRequest";
import api from "./AxiosInterceptor";


export const login = async (data: LoginRequest): Promise<ApiResponse<string>> =>{
    const response = await api.post<ApiResponse<string>>(`/auth`, data)
    console.log("valor response: " + response.data.data);
    return response.data;
}