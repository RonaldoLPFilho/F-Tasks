import { ApiResponse } from "../types/ApiResponse";
import { LoginRequest } from "../types/LoginRequest";
import { LoginResponseDTO } from "../types/LoginResponseDTO";
import api from "./AxiosInterceptor";


export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponseDTO>> =>{
    const response = await api.post<ApiResponse<LoginResponseDTO>>(`/auth`, data)
    console.log("valor response: " + response.data.data);
    return response.data;
}