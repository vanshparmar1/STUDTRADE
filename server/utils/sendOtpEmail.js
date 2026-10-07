import nodemailer from 'nodemailer';

const sendOtpEmail = async (to, otp) => {
    // ALWAYS log OTP to server console so developers and admins can inspect/test in logs on localhost and deployment!
    console.log(`\n==================================================`);
    console.log(`🔑 [STUDTRADE OTP CODE] Email: ${to}`);
    console.log(`🔑 [STUDTRADE OTP CODE] Code:  ${otp}`);
    console.log(`==================================================\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not configured in .env. OTP is logged above.');
        return false;
    }

    const emailUser = process.env.EMAIL_USER.trim();
    const emailPass = process.env.EMAIL_PASS.replace(/\s+/g, '');

    // Try transport methods (service 'gmail' first if gmail address, or explicit host/port fallback)
    const transportOptions = [];

    if (emailUser.endsWith('@gmail.com') || (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail'))) {
        transportOptions.push({
            service: 'gmail',
            auth: { user: emailUser, pass: emailPass },
            tls: { rejectUnauthorized: false },
        });
    }

    transportOptions.push({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: Number(process.env.EMAIL_PORT) === 465 || !process.env.EMAIL_PORT,
        auth: { user: emailUser, pass: emailPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
    });

    transportOptions.push({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: emailUser, pass: emailPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
    });

    let lastError = null;

    for (const options of transportOptions) {
        try {
            const transporter = nodemailer.createTransport(options);
            await transporter.sendMail({
                from: `"StudTrade" <${emailUser}>`,
                to,
                subject: 'Your StudTrade Email Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                        <h2 style="color: #0d9488; text-align: center; margin-top: 0;">StudTrade Email Verification</h2>
                        <p style="font-size: 14px; color: #475569; text-align: center;">Your 6-digit email verification code is:</p>
                        <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; padding: 18px; text-align: center; border-radius: 12px; margin: 20px 0;">
                            <h1 style="letter-spacing: 10px; font-size: 38px; color: #15803d; margin: 0; font-family: monospace;">${otp}</h1>
                        </div>
                        <p style="font-size: 13px; color: #64748b; text-align: center;">This code is valid for 5 minutes. Please do not share it with anyone.</p>
                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Sent automatically by StudTrade Platform</p>
                    </div>
                `,
            });

            console.log(`✅ OTP email successfully delivered to ${to}`);
            return true;
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ SMTP transport attempt failed (${options.service || options.port}):`, err.message || err);
        }
    }

    console.error(`❌ All SMTP transport attempts failed for ${to}. OTP code logged to console.`);
    return false;
};

export default sendOtpEmail;