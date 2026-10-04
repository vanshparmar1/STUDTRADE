// Utility for persisting and managing academic study materials in localStorage
// Namespace: studtrade_study_materials (completely separate from marketplace posts)

const STUDY_STORAGE_KEY = 'studtrade_study_materials';

const DEFAULT_STUDY_MATERIALS = [];

/**
 * Fetch all study materials from localStorage or initialize with default academic data.
 */
export const getStudyMaterials = () => {
  try {
    const raw = localStorage.getItem(STUDY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(DEFAULT_STUDY_MATERIALS));
      return DEFAULT_STUDY_MATERIALS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading study materials from storage:', err);
    return DEFAULT_STUDY_MATERIALS;
  }
};

/**
 * Add a new study material item to localStorage.
 */
export const addStudyMaterial = (item) => {
  try {
    const current = getStudyMaterials();
    const newItem = {
      id: 'study_' + Date.now(),
      viewsCount: 0,
      downloadsCount: 0,
      uploadedAt: new Date().toISOString(),
      ...item
    };
    const updated = [newItem, ...current];
    localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving study material:', err);
    return getStudyMaterials();
  }
};

/**
 * Get single study material by ID.
 */
export const getStudyMaterialById = (id) => {
  const list = getStudyMaterials();
  return list.find((item) => String(item.id) === String(id)) || null;
};

/**
 * Delete a study material by ID.
 */
export const deleteStudyMaterial = (id) => {
  try {
    const current = getStudyMaterials();
    const updated = current.filter((item) => String(item.id) !== String(id));
    localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting study material:', err);
    return getStudyMaterials();
  }
};

/**
 * Increment view count for a study material.
 */
export const incrementViewCount = (id) => {
  try {
    const current = getStudyMaterials();
    const updated = current.map((item) => {
      if (String(item.id) === String(id)) {
        return { ...item, viewsCount: (item.viewsCount || 0) + 1 };
      }
      return item;
    });
    localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    return getStudyMaterials();
  }
};

/**
 * Increment download count for a study material.
 */
export const incrementDownloadCount = (id) => {
  try {
    const current = getStudyMaterials();
    const updated = current.map((item) => {
      if (String(item.id) === String(id)) {
        return { ...item, downloadsCount: (item.downloadsCount || 0) + 1 };
      }
      return item;
    });
    localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    return getStudyMaterials();
  }
};

/**
 * Get uploads made by a specific user.
 */
export const getMyStudyUploads = (userId) => {
  if (!userId) return [];
  const list = getStudyMaterials();
  return list.filter((item) => String(item.uploadedByUserId) === String(userId));
};

/**
 * Search study materials by keyword across title, subject, description, branch.
 */
export const searchStudyMaterials = (query) => {
  const list = getStudyMaterials();
  if (!query || !query.trim()) return list;
  const q = query.toLowerCase().trim();
  return list.filter((item) => {
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.branch && item.branch.toLowerCase().includes(q)) ||
      (item.contentType && item.contentType.toLowerCase().includes(q))
    );
  });
};

/**
 * Filter study materials dynamically without reloading the page.
 */
export const filterStudyMaterials = ({ branch, year, subject, contentType, search }) => {
  let list = getStudyMaterials();

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter((item) => (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    ));
  }

  if (branch && branch !== 'All Branches' && branch !== 'All') {
    list = list.filter((item) => item.branch === branch || item.branch === 'All Branches');
  }

  if (year && year !== 'All Years' && year !== 'All') {
    list = list.filter((item) => item.year === year);
  }

  if (subject && subject.trim() && subject !== 'All') {
    const s = subject.toLowerCase().trim();
    list = list.filter((item) => item.subject && item.subject.toLowerCase().includes(s));
  }

  if (contentType && contentType !== 'All Types' && contentType !== 'All') {
    list = list.filter((item) => item.contentType === contentType);
  }

  return list;
};

/**
 * Get distinct subject suggestions from stored materials.
 */
export const getSubjectSuggestions = () => {
  const list = getStudyMaterials();
  const subjects = list.map((item) => item.subject).filter(Boolean);
  return Array.from(new Set(subjects));
};

/**
 * Report a study material (saved locally for moderation prep).
 */
export const reportStudyMaterial = (id, reason) => {
  try {
    const reportsKey = 'studtrade_study_reports';
    const raw = localStorage.getItem(reportsKey);
    const existing = raw ? JSON.parse(raw) : [];
    const newReport = {
      id: 'rep_' + Date.now(),
      materialId: id,
      reason,
      reportedAt: new Date().toISOString(),
    };
    localStorage.setItem(reportsKey, JSON.stringify([newReport, ...existing]));
    return true;
  } catch (err) {
    console.error('Error reporting material:', err);
    return false;
  }
};
