import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
console.log("API_BASE:", API_BASE);
console.log("VITE_API_URL", import.meta.env.VITE_API_URL);


const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true
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

api.interceptors.response.use(
    response => response,
    error => {
        if(error.response && error.response.status === 401){
            const msg = error.response.data?.message;

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userToken");

            window.location.href = "/login";

            return Promise.reject(error);
        }   
        return Promise.reject(error);
    }
);

export default api;