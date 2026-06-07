import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Attach the Clerk session token to every backend request.
api.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined' && window.Clerk?.session) {
        try {
            const token = await window.Clerk.session.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // not signed in yet — request will 401 and the page redirects to sign-in
        }
    }
    return config;
});

export default api;