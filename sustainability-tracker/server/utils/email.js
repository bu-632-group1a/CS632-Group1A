import nodemailer from 'nodemailer';

// Create transporter using environment variables
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email configuration missing. Password reset emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates for development
    }
  });
};

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const mailOptions = {
      from: `"EcoPulse - Sustainability Tracker" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'EcoPulse - Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for signing up! Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            This verification link will expire in 24 hours.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, resetToken, firstName) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
    
    const mailOptions = {
      from: `"EcoPulse - Sustainability Tracker" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'EcoPulse - Reset Your Password - Sustainability Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 28px;">🌱 Sustainability Tracker</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Hi ${firstName || 'there'},
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your Sustainability Tracker account. 
              If you made this request, click the button below to set a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}" 
                 style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> This reset link will expire in 1 hour for your security.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
              If you didn't request a password reset, you can safely ignore this email. 
              Your password will remain unchanged.
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you're having trouble clicking the button, copy and paste this link into your browser:
            </p>
            <p style="color: #16a34a; font-size: 12px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              This email was sent by Sustainability Tracker. If you have questions, please contact our support team.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

export const sendPasswordResetConfirmationEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('⚠️  Email service not configured. Skipping confirmation email.');
      return { success: false, message: 'Email service not configured' };
    }
    
    const mailOptions = {
      from: `"EcoPulse - Sustainability Tracker" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'EcoPulse - Password Successfully Reset - Sustainability Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 28px;">🌱 Sustainability Tracker</h1>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background-color: #dcfce7; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: #16a34a; font-size: 24px;">✓</span>
              </div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Password Reset Successful</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Hi ${firstName || 'there'},
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Your password has been successfully reset for your Sustainability Tracker account. 
              You can now log in with your new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" 
                 style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                Log In to Your Account
              </a>
            </div>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #dc2626; margin: 0; font-size: 14px;">
                <strong>Security Alert:</strong> If you didn't reset your password, please contact our support team immediately.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              This email was sent by Sustainability Tracker. If you have questions, please contact our support team.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset confirmation email:', error);
    // Don't throw error for confirmation emails - they're not critical
    return { success: false, message: error.message };
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, message: 'Email configuration missing' };
    }

    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    return { success: false, message: `Email configuration test failed: ${error.message}` };
  }
};