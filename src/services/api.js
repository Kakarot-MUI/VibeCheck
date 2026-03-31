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
  },
  uploadPost: async (email, file, caption) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('image', file);
    formData.append('caption', caption || '');

    const res = await fetch(`${API_URL}/posts/create`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Post upload failed');
    return res.json();
  },
  getUserPosts: async (username, meEmail) => {
    const url = meEmail ? `${API_URL}/posts/${username}?me=${encodeURIComponent(meEmail)}` : `${API_URL}/posts/${username}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },
  likePost: async (postId, email) => {
    const res = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Like failed');
    return res.json();
  },
  unlikePost: async (postId, email) => {
    const res = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Unlike failed');
    return res.json();
  },
  vibePost: async (postId, email) => {
    const res = await fetch(`${API_URL}/posts/${postId}/vibe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Vibe failed');
    return res.json();
  },
  unvibePost: async (postId, email) => {
    const res = await fetch(`${API_URL}/posts/${postId}/vibe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Unvibe failed');
    return res.json();
  },
  getComments: async (postId) => {
    const res = await fetch(`${API_URL}/posts/${postId}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },
  addComment: async (postId, email, content) => {
    const res = await fetch(`${API_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, content })
    });
    if (!res.ok) throw new Error('Comment failed');
    return res.json();
  },
  deletePost: async (postId, email) => {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  },
  followUser: async (followerEmail, targetUsername) => {
    const res = await fetch(`${API_URL}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerEmail, targetUsername })
    });
    if (!res.ok) throw new Error('Follow failed');
    return res.json();
  },
  unfollowUser: async (followerEmail, targetUsername) => {
    const res = await fetch(`${API_URL}/unfollow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerEmail, targetUsername })
    });
    if (!res.ok) throw new Error('Unfollow failed');
    return res.json();
  },
  removeFollower: async (myEmail, followerUsername) => {
    const res = await fetch(`${API_URL}/remove-follower`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ myEmail, followerUsername })
    });
    if (!res.ok) throw new Error('Remove follower failed');
    return res.json();
  },
  getFollowStatus: async (meEmail, targetUsername) => {
    const res = await fetch(`${API_URL}/follow/status/${meEmail}/${targetUsername}`);
    if (!res.ok) throw new Error('Failed to fetch follow status');
    return res.json();
  },
  getFollowCounts: async (username) => {
    const res = await fetch(`${API_URL}/follow/counts/${username}`);
    if (!res.ok) throw new Error('Failed to fetch follow counts');
    return res.json();
  },
  getFollowList: async (username, type) => {
    const res = await fetch(`${API_URL}/follow/list/${username}?type=${type}`);
    if (!res.ok) throw new Error('Failed to fetch follow list');
    return res.json();
  },
  uploadWidgetPhoto: async (email, file) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('image', file);

    const res = await fetch(`${API_URL}/profile/upload-widget-photo`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Photo upload failed');
    return res.json();
  },
  // ANALYTICS
  recordProfileView: async (profileUsername, viewerEmail) => {
    const res = await fetch(`${API_URL}/profile/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileUsername, viewerEmail })
    });
    return res.json();
  },
  getProfileAnalytics: async (username) => {
    const res = await fetch(`${API_URL}/profile/analytics/${username}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
  // MESSAGING
  sendMessage: async (senderEmail, receiverUsername, content) => {
    const res = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderEmail, receiverUsername, content })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },
  getInbox: async (email) => {
    const res = await fetch(`${API_URL}/messages/inbox/${email}`);
    if (!res.ok) throw new Error('Failed to fetch inbox');
    return res.json();
  }
};
