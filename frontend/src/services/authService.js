import axios from '../config/axios';

export const login = async (email, password) => {
  const response = await axios.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (userData) => {
  const response = await axios.post('/auth/signup', userData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axios.post('/auth/reset-password', { token, newPassword });
  return response.data;
};
