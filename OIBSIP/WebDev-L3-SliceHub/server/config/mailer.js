const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_USER.includes('your_email')) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback / Dev mode: log to console so system runs without external SMTP blocker
  return {
    sendMail: async (options) => {
      console.log('\n================== [DEV EMAIL DISPATCHED] ==================');
      console.log(`To:      ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Text:    ${options.text || ''}`);
      if (options.html) {
        console.log(`HTML Body (preview snippet): ${options.html.substring(0, 300)}...`);
      }
      console.log('============================================================\n');
      return { messageId: `dev-mock-${Date.now()}` };
    }
  };
};

const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #12141a; color: #f2f2f2; padding: 30px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
      <h1 style="color: #e8590c; margin-bottom: 8px;">Welcome to SliceHub! 🍕</h1>
      <p style="color: #a0a5b5; font-size: 15px; line-height: 1.5;">
        Thank you for signing up for SliceHub. Please verify your email address to start building custom artisan pizzas.
      </p>
      <div style="margin: 25px 0;">
        <a href="${verificationUrl}" style="background-color: #e8590c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Verify My Email
        </a>
      </div>
      <p style="color: #707585; font-size: 12px;">Or copy and paste this link in your browser:<br/><a href="${verificationUrl}" style="color: #e8590c;">${verificationUrl}</a></p>
      <p style="color: #707585; font-size: 12px; margin-top: 20px;">This link will expire in 24 hours.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SliceHub Pizza" <${process.env.SMTP_USER || 'no-reply@slicehub.com'}>`,
      to: email,
      subject: 'Verify your SliceHub account',
      html,
    });
  } catch (err) {
    console.error(`[Mailer] Failed to send verification email to ${email}:`, err.message);
  }
};

const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #12141a; color: #f2f2f2; padding: 30px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
      <h1 style="color: #e8590c; margin-bottom: 8px;">Password Reset Request 🔑</h1>
      <p style="color: #a0a5b5; font-size: 15px; line-height: 1.5;">
        We received a request to reset your password for your SliceHub account. Click the button below to set a new password.
      </p>
      <div style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #e8590c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #707585; font-size: 12px;">Or copy and paste this link in your browser:<br/><a href="${resetUrl}" style="color: #e8590c;">${resetUrl}</a></p>
      <p style="color: #707585; font-size: 12px; margin-top: 20px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SliceHub Security" <${process.env.SMTP_USER || 'no-reply@slicehub.com'}>`,
      to: email,
      subject: 'Reset your SliceHub password',
      html,
    });
  } catch (err) {
    console.error(`[Mailer] Failed to send reset email to ${email}:`, err.message);
  }
};

const sendLowStockEmail = async (lowItems) => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@slicehub.test';

  const rows = lowItems.map(item => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
      <td style="padding: 10px; font-weight: 500;">${item.name}</td>
      <td style="padding: 10px; text-transform: capitalize; color: #a0a5b5;">${item.category}</td>
      <td style="padding: 10px; color: #ff6b6b; font-weight: bold;">${item.quantity}</td>
      <td style="padding: 10px; color: #a0a5b5;">${item.threshold}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #12141a; color: #f2f2f2; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #e8590c; margin-bottom: 8px;">⚠️ Low Stock Digest Alert</h1>
      <p style="color: #a0a5b5; font-size: 15px; line-height: 1.5;">
        The automated inventory monitor detected <strong>${lowItems.length} item(s)</strong> that have fallen below their minimum threshold.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; text-align: left; background: #191c24; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #222632; color: #f2f2f2;">
            <th style="padding: 10px;">Ingredient</th>
            <th style="padding: 10px;">Category</th>
            <th style="padding: 10px;">Current Stock</th>
            <th style="padding: 10px;">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div style="margin-top: 25px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/inventory" style="background-color: #e8590c; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Manage Inventory in Dashboard
        </a>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SliceHub System Alerts" <${process.env.SMTP_USER || 'no-reply@slicehub.com'}>`,
      to: adminEmail,
      subject: `🚨 SliceHub Alert: ${lowItems.length} Ingredient(s) Low on Stock`,
      html,
    });
    console.log(`[Mailer] Low stock digest sent for ${lowItems.length} items to ${adminEmail}`);
  } catch (err) {
    console.error('[Mailer] Failed to send low stock alert:', err.message);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockEmail,
};
