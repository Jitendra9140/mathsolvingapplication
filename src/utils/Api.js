// api.js
import axios from 'axios';
import { API_BASE_URL } from './Config';

// Login API
export const login = (email, password) =>
  axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });

// Email verification API (for SignUp)
export const verifyEmail = (email) =>
  axios.post(`${API_BASE_URL}/api/auth/verifymail`, { email });

// Register API (after OTP verified)
export const registerUser = (userData) =>
  axios.post(`${API_BASE_URL}/auth/register`, { ...userData });
