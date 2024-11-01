import axios from '../config/axios';

export const getProfile = async () => {
  const response = await axios.get('/users/me');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await axios.put('/users/me', userData);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};

export const getUserPosts = async (userId) => {
  const response = await axios.get(`/users/${userId}/posts`);
  return response.data;
};
