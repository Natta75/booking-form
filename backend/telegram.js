const TelegramBot = require('node-telegram-bot-api');
const logger = require('./logger');

class TelegramNotifier {
  constructor(token, chatId) {
    if (!token || !chatId) {
      logger.warn('Telegram credentials not provided. Notifications will be disabled.');
      this.enabled = false;
      return;
    }

    this.bot = new TelegramBot(token, { polling: false });
    this.chatId = chatId;
    this.enabled = true;
    logger.info('Telegram notifier initialized');
  }

  async sendBookingNotification(bookingData) {
    if (!this.enabled) {
      logger.warn('Telegram notifications are disabled');
      return { success: false, error: 'Notifications disabled' };
    }

    const message = `
🆕 <b>Новая заявка на бронирование</b>

👤 <b>Имя:</b> ${this.escapeHtml(bookingData.name)}
📱 <b>Телефон:</b> ${this.escapeHtml(bookingData.phone)}
📧 <b>Email:</b> ${this.escapeHtml(bookingData.email)}
📅 <b>Дата:</b> ${new Date(bookingData.date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}

⏰ <b>Получено:</b> ${new Date(bookingData.timestamp).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
    `.trim();

    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML'
      });

      logger.info('Telegram notification sent', {
        email: bookingData.email,
        name: bookingData.name
      });

      return { success: true };
    } catch (error) {
      logger.error('Telegram notification failed', {
        error: error.message,
        email: bookingData.email
      });

      return { success: false, error: error.message };
    }
  }

  // Экранирование HTML для Telegram
  escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

module.exports = TelegramNotifier;
