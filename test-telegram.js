/**
 * Тестовый скрипт для проверки Telegram уведомлений
 */

require('dotenv').config();
const TelegramNotifier = require('./backend/telegram');

// Проверяем наличие необходимых переменных
if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
  console.error('❌ Ошибка: Не найдены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID в .env файле');
  process.exit(1);
}

console.log('🧪 Тестирование Telegram уведомлений...\n');
console.log('📋 Конфигурация:');
console.log(`  Bot Token: ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
console.log(`  Chat ID: ${process.env.TELEGRAM_CHAT_ID}\n`);

// Создаём экземпляр TelegramNotifier
const telegram = new TelegramNotifier(
  process.env.TELEGRAM_BOT_TOKEN,
  process.env.TELEGRAM_CHAT_ID
);

// Тестовые данные бронирования
const testBooking = {
  name: 'Наталья Мизина (ТЕСТ)',
  phone: '+7 (900) 123-45-67',
  email: 'test@example.com',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
  timestamp: new Date()
};

console.log('📤 Отправка тестового уведомления...');

// Отправляем тестовое уведомление
telegram.sendBookingNotification(testBooking)
  .then(result => {
    if (result.success) {
      console.log('\n✅ УСПЕХ! Тестовое уведомление отправлено!');
      console.log('📱 Проверьте Telegram - должно прийти сообщение от бота');
    } else {
      console.log('\n❌ ОШИБКА:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ ОШИБКА при отправке:', error.message);
    process.exit(1);
  });
