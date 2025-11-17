import twilio from 'twilio';
import { logger } from '@/utils/logger';

interface SMSOptions {
  to: string;
  message: string;
}

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (options: SMSOptions): Promise<boolean> => {
  try {
    // Format phone number for Indian numbers
    let phoneNumber = options.to;
    if (phoneNumber.startsWith('91')) {
      phoneNumber = '+' + phoneNumber;
    } else if (phoneNumber.startsWith('0')) {
      phoneNumber = '+91' + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+91' + phoneNumber;
    }

    const message = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    logger.info(`SMS sent successfully to ${phoneNumber}`, { sid: message.sid });
    return true;
  } catch (error) {
    logger.error('Failed to send SMS:', error);
    return false;
  }
};

export const sendBulkSMS = async (messages: SMSOptions[]): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  const promises = messages.map(async (sms) => {
    try {
      await sendSMS(sms);
      success++;
    } catch (error) {
      failed++;
      logger.error(`Failed to send SMS to ${sms.to}:`, error);
    }
  });

  await Promise.allSettled(promises);

  logger.info(`Bulk SMS results: ${success} successful, ${failed} failed`);
  return { success, failed };
};

// SMS Templates
export const getSMSTemplate = (template: string, data: any): string => {
  switch (template) {
    case 'welcome':
      return `Welcome to Farm Smart Horizon! Your account has been created successfully. Please verify your email to get started.`;

    case 'verification':
      return `Your Farm Smart Horizon verification code is: ${data.code}. This code expires in 10 minutes.`;

    case 'passwordReset':
      return `Your password reset code for Farm Smart Horizon is: ${data.code}. This code expires in 10 minutes.`;

    case 'schemeApproval':
      return `Great news! Your ${data.schemeName} application (ID: ${data.applicationId}) has been approved for ₹${data.amount}. Check your email for details.`;

    case 'marketAlert':
      return `Market Alert: ${data.crop} price in ${data.market} changed to ₹${data.currentPrice}/kg (${data.change > 0 ? '+' : ''}${data.change}%). Farm Smart Horizon`;

    case 'weatherAlert':
      return `Weather Alert: ${data.alertType} expected in ${data.location}. ${data.description}. Take necessary precautions. Farm Smart Horizon`;

    case 'pestAlert':
      return `Pest Alert: ${data.pestName} outbreak reported in ${data.location}. Check your ${data.crops.join(', ')} crops. Farm Smart Horizon`;

    case 'irrigationReminder':
      return `Irrigation Reminder: Your ${data.crop} field needs watering. Optimal time: ${data.time}. Farm Smart Horizon`;

    case 'loanApproval':
      return `Loan Approved! Your ${data.loanType} application for ₹${data.amount} has been approved. Disbursal in ${data.days} days. Farm Smart Horizon`;

    case 'loanReminder':
      return `Payment Reminder: Your ${data.loanType} EMI of ₹${data.amount} is due on ${data.dueDate}. Farm Smart Horizon`;

    case 'tradingMatch':
      return `Trading Match: Buyer interested in your ${data.crop} (${data.quantity}kg at ₹${data.price}/kg). Check app for details. Farm Smart Horizon`;

    default:
      return data.message || 'Farm Smart Horizon notification';
  }
};

export const sendTemplateSMS = async (to: string, template: string, data: any): Promise<boolean> => {
  const message = getSMSTemplate(template, data);
  return await sendSMS({ to, message });
};
