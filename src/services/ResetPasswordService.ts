import api from "./AxiosInterceptor"

const API_BASE = "http://localhost:8080/api/auth"

export const resetPassword = async (token: string, password: string): Promise<void> => {
    await api.post(`${API_BASE}/reset-password`, {token, password})
}