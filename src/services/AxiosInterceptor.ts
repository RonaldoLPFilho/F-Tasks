import axios from "axios";
import { clearAuthSession, readAuthSession } from "../features/auth/storage/authStorage";

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = readAuthSession().token;

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error)  => {
    return Promise.reject(error);
})

api.interceptors.response.use(
    response => response,
    error => {
        if(error.response && error.response.status === 401){
            clearAuthSession();
            window.dispatchEvent(new Event("tasks:unauthorized"));
        }   
        return Promise.reject(error);
    }
);

export default api;
