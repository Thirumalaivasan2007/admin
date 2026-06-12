import axios from 'axios';

const API_BASE_URL = 'https://zylron-agent-ai.onrender.com/api/admin';

const adminApi = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to add Admin Token
adminApi.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export const adminServices = {
    getStats: () => adminApi.get('/stats'),
    getUsers: () => adminApi.get('/users'),
    getLogs: () => adminApi.get('/logs'),
    toggleBanUser: (id) => adminApi.put(`/users/${id}/ban`),
    getTickets: () => adminApi.get('/tickets'),
    resolveTicket: (id) => adminApi.put(`/tickets/${id}/resolve`),
    broadcastMessage: (subject, htmlContent) => adminApi.post('/broadcast', { subject, htmlContent }),
    getUserAnalytics: (id) => adminApi.get(`/users/${id}/analytics`),
    toggleApiKeyStatus: (id) => adminApi.put(`/api-keys/${id}/toggle`),
};

export default adminApi;
