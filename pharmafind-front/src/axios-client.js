import axios from "axios";

// 1. ✅ Use proxy configuration from Vite
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const axiosClient = axios.create({
    baseURL: '/api', // Use relative URL to work with Vite proxy
})

// 2. ✅ Request interceptor: automatically adds auth token to every request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('Axios interceptor - Token found:', !!token, 'Token:', token ? token.substring(0, 20) + '...' : 'none');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Axios interceptor - Authorization header set:', config.headers.Authorization);
    }
    return config;
})

// 3. ✅ Response interceptor: handles expired tokens globally
axiosClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    try {
        const {response} = error;
        if(response && response.status === 401){ // Token expired or invalid
            localStorage.removeItem('token'); // Auto-logout
        }
    } catch(e) {
        console.error(e);
    }
    throw error;
})

export default axiosClient;