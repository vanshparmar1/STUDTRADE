/** Campus email domain allowed at signup (must match server ALLOWED_EMAIL_DOMAIN). */
export const allowedEmailDomain =
  import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN?.trim() || 'university.edu';

/** Shown on Contact Us — set in Vercel env for production. */
export const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim() || '';

/** Comma-separated phone numbers for Contact Us. */
export const supportPhones = import.meta.env.VITE_SUPPORT_PHONES?.trim() || '';
