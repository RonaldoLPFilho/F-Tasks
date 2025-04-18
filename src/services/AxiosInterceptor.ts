import axios from "axios";

const API_BASE = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error)  => {
    return Promise.reject(error);
})

export default api;