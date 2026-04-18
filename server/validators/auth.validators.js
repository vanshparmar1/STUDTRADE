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
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
patternMessage: 'Please provide a valid email address',
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
        rules: {
            required: true,
            type: 'string',
        },
    },
    {
        field: 'password',
        label: 'Password',
        rules: {
            required: true,
            type: 'string',
        },
    },
];

export const verifyEmailOtpRules = [
    {
        field: 'email',
        label: 'Email',
        rules: {
            required: true,
            type: 'string',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
patternMessage: 'Please provide a valid email address',
        },
    },
    {
        field: 'otp',
        label: 'OTP',
        rules: {
            required: true,
            type: 'string',
            pattern: /^\d{6}$/,
            patternMessage: 'OTP must be exactly 6 digits',
        },
    },
];

export const resendEmailOtpRules = [
    {
        field: 'email',
        label: 'Email',
        rules: {
            required: true,
            type: 'string',
           pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
patternMessage: 'Please provide a valid email address',
        },
    },
];