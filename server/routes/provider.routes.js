import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    registerProvider,
    loginProvider,
    getMyProviderProfile,
    updateProviderProfile,
    updateQuickMenu,
    getProviderServices,
    createProviderService,
    updateProviderService,
    deleteProviderService,
    toggleServiceStatus,
    getProviderCustomers,
    addProviderCustomer,
    updateProviderCustomer,
    deleteProviderCustomer,
    getProviderRequests,
    handleServiceRequest,
    getProviderNotifications,
    markNotificationsRead,
} from '../controllers/provider.controller.js';

const router = express.Router();

// Public routes
router.post('/register', registerProvider);
router.post('/login', loginProvider);

// Private Provider routes (requires logged in user)
router.use(protect);

router.get('/me', getMyProviderProfile);
router.put('/profile', updateProviderProfile);
router.patch('/quick-menu', updateQuickMenu);

// Services / Products
router.get('/services', getProviderServices);
router.post('/services', createProviderService);
router.put('/services/:id', updateProviderService);
router.delete('/services/:id', deleteProviderService);
router.patch('/services/:id/status', toggleServiceStatus);

// Customers
router.get('/customers', getProviderCustomers);
router.post('/customers', addProviderCustomer);
router.put('/customers/:id', updateProviderCustomer);
router.delete('/customers/:id', deleteProviderCustomer);

// Service Requests
router.get('/requests', getProviderRequests);
router.patch('/requests/:id/status', handleServiceRequest);

// Notifications
router.get('/notifications', getProviderNotifications);
router.patch('/notifications/read', markNotificationsRead);

export default router;
