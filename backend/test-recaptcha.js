/**
 * Скрипт для тестирования работы Google reCAPTCHA v3
 *
 * Использование:
 *   node backend/test-recaptcha.js
 *
 * Что проверяет:
 * - Наличие ключей reCAPTCHA в .env
 * - Корректность формата ключей
 * - Подключение к Google API
 */

require('dotenv').config();
const axios = require('axios');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function checkEnvVariables() {
  log('\n📋 Проверка переменных окружения...', 'cyan');

  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!siteKey) {
    log('❌ RECAPTCHA_SITE_KEY не найден в .env', 'red');
    log('   Добавьте: RECAPTCHA_SITE_KEY=ваш_site_key', 'yellow');
    return false;
  }

  if (!secretKey) {
    log('❌ RECAPTCHA_SECRET_KEY не найден в .env', 'red');
    log('   Добавьте: RECAPTCHA_SECRET_KEY=ваш_secret_key', 'yellow');
    return false;
  }

  // Проверка формата ключей (обычно начинаются с 6L)
  if (!siteKey.startsWith('6L')) {
    log('⚠️  Site Key имеет необычный формат (обычно начинается с 6L)', 'yellow');
    log('   Site Key: ' + siteKey.substring(0, 10) + '...', 'yellow');
  } else {
    log('✅ Site Key найден: ' + siteKey.substring(0, 10) + '...', 'green');
  }

  if (!secretKey.startsWith('6L')) {
    log('⚠️  Secret Key имеет необычный формат (обычно начинается с 6L)', 'yellow');
    log('   Secret Key: ' + secretKey.substring(0, 10) + '...', 'yellow');
  } else {
    log('✅ Secret Key найден: ' + secretKey.substring(0, 10) + '...', 'green');
  }

  // Проверка длины ключей (обычно 40 символов)
  if (siteKey.length < 30 || siteKey.length > 50) {
    log('⚠️  Site Key имеет необычную длину: ' + siteKey.length + ' символов', 'yellow');
  } else {
    log('✅ Длина Site Key корректна: ' + siteKey.length + ' символов', 'green');
  }

  if (secretKey.length < 30 || secretKey.length > 50) {
    log('⚠️  Secret Key имеет необычную длину: ' + secretKey.length + ' символов', 'yellow');
  } else {
    log('✅ Длина Secret Key корректна: ' + secretKey.length + ' символов', 'green');
  }

  return true;
}

async function testGoogleAPI() {
  log('\n🌐 Проверка подключения к Google reCAPTCHA API...', 'cyan');

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    // Делаем тестовый запрос с недействительным токеном
    // Если API отвечает, значит подключение работает
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: 'test-invalid-token'
        },
        timeout: 5000
      }
    );

    // Проверяем формат ответа
    if (response.data && typeof response.data.success === 'boolean') {
      log('✅ Google API отвечает корректно', 'green');

      if (response.data['error-codes']) {
        const errors = response.data['error-codes'];

        if (errors.includes('invalid-input-secret')) {
          log('❌ Secret Key невалиден!', 'red');
          log('   Проверьте, что вы скопировали правильный Secret Key', 'yellow');
          log('   Перейдите: https://www.google.com/recaptcha/admin', 'yellow');
          return false;
        } else if (errors.includes('invalid-input-response')) {
          log('✅ Secret Key валиден (ошибка токена - это нормально для теста)', 'green');
          return true;
        } else {
          log('⚠️  Получены коды ошибок: ' + errors.join(', '), 'yellow');
        }
      }

      return true;
    } else {
      log('❌ Неожиданный формат ответа от Google API', 'red');
      log('   Ответ: ' + JSON.stringify(response.data), 'yellow');
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      log('❌ Таймаут подключения к Google API', 'red');
      log('   Проверьте подключение к интернету', 'yellow');
    } else if (error.response) {
      log('❌ Google API вернул ошибку: ' + error.response.status, 'red');
      log('   ' + JSON.stringify(error.response.data), 'yellow');
    } else if (error.request) {
      log('❌ Не удалось подключиться к Google API', 'red');
      log('   Проверьте подключение к интернету', 'yellow');
    } else {
      log('❌ Ошибка: ' + error.message, 'red');
    }
    return false;
  }
}

function printInstructions() {
  log('\n📖 Что делать дальше:', 'cyan');
  log('');
  log('1. Запустите сервер: npm run dev', 'blue');
  log('2. Откройте браузер: http://localhost:3000', 'blue');
  log('3. Откройте консоль браузера (F12)', 'blue');
  log('4. Проверьте логи:', 'blue');
  log('   - "reCAPTCHA script loaded" ✅', 'green');
  log('   - "reCAPTCHA готова" ✅', 'green');
  log('5. Заполните форму и отправьте', 'blue');
  log('6. Проверьте, что заявка обработана успешно', 'blue');
  log('');
  log('📚 Подробные инструкции:', 'cyan');
  log('   - docs/RECAPTCHA_SETUP_GUIDE.md', 'blue');
  log('   - docs/RECAPTCHA_QUICK_CHECKLIST.md', 'blue');
}

function printNextSteps(allPassed) {
  log('\n' + '='.repeat(60), 'cyan');

  if (allPassed) {
    log('🎉 Все проверки пройдены успешно!', 'green');
    log('');
    log('reCAPTCHA настроена правильно и готова к использованию.', 'green');
    printInstructions();
  } else {
    log('⚠️  Некоторые проверки не пройдены', 'yellow');
    log('');
    log('Пожалуйста, исправьте ошибки выше и запустите тест снова:', 'yellow');
    log('  node backend/test-recaptcha.js', 'cyan');
    log('');
    log('Если нужна помощь, смотрите:', 'yellow');
    log('  docs/RECAPTCHA_SETUP_GUIDE.md', 'cyan');
  }

  log('='.repeat(60), 'cyan');
  log('');
}

// Главная функция
async function main() {
  log('');
  log('='.repeat(60), 'cyan');
  log('  🔍 Тестирование Google reCAPTCHA v3', 'cyan');
  log('='.repeat(60), 'cyan');

  // Шаг 1: Проверка переменных окружения
  const envOk = checkEnvVariables();

  if (!envOk) {
    printNextSteps(false);
    process.exit(1);
  }

  // Шаг 2: Тестирование Google API
  const apiOk = await testGoogleAPI();

  // Итоги
  const allPassed = envOk && apiOk;
  printNextSteps(allPassed);

  process.exit(allPassed ? 0 : 1);
}

// Запуск
main().catch(error => {
  log('\n❌ Критическая ошибка:', 'red');
  log(error.message, 'red');
  if (error.stack) {
    log('\n' + error.stack, 'yellow');
  }
  process.exit(1);
});
