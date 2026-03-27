// In production (Render), the API is on the same domain as the frontend
const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }
    return res.json();
  },

  register: async (email, password, name) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }
    return res.json();
  },

  updateProfile: async (email, profileData) => {
    const res = await fetch(`${API_URL}/profile/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, profileData })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Update failed');
    }
    return res.json();
  }
};
