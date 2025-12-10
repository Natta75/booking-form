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

  // reCAPTCHA Enterprise
  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    apiKey: process.env.RECAPTCHA_API_KEY,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    // Путь к Service Account (для локальной разработки)
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
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
  ];

  const recaptchaRequired = [
    'RECAPTCHA_SITE_KEY',
    'RECAPTCHA_API_KEY',
    'GOOGLE_CLOUD_PROJECT_ID',
  ];

  const missing = required.filter(key => !process.env[key]);
  const recaptchaMissing = recaptchaRequired.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`);
    console.warn('Application may not function correctly without these variables.');
  }

  if (recaptchaMissing.length > 0) {
    console.warn(`⚠️  Missing reCAPTCHA Enterprise variables: ${recaptchaMissing.join(', ')}`);
    console.warn('reCAPTCHA protection will be disabled.');
  }
}

validateConfig();

module.exports = config;
