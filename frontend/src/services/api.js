import axios from 'axios';

// Normalize base URL to always include /api regardless of how VITE_API_URL is configured
const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return 'http://localhost:5000/api';
  }

  // Remove trailing slashes
  envUrl = envUrl.trim().replace(/\/+$/, '');

  // If the URL already ends with /api, use it as is; otherwise append /api
  if (envUrl.endsWith('/api')) {
    return envUrl;
  }

  return `${envUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
