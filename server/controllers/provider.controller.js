import Provider from '../models/Provider.js';
import ProviderService from '../models/ProviderService.js';
import Customer from '../models/Customer.js';
import ServiceRequest from '../models/ServiceRequest.js';
import ProviderNotification from '../models/ProviderNotification.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── @desc    Apply / Register as Provider ───────────────────────────────────
// ─── @route   POST /api/provider/register ────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const registerProvider = asyncHandler(async (req, res) => {
    const { name, businessName, phone, email, password, location, description, providerTypes } = req.body;

    if (!name || !businessName || !phone || !email || !password || !location) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields (Name, Business Name, Phone, Email, Password, Location)',
        });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address (e.g. provider@gmail.com)',
        });
    }

    // Check if user account already exists with this email or phone
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
        if (user.role === 'provider') {
            const existingProvider = await Provider.findOne({ user: user._id });
            if (existingProvider) {
                return res.status(400).json({
                    success: false,
                    message: 'A provider account with this email already exists. Please log in.',
                });
            }
        }
        // Upgrade role to provider
        user.role = 'provider';
        if (password) user.password = password;
        await user.save();
    } else {
        // Create new user account
        user = await User.create({
            name,
            email: normalizedEmail,
            password,
            phone,
            role: 'provider',
            isEmailVerified: true,
        });
    }

    // Parse providerTypes array
    const typesArray = Array.isArray(providerTypes) && providerTypes.length > 0
        ? providerTypes
        : ['Other Service'];

    // Create Provider record
    const provider = await Provider.create({
        user: user._id,
        name,
        businessName,
        phone,
        whatsapp: phone,
        email: normalizedEmail,
        location,
        description: description || '',
        providerTypes: typesArray,
        verificationStatus: 'pending',
    });

    // Create initial welcome notification
    await ProviderNotification.create({
        provider: provider._id,
        title: 'Application Received',
        message: 'Your provider application is submitted! STUDTRADE team will verify your account shortly.',
        type: 'approval',
    });

    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: 'Application submitted successfully. Verification pending.',
        token,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            provider,
        },
    });
});

// ─── @desc    Provider Login ──────────────────────────────────────────────────
// ─── @route   POST /api/provider/login ───────────────────────────────────────
// ─── @access  Public ─────────────────────────────────────────────────────────
export const loginProvider = asyncHandler(async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide mobile/email and password',
        });
    }

    const cleanLogin = login.trim().toLowerCase();

    // Find user by email or phone
    const user = await User.findOne({
        $or: [{ email: cleanLogin }, { phone: cleanLogin }],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Please check your email/mobile and password.',
        });
    }

    // Find or auto-create linked provider record
    let provider = await Provider.findOne({ user: user._id });

    if (!provider) {
        provider = await Provider.create({
            user: user._id,
            name: user.name,
            businessName: `${user.name}'s Service`,
            phone: user.phone || '9876543210',
            whatsapp: user.phone || '',
            email: user.email,
            location: 'Campus Area',
            description: 'Campus service provider',
            providerTypes: ['Other Service'],
            verificationStatus: 'pending',
        });
    }

    // Ensure user role is updated to provider if not admin/manager
    if (user.role !== 'provider' && user.role !== 'admin' && user.role !== 'manager') {
        user.role = 'provider';
        await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Provider login successful',
        token,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            provider,
        },
    });
});

// ─── @desc    Get Current Logged-in Provider Profile ─────────────────────────
// ─── @route   GET /api/provider/me ───────────────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const getMyProviderProfile = asyncHandler(async (req, res) => {
    let provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        provider = await Provider.create({
            user: req.user._id,
            name: req.user.name,
            businessName: `${req.user.name}'s Service`,
            phone: req.user.phone || '9876543210',
            whatsapp: req.user.phone || '',
            email: req.user.email,
            location: 'Campus Area',
            description: 'Campus service provider',
            providerTypes: ['Other Service'],
            verificationStatus: 'pending',
        });
    }

    res.status(200).json({
        success: true,
        data: provider,
    });
});

// ─── @desc    Update Provider Profile ────────────────────────────────────────
// ─── @route   PUT /api/provider/profile ──────────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const updateProviderProfile = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const {
        name,
        businessName,
        phone,
        whatsapp,
        email,
        location,
        description,
        openingHours,
        providerTypes,
        profileImage,
    } = req.body;

    if (name) provider.name = name;
    if (businessName) provider.businessName = businessName;
    if (phone) provider.phone = phone;
    if (whatsapp !== undefined) provider.whatsapp = whatsapp;
    if (email) provider.email = email;
    if (location) provider.location = location;
    if (description !== undefined) provider.description = description;
    if (openingHours !== undefined) provider.openingHours = openingHours;
    if (Array.isArray(providerTypes) && providerTypes.length > 0) provider.providerTypes = providerTypes;
    if (profileImage !== undefined) provider.profileImage = profileImage;

    await provider.save();

    res.status(200).json({
        success: true,
        message: 'Provider profile updated successfully',
        data: provider,
    });
});

// ─── @desc    Quick Update Menu / Notes ──────────────────────────────────────
// ─── @route   PATCH /api/provider/quick-menu ─────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const updateQuickMenu = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const { vegNonVeg, breakfast, lunch, dinner, servingTime, quickNotes } = req.body;

    if (!provider.todayMenu) provider.todayMenu = {};
    if (vegNonVeg !== undefined) provider.todayMenu.vegNonVeg = vegNonVeg;
    if (breakfast !== undefined) provider.todayMenu.breakfast = breakfast;
    if (lunch !== undefined) provider.todayMenu.lunch = lunch;
    if (dinner !== undefined) provider.todayMenu.dinner = dinner;
    if (servingTime !== undefined) provider.todayMenu.servingTime = servingTime;
    provider.todayMenu.updatedAt = new Date();

    if (quickNotes !== undefined) provider.quickNotes = quickNotes;

    await provider.save();

    res.status(200).json({
        success: true,
        message: 'Menu / Quick Notes updated successfully',
        data: provider.todayMenu,
    });
});

// ─── @desc    Get Provider Services ──────────────────────────────────────────
// ─── @route   GET /api/provider/services ─────────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const getProviderServices = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const services = await ProviderService.find({
        provider: provider._id,
        status: { $ne: 'deleted' },
    }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: services.length,
        data: services,
    });
});

// ─── @desc    Create Provider Service/Product ────────────────────────────────
// ─── @route   POST /api/provider/services ────────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const createProviderService = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    if (provider.verificationStatus !== 'approved') {
        return res.status(403).json({
            success: false,
            message: `Your provider account is currently "${provider.verificationStatus}". Only admin-approved providers can publish services. Please wait for website admin approval.`,
        });
    }

    const { type, title, description, price, pricingDetails, schedule, availability, images } = req.body;

    if (!type || !title) {
        return res.status(400).json({
            success: false,
            message: 'Service/Product type and title are required',
        });
    }

    const service = await ProviderService.create({
        provider: provider._id,
        type,
        title,
        description: description || '',
        price: Number(price) || 0,
        pricingDetails: pricingDetails || {},
        schedule: schedule || '',
        availability: availability || 'Available',
        images: Array.isArray(images) ? images : [],
        status: 'active',
    });

    res.status(201).json({
        success: true,
        message: 'Service/Product added successfully',
        data: service,
    });
});

// ─── @desc    Update Provider Service/Product ────────────────────────────────
// ─── @route   PUT /api/provider/services/:id ─────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const updateProviderService = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const service = await ProviderService.findOne({ _id: req.params.id, provider: provider._id });

    if (!service) {
        return res.status(404).json({ success: false, message: 'Service/Product not found' });
    }

    const { title, description, price, pricingDetails, schedule, availability, images, status } = req.body;

    if (title) service.title = title;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = Number(price);
    if (pricingDetails !== undefined) service.pricingDetails = { ...service.pricingDetails, ...pricingDetails };
    if (schedule !== undefined) service.schedule = schedule;
    if (availability !== undefined) service.availability = availability;
    if (Array.isArray(images)) service.images = images;
    if (status) service.status = status;

    await service.save();

    res.status(200).json({
        success: true,
        message: 'Service/Product updated successfully',
        data: service,
    });
});

// ─── @desc    Delete / Hide Provider Service ─────────────────────────────────
// ─── @route   DELETE /api/provider/services/:id ──────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const deleteProviderService = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const service = await ProviderService.findOne({ _id: req.params.id, provider: provider._id });

    if (!service) {
        return res.status(404).json({ success: false, message: 'Service/Product not found' });
    }

    service.status = 'deleted';
    await service.save();

    res.status(200).json({
        success: true,
        message: 'Service/Product deleted successfully',
    });
});

// ─── @desc    Toggle Service Visibility (Hide / Show) ────────────────────────
// ─── @route   PATCH /api/provider/services/:id/status ───────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const toggleServiceStatus = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const service = await ProviderService.findOne({ _id: req.params.id, provider: provider._id });

    if (!service) {
        return res.status(404).json({ success: false, message: 'Service/Product not found' });
    }

    service.status = service.status === 'active' ? 'hidden' : 'active';
    await service.save();

    res.status(200).json({
        success: true,
        message: `Service is now ${service.status}`,
        data: service,
    });
});

// ─── @desc    Get Customers (Scoped ONLY to logged-in provider) ──────────────
// ─── @route   GET /api/provider/customers ────────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const getProviderCustomers = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const customers = await Customer.find({ provider: provider._id }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: customers.length,
        data: customers,
    });
});

// ─── @desc    Add Customer Manually ──────────────────────────────────────────
// ─── @route   POST /api/provider/customers ───────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const addProviderCustomer = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const { name, contact, serviceName, startDate, endDate, status, notes } = req.body;

    if (!name || !contact) {
        return res.status(400).json({
            success: false,
            message: 'Customer name and contact number are required',
        });
    }

    const customer = await Customer.create({
        provider: provider._id,
        name,
        contact,
        serviceName: serviceName || 'General Service',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'Active',
        notes: notes || '',
    });

    res.status(201).json({
        success: true,
        message: 'Customer added successfully',
        data: customer,
    });
});

// ─── @desc    Update Customer Record ─────────────────────────────────────────
// ─── @route   PUT /api/provider/customers/:id ────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const updateProviderCustomer = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const customer = await Customer.findOne({ _id: req.params.id, provider: provider._id });

    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer record not found' });
    }

    const { name, contact, serviceName, startDate, endDate, status, notes } = req.body;

    if (name) customer.name = name;
    if (contact) customer.contact = contact;
    if (serviceName) customer.serviceName = serviceName;
    if (startDate) customer.startDate = new Date(startDate);
    if (endDate !== undefined) customer.endDate = endDate ? new Date(endDate) : null;
    if (status) customer.status = status;
    if (notes !== undefined) customer.notes = notes;

    await customer.save();

    res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
    });
});

// ─── @desc    Delete Customer Record ─────────────────────────────────────────
// ─── @route   DELETE /api/provider/customers/:id ─────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const deleteProviderCustomer = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    await Customer.deleteOne({ _id: req.params.id, provider: provider._id });

    res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
    });
});

// ─── @desc    Get Student Service Requests ───────────────────────────────────
// ─── @route   GET /api/provider/requests ─────────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const getProviderRequests = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const requests = await ServiceRequest.find({ provider: provider._id }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
    });
});

// ─── @desc    Accept / Reject Service Request ─────────────────────────────────
// ─── @route   PATCH /api/provider/requests/:id/status ───────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const handleServiceRequest = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const request = await ServiceRequest.findOne({ _id: req.params.id, provider: provider._id });

    if (!request) {
        return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const { status } = req.body;
    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    request.status = status;
    await request.save();

    // If accepted, automatically add to customer list if not already present!
    if (status === 'Accepted') {
        const existingCust = await Customer.findOne({
            provider: provider._id,
            contact: request.studentContact,
        });

        if (!existingCust) {
            await Customer.create({
                provider: provider._id,
                student: request.student,
                service: request.service,
                name: request.studentName,
                contact: request.studentContact,
                serviceName: request.serviceTitle,
                status: 'Active',
                notes: request.message || 'Added from student request',
            });
        }
    }

    res.status(200).json({
        success: true,
        message: `Service request ${status.toLowerCase()}`,
        data: request,
    });
});

// ─── @desc    Get Notifications ──────────────────────────────────────────────
// ─── @route   GET /api/provider/notifications ────────────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const getProviderNotifications = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const notifications = await ProviderNotification.find({ provider: provider._id }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications,
    });
});

// ─── @desc    Mark Notifications Read ────────────────────────────────────────
// ─── @route   PATCH /api/provider/notifications/read ────────────────────────
// ─── @access  Private (Provider) ─────────────────────────────────────────────
export const markNotificationsRead = asyncHandler(async (req, res) => {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    await ProviderNotification.updateMany({ provider: provider._id }, { read: true });

    res.status(200).json({
        success: true,
        message: 'Notifications marked as read',
    });
});
