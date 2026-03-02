import jwt from 'jsonwebtoken';

/**
 * generateToken
 * Creates a signed JWT for a given user ID.
 *
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} - Signed JWT string
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

export default generateToken;
