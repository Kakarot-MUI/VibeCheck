// In production (Render), the API is on the same domain as the frontend
const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

export const api = {
  login: async (email, password) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }
      return res.json();
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
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
  },
  getPublicProfile: async (username) => {
    const res = await fetch(`${API_URL}/p/${username}`);
    if (!res.ok) throw new Error('Profile not found');
    return res.json();
  },
  searchUsers: async (query) => {
    const res = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },
  getStoriesFeed: async () => {
    const res = await fetch(`${API_URL}/stories/feed`);
    if (!res.ok) throw new Error('Failed to fetch stories');
    return res.json();
  },
  createStory: async (email, imageUrl) => {
    const res = await fetch(`${API_URL}/stories/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, imageUrl })
    });
    if (!res.ok) throw new Error('Failed to post story');
    return res.json();
  },
  uploadStory: async (email, file) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('image', file);

    const res = await fetch(`${API_URL}/stories/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Photo upload failed');
    return res.json();
  }
};
