import axios, { AxiosError } from 'axios';

const BASE_URL = 'http://jsonplaceholder.typicode.com';

export interface Post {
  id?: number;
  title: string;
  body: string;
  userId: number;
}

export interface Comment {
  id?: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      throw new Error(`Server error: ${axiosError.response.status}`);
    } else if (axiosError.request) {
      throw new Error('No response from server');
    }
  }
  throw new Error('An unexpected error occurred');
};

const api = {
  // Get all posts
  getPosts: async (): Promise<Post[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/posts`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Get a single post
  getPost: async (id: number): Promise<Post> => {
    try {
      const response = await axios.get(`${BASE_URL}/posts/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Get comments for a post
  getComments: async (postId: number): Promise<Comment[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Create a new post
  createPost: async (post: Omit<Post, 'id'>): Promise<Post> => {
    try {
      const response = await axios.post(`${BASE_URL}/posts`, post);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Create a new comment
  createComment: async (comment: Omit<Comment, 'id'>): Promise<Comment> => {
    try {
      const response = await axios.post(`${BASE_URL}/comments`, comment);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete a post
  deletePost: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/posts/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
};

export default api; 