import axios from 'axios';

// Base URL defaults to empty string (which uses the Vite dev proxy) or VITE_API_URL if configured
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const fetchHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

export const fetchMovies = async () => {
  const response = await apiClient.get('/api/movies');
  return response.data.movies;
};

export const fetchUsers = async () => {
  const response = await apiClient.get('/api/users');
  return response.data.users;
};

export const fetchUserRatings = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}/ratings`);
  return response.data.ratings;
};

export const fetchCollaborativeRecommendations = async (params) => {
  const response = await apiClient.post('/api/recommendations/collaborative', {
    user_id: params.userId,
    k: params.k ?? 3,
    top_n: params.topN ?? 5,
    ratings_updates: params.ratingsUpdates ?? [],
  });
  return response.data;
};

export const fetchContentRecommendations = async (params) => {
  const response = await apiClient.post('/api/recommendations/content', {
    movie_id: params.movieId,
    top_n: params.topN ?? 5,
  });
  return response.data;
};

export const compareAlgorithms = async (params) => {
  const response = await apiClient.post('/api/experiments/compare', {
    user_id: params.userId,
    movie_id: params.movieId,
    k: params.k ?? 3,
    top_n: params.topN ?? 5,
  });
  return response.data;
};
