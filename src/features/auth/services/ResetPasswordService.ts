import api from "../../../services/AxiosInterceptor"

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await api.post(`/auth/reset-password`, {token, newPassword})
}

export const forgotPassword = async (email: string): Promise<void> => {
    await api.post(`/auth/forgot-password`, {email})
}

export const validateToken = async(token: string): Promise<void> => {
    await api.get(`/auth/validate-token`, {params : {token} });
}