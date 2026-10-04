// Storage helper for STUDTRADE Needs feed

const STORAGE_KEY = 'studtrade_needs';

export const INITIAL_NEEDS = [];

export const getDaysLeft = (createdAt) => {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const createdTime = typeof createdAt === 'number'
    ? createdAt
    : new Date(createdAt || Date.now()).getTime();
  const validCreated = isNaN(createdTime) ? Date.now() : createdTime;
  const elapsed = Date.now() - validCreated;
  const remainingMs = SEVEN_DAYS_MS - elapsed;
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
};

export const getStoredNeeds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NEEDS));
      return INITIAL_NEEDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NEEDS;
  } catch (err) {
    console.error('Error reading needs from localStorage:', err);
    return INITIAL_NEEDS;
  }
};

export const getActiveNeeds = () => {
  const needs = getStoredNeeds();
  return needs.filter((post) => {
    if (post.status === 'FULFILLED' || post.status === 'EXPIRED') return false;
    return getDaysLeft(post.createdAt) > 0;
  });
};

export const saveNeed = (newNeed) => {
  const current = getStoredNeeds();
  const updated = [newNeed, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const markNeedFulfilled = (id) => {
  const current = getStoredNeeds();
  const updated = current.map((item) => (item.id === id ? { ...item, status: 'FULFILLED' } : item));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
