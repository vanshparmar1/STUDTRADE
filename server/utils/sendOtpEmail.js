import nodemailer from 'nodemailer';

const sendOtpEmail = async (to, otp) => {
    console.log(`\n========================================`);
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    console.log(`========================================\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('EMAIL_USER or EMAIL_PASS not provided. Skipping actual email send.');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.verify();
        console.log("SMTP transporter verified successfully");

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Your StudTrade Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Email Verification</h2>
                    <p>Your OTP is:</p>
                    <h1 style="letter-spacing: 6px;">${otp}</h1>
                    <p>This OTP will expire in 5 minutes.</p>
                </div>
            `,
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("sendOtpEmail failed:", error);
        throw error;
    }
};

export default sendOtpEmail;