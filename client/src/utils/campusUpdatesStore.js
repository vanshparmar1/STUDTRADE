// Storage helper for STUDTRADE Campus What's Happening feed (24-hour expiration)

const STORAGE_KEY = 'studtrade_campus_updates';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const CATEGORY_OPTIONS = [
  'Announcement',
  'Event',
  'Workshop',
  'Seminar',
  'Sports',
  'Cultural',
  'Academic',
  'Club Activity',
  'Important Notice',
  'Other Campus Update'
];

export const getCategoryIcon = (category) => {
  switch (category) {
    case 'Announcement': return '📢';
    case 'Event': return '🎉';
    case 'Workshop': return '🎓';
    case 'Seminar': return '🎤';
    case 'Sports': return '🏆';
    case 'Cultural': return '🎭';
    case 'Academic': return '📖';
    case 'Club Activity': return '👥';
    case 'Important Notice': return '🚨';
    default: return '📢';
  }
};

export const getCategoryBadgeStyle = (category) => {
  switch (category) {
    case 'Announcement': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Event': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Workshop': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Seminar': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Sports': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Cultural': return 'bg-pink-50 text-pink-700 border-pink-200';
    case 'Academic': return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Club Activity': return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Important Notice': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getInitialUpdates = () => [];

export const getRemainingTimeText = (expiresAt) => {
  if (!expiresAt) return '24 hours left';
  const targetTime = typeof expiresAt === 'number'
    ? expiresAt
    : new Date(expiresAt).getTime();
  if (isNaN(targetTime)) return '24 hours left';

  const diff = targetTime - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
};

export const getShortRemainingTime = (expiresAt) => {
  if (!expiresAt) return '24h left';
  const targetTime = typeof expiresAt === 'number'
    ? expiresAt
    : new Date(expiresAt).getTime();
  if (isNaN(targetTime)) return '24h left';

  const diff = targetTime - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h left`;
  }
  return `${minutes}m left`;
};

// Auto cleanup function: removes posts where Date.now() >= expiresAt
export const cleanupExpiredCampusPosts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const activePosts = parsed.filter(post => post.expiresAt && now < post.expiresAt);
    
    if (activePosts.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activePosts));
    }
    return activePosts;
  } catch (err) {
    console.error('Error cleaning up expired campus posts:', err);
    return [];
  }
};

// Retrieve active campus updates sorted newest first
export const getCampusUpdates = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let posts = [];
    if (!raw) {
      posts = getInitialUpdates();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } else {
      posts = JSON.parse(raw);
      if (!Array.isArray(posts) || posts.length === 0) {
        posts = getInitialUpdates();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      }
    }

    const now = Date.now();
    // Filter out expired posts
    const active = posts.filter(post => post.expiresAt && now < post.expiresAt);
    // Sort newest first
    active.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return active;
  } catch (err) {
    console.error('Error fetching campus updates:', err);
    return getInitialUpdates();
  }
};

// Add a new campus update (24-hour expiration)
export const addCampusUpdate = (updateData) => {
  const now = Date.now();
  const newPost = {
    id: 'cu-' + now + '-' + Math.random().toString(36).substr(2, 4),
    title: updateData.title.trim(),
    description: updateData.description.trim(),
    category: updateData.category || 'Announcement',
    location: (updateData.location || '').trim(),
    dateTime: (updateData.dateTime || '').trim(),
    image: updateData.image || '',
    createdAt: now,
    expiresAt: now + TWENTY_FOUR_HOURS_MS
  };

  const active = getCampusUpdates();
  const updated = [newPost, ...active];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newPost;
};

// Admin function: Update a campus update
export const updateCampusUpdate = (id, newFields) => {
  const active = getCampusUpdates();
  const updated = active.map(post => post.id === id ? { ...post, ...newFields } : post);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Admin function: Delete a campus update
export const deleteCampusUpdate = (id) => {
  const active = getCampusUpdates();
  const updated = active.filter(post => post.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
