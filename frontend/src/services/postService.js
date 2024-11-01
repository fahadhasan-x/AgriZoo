import axios from '../config/axios';

export const createPost = async (postData) => {
  const response = await axios.post('/posts', postData);
  return response.data;
};

export const getFeed = async () => {
  const response = await axios.get('/posts');
  return response.data;
};

export const likePost = async (postId) => {
  const response = await axios.post(`/posts/${postId}/like`);
  return response.data;
};

export const commentOnPost = async (postId, content) => {
  const response = await axios.post(`/posts/${postId}/comments`, { content });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await axios.delete(`/posts/${postId}`);
  return response.data;
};
