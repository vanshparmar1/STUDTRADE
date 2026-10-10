import nodemailer from 'nodemailer';

const sendOtpEmail = async (to, otp) => {
    // ALWAYS log OTP to server console so developers and admins can inspect/test in logs!
    console.log(`\n==================================================`);
    console.log(`🔑 [STUDTRADE OTP CODE] Email: ${to}`);
    console.log(`🔑 [STUDTRADE OTP CODE] Code:  ${otp}`);
    console.log(`==================================================\n`);

    const htmlContent = `
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
    `;

    // ── Option 1: Resend HTTP API (Best for Render/Cloud, uses HTTPS Port 443) ──────
    if (process.env.RESEND_API_KEY) {
        try {
            const fromAddress = process.env.EMAIL_FROM || 'StudTrade <onboarding@resend.dev>';
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: fromAddress,
                    to: [to],
                    subject: 'Your StudTrade Email Verification Code',
                    html: htmlContent,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                console.log(`✅ [Resend API] OTP email successfully sent to ${to} (ID: ${data.id})`);
                return true;
            } else {
                console.warn(`⚠️ [Resend API] Delivery failed:`, data);
            }
        } catch (resendErr) {
            console.warn(`⚠️ [Resend API] Request error:`, resendErr.message || resendErr);
        }
    }

    // ── Option 2: Brevo HTTP API (Free 300 emails/day to any recipient like Outlook/IIIT) ──
    if (process.env.BREVO_API_KEY) {
        try {
            const senderEmail = process.env.EMAIL_USER || 'noreply@studtrade.com';
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': process.env.BREVO_API_KEY.trim(),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    sender: { name: 'StudTrade', email: senderEmail },
                    to: [{ email: to }],
                    subject: 'Your StudTrade Email Verification Code',
                    htmlContent: htmlContent,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                console.log(`✅ [Brevo API] OTP email successfully delivered to ${to} (MessageId: ${data.messageId})`);
                return true;
            } else {
                console.warn(`⚠️ [Brevo API] Delivery failed:`, data);
            }
        } catch (brevoErr) {
            console.warn(`⚠️ [Brevo API] Request error:`, brevoErr.message || brevoErr);
        }
    }

    // ── Option 2: Nodemailer SMTP (Gmail / Custom SMTP) ──────────────────────────
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Neither RESEND_API_KEY nor EMAIL_USER/EMAIL_PASS configured in environment. OTP logged to console.');
        return false;
    }

    const emailUser = process.env.EMAIL_USER.trim();
    const emailPass = process.env.EMAIL_PASS.replace(/\s+/g, '');

    // Transport options optimized for both local and cloud environments (Render/Railway)
    const transportOptions = [
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Direct SSL
            family: 4, // Force IPv4 (fixes ENETUNREACH IPv6 error on Render)
            auth: { user: emailUser, pass: emailPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 8000,
            greetingTimeout: 6000,
            socketTimeout: 8000,
        },
        {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // STARTTLS
            family: 4, // Force IPv4
            auth: { user: emailUser, pass: emailPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 8000,
            socketTimeout: 8000,
        },
        {
            service: 'gmail',
            family: 4,
            auth: { user: emailUser, pass: emailPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 8000,
            greetingTimeout: 6000,
            socketTimeout: 8000,
        },
    ];

    for (const options of transportOptions) {
        try {
            const transporter = nodemailer.createTransport(options);
            await transporter.sendMail({
                from: `"StudTrade" <${emailUser}>`,
                to,
                subject: 'Your StudTrade Email Verification Code',
                html: htmlContent,
            });

            console.log(`✅ [Nodemailer SMTP] OTP email successfully delivered to ${to}`);
            return true;
        } catch (err) {
            console.warn(`⚠️ [Nodemailer SMTP] Transport attempt failed (${options.service || options.port}):`, err.message || err);
        }
    }

    console.error(`❌ All email transport attempts failed for ${to}. OTP code logged to server console.`);
    return false;
};

export default sendOtpEmail;