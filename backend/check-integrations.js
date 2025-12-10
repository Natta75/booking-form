/**
 * Проверка статуса всех интеграций проекта
 *
 * Использование:
 *   node backend/check-integrations.js
 *
 * Проверяет:
 * - Telegram Bot (токен и chat ID)
 * - Google Sheets (credentials и Sheet ID)
 * - Google reCAPTCHA v3 (Site Key и Secret Key)
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// ============ ПРОВЕРКА TELEGRAM ============

async function checkTelegram() {
  log('\n📱 Telegram Bot', 'cyan');
  log('─'.repeat(60), 'gray');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    log('❌ TELEGRAM_BOT_TOKEN не настроен', 'red');
    log('   Получите токен от @BotFather', 'yellow');
    return false;
  }

  if (!chatId) {
    log('❌ TELEGRAM_CHAT_ID не настроен', 'red');
    log('   Запустите: node backend/getChatId.js', 'yellow');
    return false;
  }

  log('✅ Токен найден: ' + token.split(':')[0] + ':***', 'green');
  log('✅ Chat ID: ' + chatId, 'green');

  // Проверка подключения к Telegram API
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${token}/getMe`,
      { timeout: 5000 }
    );

    if (response.data.ok) {
      const botInfo = response.data.result;
      log('✅ Подключение к Telegram API: OK', 'green');
      log(`   Бот: @${botInfo.username} (${botInfo.first_name})`, 'blue');
      return true;
    } else {
      log('❌ Telegram API вернул ошибку', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Не удалось подключиться к Telegram API', 'red');
    if (error.response?.data?.description) {
      log('   Ошибка: ' + error.response.data.description, 'yellow');
    } else {
      log('   Ошибка: ' + error.message, 'yellow');
    }
    return false;
  }
}

// ============ ПРОВЕРКА GOOGLE SHEETS ============

async function checkGoogleSheets() {
  log('\n📊 Google Sheets', 'cyan');
  log('─'.repeat(60), 'gray');

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const credentialsPath = path.join(__dirname, '../config/google-credentials.json');

  if (!sheetId) {
    log('❌ GOOGLE_SHEET_ID не настроен', 'red');
    log('   Добавьте ID таблицы в .env', 'yellow');
    return false;
  }

  log('✅ Sheet ID: ' + sheetId, 'green');

  if (!fs.existsSync(credentialsPath)) {
    log('❌ Файл google-credentials.json не найден', 'red');
    log('   Путь: ' + credentialsPath, 'yellow');
    log('   Создайте Service Account в Google Cloud Console', 'yellow');
    return false;
  }

  log('✅ Файл credentials найден', 'green');

  // Проверка формата credentials
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    if (!credentials.client_email) {
      log('❌ Неверный формат credentials (нет client_email)', 'red');
      return false;
    }

    if (!credentials.private_key) {
      log('❌ Неверный формат credentials (нет private_key)', 'red');
      return false;
    }

    log('✅ Service Account: ' + credentials.client_email, 'green');
    log('✅ Формат credentials корректен', 'green');

    log('', 'reset');
    log('⚠️  Убедитесь, что таблица расшарена с:', 'yellow');
    log('   ' + credentials.client_email, 'blue');
    log('   (права Editor)', 'gray');

    return true;
  } catch (error) {
    log('❌ Ошибка чтения credentials: ' + error.message, 'red');
    return false;
  }
}

// ============ ПРОВЕРКА RECAPTCHA ============

async function checkRecaptcha() {
  log('\n🛡️  Google reCAPTCHA v3', 'cyan');
  log('─'.repeat(60), 'gray');

  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!siteKey) {
    log('⚠️  RECAPTCHA_SITE_KEY не настроен', 'yellow');
    log('   reCAPTCHA будет отключена', 'yellow');
    log('   Инструкция: docs/RECAPTCHA_SETUP_GUIDE.md', 'blue');
    return null; // null = не критично
  }

  if (!secretKey) {
    log('⚠️  RECAPTCHA_SECRET_KEY не настроен', 'yellow');
    log('   reCAPTCHA будет отключена', 'yellow');
    return null;
  }

  log('✅ Site Key: ' + siteKey.substring(0, 10) + '...', 'green');
  log('✅ Secret Key: ' + secretKey.substring(0, 10) + '...', 'green');

  // Проверка подключения к Google reCAPTCHA API
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: 'test-token'
        },
        timeout: 5000
      }
    );

    if (response.data && response.data['error-codes']) {
      const errors = response.data['error-codes'];

      if (errors.includes('invalid-input-secret')) {
        log('❌ Secret Key невалиден', 'red');
        log('   Проверьте ключ на: https://www.google.com/recaptcha/admin', 'yellow');
        return false;
      } else if (errors.includes('invalid-input-response')) {
        // Это ожидаемая ошибка при тестовом токене
        log('✅ Подключение к reCAPTCHA API: OK', 'green');
        log('✅ Secret Key валиден', 'green');
        return true;
      }
    }

    log('✅ Подключение к reCAPTCHA API: OK', 'green');
    return true;
  } catch (error) {
    log('❌ Ошибка подключения к reCAPTCHA API', 'red');
    log('   ' + error.message, 'yellow');
    return false;
  }
}

// ============ ПРОВЕРКА ОБЩИХ НАСТРОЕК ============

function checkGeneralConfig() {
  log('\n⚙️  Общие настройки', 'cyan');
  log('─'.repeat(60), 'gray');

  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || 3000;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  log('Environment: ' + nodeEnv, nodeEnv === 'production' ? 'yellow' : 'blue');
  log('Port: ' + port, 'blue');
  log('Frontend URL: ' + frontendUrl, 'blue');

  return true;
}

// ============ ИТОГИ ============

function printSummary(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('  📊 ИТОГИ ПРОВЕРКИ', 'cyan');
  log('='.repeat(60), 'cyan');
  log('');

  const { telegram, sheets, recaptcha, general } = results;

  // Критичные интеграции
  const critical = [
    { name: 'Telegram Bot', status: telegram },
    { name: 'Google Sheets', status: sheets },
  ];

  // Опциональные
  const optional = [
    { name: 'reCAPTCHA v3', status: recaptcha },
  ];

  let allCriticalOk = true;

  log('Критичные интеграции:', 'cyan');
  critical.forEach(item => {
    if (item.status === true) {
      log('  ✅ ' + item.name, 'green');
    } else {
      log('  ❌ ' + item.name + ' - требует настройки', 'red');
      allCriticalOk = false;
    }
  });

  log('');
  log('Опциональные интеграции:', 'cyan');
  optional.forEach(item => {
    if (item.status === true) {
      log('  ✅ ' + item.name, 'green');
    } else if (item.status === null) {
      log('  ⚠️  ' + item.name + ' - отключена', 'yellow');
    } else {
      log('  ❌ ' + item.name + ' - требует настройки', 'red');
    }
  });

  log('');
  log('='.repeat(60), 'cyan');

  if (allCriticalOk) {
    log('🎉 Все критичные интеграции настроены!', 'green');
    log('');
    log('Можно запускать сервер:', 'green');
    log('  npm run dev', 'blue');
    log('');

    if (recaptcha !== true) {
      log('⚠️  reCAPTCHA отключена - форма будет работать без защиты от ботов', 'yellow');
      log('   Рекомендуется настроить: docs/RECAPTCHA_SETUP_GUIDE.md', 'blue');
    }
  } else {
    log('⚠️  Некоторые интеграции требуют настройки', 'yellow');
    log('');
    log('Смотрите инструкции:', 'yellow');
    log('  README.md', 'blue');
    log('  docs/RECAPTCHA_SETUP_GUIDE.md', 'blue');
  }

  log('='.repeat(60), 'cyan');
  log('');
}

// ============ ГЛАВНАЯ ФУНКЦИЯ ============

async function main() {
  log('');
  log('═'.repeat(60), 'cyan');
  log('  🔍 ПРОВЕРКА ИНТЕГРАЦИЙ BOOKING FORM', 'cyan');
  log('═'.repeat(60), 'cyan');

  const results = {
    general: checkGeneralConfig(),
    telegram: await checkTelegram(),
    sheets: await checkGoogleSheets(),
    recaptcha: await checkRecaptcha(),
  };

  printSummary(results);

  // Возвращаем код выхода (0 = все ОК, 1 = есть ошибки)
  const allOk = results.telegram && results.sheets;
  process.exit(allOk ? 0 : 1);
}

// Запуск
main().catch(error => {
  log('\n❌ Критическая ошибка:', 'red');
  log(error.message, 'red');
  if (error.stack) {
    log('\n' + error.stack, 'gray');
  }
  process.exit(1);
});
