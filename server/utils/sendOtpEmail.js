import nodemailer from 'nodemailer';

const sendOtpEmail = async (to, otp) => {
    // ALWAYS log OTP to server console so developers and admins can inspect/test in deployment logs!
    console.log(`\n==================================================`);
    console.log(`🔑 [STUDTRADE OTP DEBUG] Email Verification OTP for ${to}: ${otp}`);
    console.log(`==================================================\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not provided in .env. Skipping SMTP send (OTP is logged in console above).');
        return true;
    }

    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.EMAIL_PORT) || 465;
    const secure = port === 465;

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
        });

        await transporter.verify();
        console.log("✅ SMTP transporter verified successfully");

        await transporter.sendMail({
            from: `"StudTrade" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Your StudTrade Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px;">
                    <h2 style="color: #0d9488; text-align: center;">StudTrade Email Verification</h2>
                    <p style="font-size: 14px; color: #333;">Your verification code is:</p>
                    <div style="background-color: #f0fdf4; border: 1px dashed #16a34a; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="letter-spacing: 8px; font-size: 36px; color: #15803d; margin: 0;">${otp}</h1>
                    </div>
                    <p style="font-size: 12px; color: #666; text-align: center;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                </div>
            `,
        });

        console.log(`✅ OTP email sent successfully to ${to}`);
        return true;
    } catch (error) {
        console.error(`❌ sendOtpEmail failed for ${to}:`, error.message || error);
        throw error;
    }
};

export default sendOtpEmail;