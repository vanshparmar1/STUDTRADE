export const createPaymentOrderRules = [
    {
        field: 'productId',
        label: 'Product ID',
        rules: {
            required: true,
            type: 'string',
            min: 8,
            max: 64,
        },
    },
];

export const verifyPaymentRules = [
    {
        field: 'orderId',
        label: 'Order ID',
        rules: {
            required: true,
            type: 'string',
            min: 8,
            max: 128,
        },
    },
];
