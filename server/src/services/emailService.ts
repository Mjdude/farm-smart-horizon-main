import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
  attachments?: any[];
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const getEmailTemplate = (template: string, data: any): { html: string; text: string } => {
  switch (template) {
    case 'verification':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Farm Smart Horizon!</h2>
            <p>Hello ${data.name},</p>
            <p>Thank you for registering with Farm Smart Horizon. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${data.verificationUrl}">${data.verificationUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>Farm Smart Horizon Team</p>
          </div>
        `,
        text: `
          Welcome to Farm Smart Horizon!
          
          Hello ${data.name},
          
          Thank you for registering with Farm Smart Horizon. Please verify your email address by visiting:
          ${data.verificationUrl}
          
          This link will expire in 1 hour.
          
          Best regards,
          Farm Smart Horizon Team
        `
      };

    case 'passwordReset':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>Hello ${data.name},</p>
            <p>You requested a password reset for your Farm Smart Horizon account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>Farm Smart Horizon Team</p>
          </div>
        `,
        text: `
          Password Reset Request
          
          Hello ${data.name},
          
          You requested a password reset for your Farm Smart Horizon account. Visit this link to reset your password:
          ${data.resetUrl}
          
          This link will expire in 1 hour.
          
          If you didn't request this password reset, please ignore this email.
          
          Best regards,
          Farm Smart Horizon Team
        `
      };

    case 'schemeApproval':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Scheme Application Approved!</h2>
            <p>Hello ${data.name},</p>
            <p>Great news! Your application for <strong>${data.schemeName}</strong> has been approved.</p>
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Application Details:</h3>
              <p><strong>Scheme:</strong> ${data.schemeName}</p>
              <p><strong>Application ID:</strong> ${data.applicationId}</p>
              <p><strong>Approved Amount:</strong> ₹${data.amount}</p>
              <p><strong>Next Steps:</strong> ${data.nextSteps}</p>
            </div>
            <p>You will receive further instructions via SMS and email.</p>
            <p>Best regards,<br>Farm Smart Horizon Team</p>
          </div>
        `,
        text: `
          Scheme Application Approved!
          
          Hello ${data.name},
          
          Great news! Your application for ${data.schemeName} has been approved.
          
          Application Details:
          - Scheme: ${data.schemeName}
          - Application ID: ${data.applicationId}
          - Approved Amount: ₹${data.amount}
          - Next Steps: ${data.nextSteps}
          
          You will receive further instructions via SMS and email.
          
          Best regards,
          Farm Smart Horizon Team
        `
      };

    case 'marketAlert':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ea580c;">Market Price Alert</h2>
            <p>Hello ${data.name},</p>
            <p>There's been a significant price change for ${data.crop} in ${data.market}:</p>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Price Update:</h3>
              <p><strong>Crop:</strong> ${data.crop}</p>
              <p><strong>Market:</strong> ${data.market}</p>
              <p><strong>Current Price:</strong> ₹${data.currentPrice}/kg</p>
              <p><strong>Previous Price:</strong> ₹${data.previousPrice}/kg</p>
              <p><strong>Change:</strong> ${data.change > 0 ? '+' : ''}${data.change}% (₹${data.priceChange}/kg)</p>
            </div>
            <p>Consider this information for your trading decisions.</p>
            <p>Best regards,<br>Farm Smart Horizon Team</p>
          </div>
        `,
        text: `
          Market Price Alert
          
          Hello ${data.name},
          
          There's been a significant price change for ${data.crop} in ${data.market}:
          
          Price Update:
          - Crop: ${data.crop}
          - Market: ${data.market}
          - Current Price: ₹${data.currentPrice}/kg
          - Previous Price: ₹${data.previousPrice}/kg
          - Change: ${data.change > 0 ? '+' : ''}${data.change}% (₹${data.priceChange}/kg)
          
          Consider this information for your trading decisions.
          
          Best regards,
          Farm Smart Horizon Team
        `
      };

    default:
      return {
        html: `<p>${data.message}</p>`,
        text: data.message
      };
  }
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const template = getEmailTemplate(options.template, options.data);

    const mailOptions = {
      from: `"Farm Smart Horizon" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: template.html,
      text: template.text,
      attachments: options.attachments || []
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`, { messageId: result.messageId });
    
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

export const sendBulkEmails = async (emails: EmailOptions[]): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  const promises = emails.map(async (email) => {
    try {
      await sendEmail(email);
      success++;
    } catch (error) {
      failed++;
      logger.error(`Failed to send email to ${email.to}:`, error);
    }
  });

  await Promise.allSettled(promises);

  logger.info(`Bulk email results: ${success} successful, ${failed} failed`);
  return { success, failed };
};
