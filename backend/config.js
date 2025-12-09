require('dotenv').config();

const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },

  // Google Sheets
  googleSheetId: process.env.GOOGLE_SHEET_ID,

  // reCAPTCHA
  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // максимум 5 запросов
  },

  // Security
  isProduction: process.env.NODE_ENV === 'production',
};

// Проверка критичных переменных окружения
function validateConfig() {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'GOOGLE_SHEET_ID',
    'RECAPTCHA_SITE_KEY',
    'RECAPTCHA_SECRET_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('Application may not function correctly without these variables.');
  }
}

validateConfig();

module.exports = config;
