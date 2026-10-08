const nodemailer = require('nodemailer');
const crypto = require('crypto');
const config = require('../config')[process.env.NODE_ENV || 'development'];

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure || false,
    auth: config.email.auth
  });
};

// Generate secure random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email verification
const sendEmailVerification = async (user) => {
  try {
    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with verification token
    await user.update({
      emailVerificationToken: token,
      emailVerificationExpires: expires
    });

    const transporter = createTransporter();
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: config.email.from,
      to: user.email,
      subject: 'Verify Your SciConnect Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧬 SciConnect</h1>
              <h2>Welcome to the Scientific Community!</h2>
            </div>
            <div class="content">
              <h3>Hi ${user.name},</h3>
              <p>Thank you for joining SciConnect! To get started, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with SciConnect, please ignore this email.</p>
              <hr>
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Connect with scientists and researchers worldwide</li>
                <li>Share your research and discoveries</li>
                <li>Participate in scientific discussions</li>
                <li>Access exclusive scientific content</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2024 SciConnect. All rights reserved.</p>
              <p>If you have any questions, contact us at support@sciconnect.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordReset = async (user) => {
  try {
    const token = generateToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await user.update({
      passwordResetToken: token,
      passwordResetExpires: expires
    });

    const transporter = createTransporter();
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: config.email.from,
      to: user.email,
      subject: 'Reset Your SciConnect Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧬 SciConnect</h1>
              <h2>Password Reset Request</h2>
            </div>
            <div class="content">
              <h3>Hi ${user.name},</h3>
              <p>We received a request to reset your password for your SciConnect account. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>You can only use this link once</li>
                  <li>If you didn't request this reset, please ignore this email and your password will remain unchanged</li>
                </ul>
              </div>
              <p>For security reasons, we recommend that you:</p>
              <ul>
                <li>Choose a strong, unique password</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Enable two-factor authentication if available</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2024 SciConnect. All rights reserved.</p>
              <p>If you have any questions, contact us at support@sciconnect.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.email.from,
      to: user.email,
      subject: 'Welcome to SciConnect! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SciConnect</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #4facfe; }
            .button { display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧬 SciConnect</h1>
              <h2>Welcome to the Community!</h2>
            </div>
            <div class="content">
              <h3>Hi ${user.name}! 🎉</h3>
              <p>Your email has been verified and your SciConnect account is now fully activated! Welcome to the global scientific community.</p>
              
              <div class="feature">
                <h4>🔬 Share Your Research</h4>
                <p>Post about your latest discoveries, experiments, and findings to connect with researchers worldwide.</p>
              </div>
              
              <div class="feature">
                <h4>💬 Real-time Discussions</h4>
                <p>Engage in live conversations with fellow scientists and researchers through our chat system.</p>
              </div>
              
              <div class="feature">
                <h4>🌐 Global Network</h4>
                <p>Connect with scientists from different fields and institutions to expand your network.</p>
              </div>
              
              <div class="feature">
                <h4>📚 Knowledge Sharing</h4>
                <p>Access cutting-edge research and share your expertise with the community.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${config.frontendUrl}" class="button">Start Exploring SciConnect</a>
              </div>
              
              <p>Need help getting started? Check out our <a href="${config.frontendUrl}/help">Help Center</a> or reach out to our community team.</p>
            </div>
            <div class="footer">
              <p>© 2024 SciConnect. All rights reserved.</p>
              <p>Follow us on social media for the latest updates and scientific news</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmailVerification,
  sendPasswordReset,
  sendWelcomeEmail,
  generateToken
}; 