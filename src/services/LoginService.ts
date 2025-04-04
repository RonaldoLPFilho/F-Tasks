import axios from "axios";
import { ApiResponse } from "../types/ApiResponse";
import { LoginRequest } from "../types/LoginRequest";
import { LoginResponse } from "../types/LoginResponse";

const API_BASE = "http://localhost:8080/api/auth"

export const login = async (data: LoginRequest): Promise<LoginResponse> =>{
    const response = await axios.post<ApiResponse<LoginResponse>>(`${API_BASE}`, data)
    return response.data.data;
}