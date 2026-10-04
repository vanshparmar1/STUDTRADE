import Service from '../models/Service.js';
import ProviderService from '../models/ProviderService.js';
import Provider from '../models/Provider.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Customer from '../models/Customer.js';
import ProviderNotification from '../models/ProviderNotification.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/services (Combines standard services and approved ProviderServices)
export const getAllServices = asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const filter = { status: 'available' };

    if (category && category !== 'All') {
        filter.category = category;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
        ];
    }

    const legacyServices = await Service.find(filter)
        .populate('provider', '_id name email')
        .sort({ createdAt: -1 });

    // Fetch approved provider services
    const approvedProviders = await Provider.find({ verificationStatus: 'approved' }).select('_id name businessName location phone whatsapp todayMenu openingHours providerTypes');
    const approvedProviderIds = approvedProviders.map(p => p._id);

    const providerServices = await ProviderService.find({
        provider: { $in: approvedProviderIds },
        status: 'active',
    }).populate('provider').sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: legacyServices.length + providerServices.length,
        data: legacyServices,
        providerServices,
        approvedProviders,
    });
});

// POST /api/services
export const createService = asyncHandler(async (req, res) => {
    const { title, description, category, price, priceUnit, contactPhone, location } = req.body;

    const imageUrls = req.files && req.files.length > 0 ? req.files.map((f) => f.path) : [];

    const service = await Service.create({
        title,
        description,
        category: category || 'Mess / Tiffin',
        price: price ? Number(price) : 0,
        priceUnit: priceUnit || '/month',
        contactPhone: contactPhone || '',
        location: location || 'Campus Area',
        images: imageUrls,
        provider: req.user._id,
        providerName: req.user.name || 'Verified Provider',
        status: 'available',
    });

    res.status(201).json({
        success: true,
        message: 'Service created successfully in MongoDB',
        data: service,
    });
});

// POST /api/services/request (Student request service from provider)
export const requestProviderService = asyncHandler(async (req, res) => {
    const { providerId, serviceId, studentName, studentContact, serviceTitle, message } = req.body;

    if (!providerId || !studentName || !studentContact) {
        return res.status(400).json({
            success: false,
            message: 'Provider, Name, and Contact are required',
        });
    }

    const request = await ServiceRequest.create({
        student: req.user ? req.user._id : null,
        provider: providerId,
        service: serviceId || null,
        studentName,
        studentContact,
        serviceTitle: serviceTitle || 'General Service Request',
        message: message || '',
        status: 'Requested',
    });

    await ProviderNotification.create({
        provider: providerId,
        title: 'New Service Request! 📬',
        message: `New customer request from ${studentName} (${studentContact}) for "${serviceTitle || 'Service'}".`,
        type: 'request',
    });

    res.status(201).json({
        success: true,
        message: 'Service request sent to provider successfully!',
        data: request,
    });
});

// DELETE /api/services/:id
export const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.provider.toString() !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Service deleted successfully from MongoDB',
        data: { id: req.params.id },
    });
});
