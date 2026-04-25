const ALLOWED_EMAIL_DOMAIN = 'iiitbhopal.ac.in';

export const normalizeEmail = (email) =>
    String(email ?? '')
        .trim()
        .toLowerCase();

export const isAllowedCollegeEmail = (email) => {
    const normalized = normalizeEmail(email);
    return normalized.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
};

export { ALLOWED_EMAIL_DOMAIN };
