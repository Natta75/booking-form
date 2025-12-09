require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const axios = require('axios');

const config = require('./config');
const logger = require('./logger');
const TelegramNotifier = require('./telegram');
const GoogleSheetsManager = require('./sheets');
const BookingValidator = require('./validation');

const app = express();

// ============ MIDDLEWARE ============

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
      frameSrc: ["https://www.google.com"],
      connectSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
      imgSrc: ["'self'", "https://www.gstatic.com", "data:"],
    }
  }
}));

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '..')));

// HTTPS redirect in production
if (config.isProduction) {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
  });
}

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rate limiting (защита от DDoS)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Слишком много запросов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============ ИНИЦИАЛИЗАЦИЯ СЕРВИСОВ ============

const telegram = new TelegramNotifier(
  config.telegram.botToken,
  config.telegram.chatId
);

const sheets = new GoogleSheetsManager(config.googleSheetId);

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

/**
 * Проверка reCAPTCHA токена
 */
async function verifyRecaptcha(token) {
  if (!config.recaptcha.secretKey) {
    logger.warn('reCAPTCHA secret key not configured, skipping verification');
    return true; // В dev режиме пропускаем
  }

  // Логировать токен для отладки
  logger.info('Verifying reCAPTCHA token', {
    tokenPresent: !!token,
    tokenLength: token ? token.length : 0
  });

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: config.recaptcha.secretKey,
          response: token
        }
      }
    );

    const { success, score, 'error-codes': errorCodes } = response.data;

    logger.info('reCAPTCHA verification result', {
      success,
      score: score || 'N/A',
      errorCodes: errorCodes || []
    });

    // Для reCAPTCHA v3 проверяем score (минимум 0.5)
    return success && (score === undefined || score >= 0.5);
  } catch (error) {
    logger.error('reCAPTCHA verification failed', {
      error: error.message,
      responseData: error.response?.data
    });
    return false;
  }
}

// ============ API ENDPOINTS ============

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

/**
 * Главный endpoint для обработки заявок на бронирование
 */
app.post('/api/submit', limiter, async (req, res) => {
  try {
    logger.info('Processing booking request', { ip: req.ip });

    // 1. Проверка reCAPTCHA
    const isHuman = await verifyRecaptcha(req.body.recaptchaToken);
    if (!isHuman) {
      logger.warn('reCAPTCHA verification failed', { ip: req.ip });
      return res.status(400).json({
        success: false,
        error: 'Проверка reCAPTCHA не пройдена. Попробуйте еще раз.'
      });
    }

    // 2. Валидация данных
    const validationErrors = BookingValidator.validateBookingData(req.body);
    if (validationErrors.length > 0) {
      logger.warn('Validation failed', {
        errors: validationErrors,
        ip: req.ip
      });
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    // 3. Санитизация данных
    const bookingData = BookingValidator.sanitizeData(req.body);
    bookingData.ipAddress = req.ip;

    logger.info('Booking data validated and sanitized', {
      email: bookingData.email
    });

    // 4. Сохранение в Google Sheets
    const sheetsResult = await sheets.appendBooking(bookingData);
    if (!sheetsResult.success) {
      logger.error('Failed to save to Google Sheets', {
        error: sheetsResult.error,
        email: bookingData.email
      });
      // Не прерываем процесс, продолжаем отправку в Telegram
    }

    // 5. Отправка в Telegram
    const telegramResult = await telegram.sendBookingNotification(bookingData);
    if (!telegramResult.success) {
      logger.error('Failed to send Telegram notification', {
        error: telegramResult.error,
        email: bookingData.email
      });
    }

    // 6. Успешный ответ
    logger.info('Booking processed successfully', {
      name: bookingData.name,
      email: bookingData.email,
      date: bookingData.date
    });

    res.json({
      success: true,
      message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
    });

  } catch (error) {
    logger.error('Unexpected error processing booking', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Произошла ошибка при обработке заявки. Пожалуйста, попробуйте позже.'
    });
  }
});

/**
 * Endpoint для получения конфигурации (reCAPTCHA site key)
 */
app.get('/api/config', (req, res) => {
  res.json({
    recaptchaSiteKey: config.recaptcha.siteKey || ''
  });
});

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ============ SERVER START ============

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT}`, {
    environment: config.nodeEnv,
    port: PORT
  });

  // Проверка конфигурации при старте
  if (telegram.enabled) {
    logger.info('✅ Telegram notifications: enabled');
  } else {
    logger.warn('⚠️  Telegram notifications: disabled');
  }

  if (sheets.enabled) {
    logger.info('✅ Google Sheets integration: enabled');
    // Тестируем подключение
    sheets.testConnection();
  } else {
    logger.warn('⚠️  Google Sheets integration: disabled');
  }

  if (config.recaptcha.secretKey) {
    logger.info('✅ reCAPTCHA protection: enabled');
  } else {
    logger.warn('⚠️  reCAPTCHA protection: disabled');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
