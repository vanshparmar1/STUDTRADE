/**
 * validate
 *
 * Lightweight validation middleware factory.
 * Accepts an array of rule objects and returns an Express middleware.
 * On failure it short-circuits with a 400 and a structured error list —
 * on success it calls next() so the controller runs.
 *
 * Rule object shape:
 *   {
 *     field   : string               — req.body key to test
 *     label   : string               — human-readable field name in errors
 *     rules   : Record<string, any>  — validation constraints (see below)
 *   }
 *
 * Supported constraints:
 *   required : true                  — field must be present and non-empty
 *   type     : 'string' | 'number'   — typeof check (after trimming)
 *   min      : number                — string minLength or number minimum
 *   max      : number                — string maxLength or number maximum
 *   pattern  : RegExp                — regex test for strings
 *   enum     : string[]              — value must be one of the listed strings
 *
 * Usage in a route file:
 *   import { validate } from '../middleware/validate.js';
 *   import { registerRules } from '../validators/auth.validators.js';
 *   router.post('/register', validate(registerRules), register);
 */

/**
 * Run a single rule object against req.body.
 * @returns {string|null} error message, or null if valid
 */
const checkField = (body, { field, label, rules }) => {
    const raw = body[field];
    const isEmpty = raw === undefined || raw === null || String(raw).trim() === '';

    // required
    if (rules.required && isEmpty) {
        return `${label} is required`;
    }

    // If not required and empty, skip remaining checks
    if (isEmpty) return null;

    const value = typeof raw === 'string' ? raw.trim() : raw;

    // type
    if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
            return `${label} must be a number`;
        }
        // min / max for numbers
        if (rules.min !== undefined && num < rules.min) {
            return `${label} must be at least ${rules.min}`;
        }
        if (rules.max !== undefined && num > rules.max) {
            return `${label} must be at most ${rules.max}`;
        }
    }

    if (rules.type === 'string' || rules.type === undefined) {
        const str = String(value);
        // min / max for strings (lengths)
        if (rules.min !== undefined && str.length < rules.min) {
            return `${label} must be at least ${rules.min} characters`;
        }
        if (rules.max !== undefined && str.length > rules.max) {
            return `${label} cannot exceed ${rules.max} characters`;
        }
    }

    // pattern
    if (rules.pattern && !rules.pattern.test(String(value))) {
        return rules.patternMessage || `${label} format is invalid`;
    }

    // enum
    if (rules.enum && !rules.enum.includes(String(value))) {
        return `${label} must be one of: ${rules.enum.join(', ')}`;
    }

    return null;
};

/**
 * @param {Array} fieldRules — array of rule objects (see JSDoc above)
 * @returns {import('express').RequestHandler}
 */
export const validate = (fieldRules) => (req, res, next) => {
    const errors = fieldRules
        .map((rule) => checkField(req.body, rule))
        .filter(Boolean);

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors[0],   // first error (fail-fast)
            errors,               // full list for clients that want to show all
        });
    }

    next();
};
