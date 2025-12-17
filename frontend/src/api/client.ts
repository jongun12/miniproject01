import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
    baseURL: 'http://localhost:8000/api', // DEV URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token
client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle 401 (Refresh Token logic could go here)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Simple logout for MVP. In prod, implement refresh token flow.
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default client;
