import axios from 'axios';

// Local development URL
const LOCAL_URL = 'http://localhost:8080/api';
const AZURE_URL = 'https://smart-tracking-backend.azurewebsites.net/api';

// Use localhost for development and Azure as fallback
const getApiBaseUrl = () => {
  // For local development
  return LOCAL_URL;
  
  // Uncomment below to use Azure for production
  // return AZURE_URL;
};

const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' }
});

// Set the base URL dynamically for each request
apiClient.interceptors.request.use(config => {
  // Set baseURL for each request
  config.baseURL = getApiBaseUrl();
  
  console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  
  return config;
});

// Add response interceptor to log responses
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    console.error('Request URL:', error.config?.baseURL + error.config?.url);
    return Promise.reject(error);
  }
);

export default apiClient; 
