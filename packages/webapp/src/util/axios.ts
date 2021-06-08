import axios from 'axios';

export const API_BASE_URL =
  process.env.NODE_ENV === `development`
    ? `http://${window.location.hostname}:4000`
    : '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});
axiosInstance.defaults.headers['Content-Type'] = 'application/json';

export default axiosInstance;
