import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001/api'
    : 'https://zylron-agent-ai.onrender.com/api';
const ADMIN_API_URL = API_BASE_URL + '/admin';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const adminApi = axios.create({ baseURL: ADMIN_API_URL });

// Interceptor to add Admin Token
adminApi.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Separate public API client (for non-admin routes)
const publicApi = axios.create({ baseURL: API_BASE_URL });
publicApi.interceptors.request.use((config) => {
    config.headers = { ...config.headers, ...getAuthHeader() };
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
    getCrashLogs: () => adminApi.get('/crash-logs'),
    getUserRecall: (id) => adminApi.get(`/users/${id}/recall`),
    // Feature Flags (use public API — /api/flags/admin)
    getFeatureFlags: () => publicApi.get('/flags/admin'),
    toggleFeatureFlag: (id) => publicApi.put(`/flags/${id}/toggle`),
};

export default adminApi;
