/**
 * Item validation rules
 * Used with the validate() middleware factory.
 */

const VALID_CATEGORIES = ['Books', 'Cycles', 'Tech', 'Furniture', 'Housing', 'Need', 'Other'];
const VALID_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export const createItemRules = [
    {
        field: 'title',
        label: 'Title',
        rules: {
            required: false,
            type: 'string',
            max: 120,
        },
    },
    {
        field: 'description',
        label: 'Description',
        rules: {
            required: false,
            type: 'string',
            max: 2000,
        },
    },
    {
        field: 'price',
        label: 'Price',
        rules: {
            required: false,
            type: 'number',
            min: 0,
        },
    },
    {
        field: 'category',
        label: 'Category',
        rules: {
            required: false,
            type: 'string',
            enum: VALID_CATEGORIES,
        },
    },
    {
        field: 'condition',
        label: 'Condition',
        rules: {
            required: false,
            type: 'string',
            enum: VALID_CONDITIONS,
        },
    },
];

export const reportItemRules = [
    {
        field: 'item',
        label: 'Item ID',
        rules: {
            required: true,
            type: 'string',
        },
    },
    {
        field: 'reason',
        label: 'Reason',
        rules: {
            required: true,
            type: 'string',
            min: 10,
            max: 500,
        },
    },
];
