/**
 * Utility to resolve image URLs safely across development and production deployments.
 * Converts relative upload paths (e.g. "/uploads/items/watch.jpg") into full absolute backend URLs.
 */
export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80';
export const DEFAULT_AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

export function getImageUrl(url, fallback = DEFAULT_FALLBACK_IMAGE) {
    if (!url || typeof url !== 'string') return fallback;
    const trimmed = url.trim();
    if (!trimmed) return fallback;

    // If it's already an absolute URL (http://, https://, data:, blob:)
    if (/^(https?:|data:|blob:)/i.test(trimmed)) {
        return trimmed;
    }

    // Relative upload path (e.g. "/uploads/items/123.png" or "uploads/items/123.png")
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

    // Get backend base domain from VITE_API_URL or environment
    let backendOrigin = '';
    const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
    if (rawApiUrl) {
        // Strip trailing slash and trailing /api if present
        backendOrigin = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
    } else if (import.meta.env.DEV) {
        backendOrigin = 'http://localhost:5000';
    }

    return backendOrigin ? `${backendOrigin}${cleanPath}` : cleanPath;
}

export function handleImageError(event, fallback = DEFAULT_FALLBACK_IMAGE) {
    if (event && event.currentTarget) {
        event.currentTarget.onerror = null; // Prevent infinite fallback loops
        event.currentTarget.src = fallback;
    }
}
