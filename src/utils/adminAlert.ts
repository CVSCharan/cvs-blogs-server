import axios from 'axios';
import logger from './logger';

const ADMIN_WEBHOOK_URL = process.env.ADMIN_WEBHOOK_URL;

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Sends an alert to the admin (e.g., via Discord/Slack webhook)
 */
export const sendAdminAlert = async (
  title: string,
  message: string,
  level: AlertLevel = AlertLevel.INFO
) => {
  const payload = {
    title,
    message,
    level,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // Log the alert locally first
  if (level === AlertLevel.CRITICAL) {
    logger.error(`ADMIN ALERT [${level.toUpperCase()}]: ${title} - ${message}`, { payload });
  } else {
    logger.warn(`ADMIN ALERT [${level.toUpperCase()}]: ${title} - ${message}`, { payload });
  }

  // Send to external webhook if configured
  if (ADMIN_WEBHOOK_URL) {
    try {
      await axios.post(ADMIN_WEBHOOK_URL, {
        content: `**[${level.toUpperCase()}] ${title}**\n${message}`,
      });
    } catch (err) {
      logger.error('Failed to send admin alert to webhook', { error: err });
    }
  }
};
