/**
 * Auth validation rules
 * Used with the validate() middleware factory.
 */

export const registerRules = [
    {
        field: 'name',
        label: 'Name',
        rules: {
            required: true,
            type: 'string',
            min: 2,
            max: 50,
        },
    },
    {
        field: 'email',
        label: 'Email',
        rules: {
            required: true,
            type: 'string',
            pattern: /^[a-zA-Z0-9._%+-]+@iiitbhopal\.ac\.in$/,
            patternMessage: 'Only @iiitbhopal.ac.in email addresses are allowed',
        },
    },
    {
        field: 'password',
        label: 'Password',
        rules: {
            required: true,
            type: 'string',
            min: 6,
            max: 128,
        },
    },
    // phone is optional — only validate format when provided
    {
        field: 'phone',
        label: 'Phone',
        rules: {
            type: 'string',
            pattern: /^[6-9]\d{9}$/,
            patternMessage: 'Phone must be a valid 10-digit Indian mobile number',
        },
    },
];

export const loginRules = [
    {
        field: 'email',
        label: 'Email',
        rules: { required: true, type: 'string' },
    },
    {
        field: 'password',
        label: 'Password',
        rules: { required: true, type: 'string' },
    },
];
