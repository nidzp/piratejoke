import axios from 'axios';

const apiBase =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.__API_BASE_URL__) ||
  '';

export const apiClient = axios.create({
  baseURL: apiBase,
  withCredentials: false,
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function clearAuthToken() {
  delete apiClient.defaults.headers.common.Authorization;
}
