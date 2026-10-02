import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://resume-analyzer-backend-3z1r.onrender.com/";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export async function register({ name, email, password }) {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
}

export async function logout() {
    const response = await api.get("/api/auth/logout");
    return response.data;
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me");
    return response.data;
}
