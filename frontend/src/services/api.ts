import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; fullName?: string }) =>
    api.post('/api/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  
  getMe: () =>
    api.get('/api/auth/me'),
  
  updateProfile: (data: { fullName?: string; avatar?: string }) =>
    api.put('/api/auth/profile', data),
  
  getStats: () =>
    api.get('/api/auth/stats')
};

// Room API
export const roomAPI = {
  createRoom: (data: any) =>
    api.post('/api/rooms', data),
  
  getRoom: (roomId: string) =>
    api.get(`/api/rooms/${roomId}`),
  
  getRooms: (params?: any) =>
    api.get('/api/rooms', { params }),
  
  getUserRooms: () =>
    api.get('/api/rooms/my-rooms'),
  
  updateRoom: (roomId: string, data: any) =>
    api.put(`/api/rooms/${roomId}`, data),
  
  deleteRoom: (roomId: string) =>
    api.delete(`/api/rooms/${roomId}`),
  
  endRoom: (roomId: string) =>
    api.post(`/api/rooms/${roomId}/end`)
};

// Question API
export const questionAPI = {
  getQuestions: (params?: any) =>
    api.get('/api/questions', { params }),
  
  getQuestion: (id: string) =>
    api.get(`/api/questions/${id}`),
  
  createQuestion: (data: any) =>
    api.post('/api/questions', data),
  
  updateQuestion: (id: string, data: any) =>
    api.put(`/api/questions/${id}`, data),
  
  deleteQuestion: (id: string) =>
    api.delete(`/api/questions/${id}`),
  
  getRandomQuestion: (params?: any) =>
    api.get('/api/questions/random', { params }),
  
  getStats: () =>
    api.get('/api/questions/stats')
};

// Code Execution API
export const codeAPI = {
  executeCode: (data: { language: string; code: string; stdin?: string }) =>
    api.post('/api/code/execute', data),
  
  runTestCases: (data: { language: string; code: string; testCases: any[] }) =>
    api.post('/api/code/test', data),
  
  getLanguages: () =>
    api.get('/api/code/languages')
};

export default api;
