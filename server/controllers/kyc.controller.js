import User from '../models/User.js';

// ─── @desc    Submit KYC document for verification ───────────────────────────
// ─── @route   POST /api/kyc/submit ──────────────────────────────────────────
// ─── @access  Private (requires JWT via protect middleware) ──────────────────
export const submitKYC = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        // 1. Guard: already approved → no re-upload needed
        if (user.verificationStatus === 'approved') {
            const error = new Error('Your account is already verified');
            error.statusCode = 400;
            throw error;
        }

        // 2. Guard: multer + Cloudinary must have processed a file
        if (!req.file) {
            const error = new Error('Please upload a KYC document image');
            error.statusCode = 400;
            throw error;
        }

        // 3. Persist Cloudinary URL and reset status to pending
        //    (covers re-submission after a rejection)
        user.kycDocument = req.file.path; // Cloudinary secure_url via multer-storage-cloudinary
        user.verificationStatus = 'pending';
        user.verifiedAt = null;
        user.verifiedBy = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'KYC document submitted successfully. Verification is under review.',
            data: {
                kycDocument: user.kycDocument,
                verificationStatus: user.verificationStatus,
            },
        });
    } catch (err) {
        next(err);
    }
};
