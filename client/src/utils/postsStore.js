// Utility to persist user-created posts and marketplace items in localStorage

const POSTS_KEY = 'studtrade_user_posts';
const ITEMS_KEY = 'studtrade_user_items';

const DEFAULT_POSTS = [];

export const getStoredPosts = () => {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) return [];
    const userPosts = JSON.parse(raw);
    return Array.isArray(userPosts) ? userPosts : [];
  } catch (err) {
    console.error('Error reading posts from storage', err);
    return [];
  }
};

export const addStoredPost = (post) => {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [post, ...existing];
    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving post to storage', err);
    return DEFAULT_POSTS;
  }
};

export const getStoredItems = () => {
  try {
    localStorage.removeItem(ITEMS_KEY);
  } catch (err) {
    // ignore
  }
  return [];
};
