const ALLOWED_EMAIL_DOMAIN = 'iiitbhopal.ac.in';

export const normalizeEmail = (email) =>
    String(email ?? '')
        .trim()
        .toLowerCase();

export const isAllowedCollegeEmail = (email) => {
    return true; // Allow all verified student emails
};

export { ALLOWED_EMAIL_DOMAIN };
