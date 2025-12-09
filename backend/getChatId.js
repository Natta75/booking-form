/**
 * Вспомогательный скрипт для получения Telegram Chat ID
 *
 * Использование:
 * 1. Замените 'YOUR_BOT_TOKEN' на токен вашего бота
 * 2. Запустите: node backend/getChatId.js
 * 3. Отправьте любое сообщение вашему боту в Telegram
 * 4. Chat ID будет выведен в консоль
 */

const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен бота
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';

if (token === 'YOUR_BOT_TOKEN') {
    console.error('❌ Ошибка: Не указан токен бота!');
    console.log('');
    console.log('Укажите токен одним из способов:');
    console.log('1. Установите переменную окружения TELEGRAM_BOT_TOKEN');
    console.log('2. Замените YOUR_BOT_TOKEN в коде этого файла');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Бот запущен!');
console.log('📱 Отправьте боту любое сообщение в Telegram...');
console.log('');

bot.on('message', (msg) => {
    console.log('✅ Получено сообщение!');
    console.log('');
    console.log('📋 Информация о чате:');
    console.log('  Chat ID:', msg.chat.id);
    console.log('  Имя пользователя:', msg.from.first_name, msg.from.last_name || '');
    console.log('  Username:', msg.from.username || 'Не указан');
    console.log('');
    console.log('💾 Добавьте этот Chat ID в .env файл:');
    console.log(`  TELEGRAM_CHAT_ID=${msg.chat.id}`);
    console.log('');

    bot.stopPolling();
    process.exit(0);
});

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
});

// Завершение при Ctrl+C
process.on('SIGINT', () => {
    console.log('\n⏹️  Остановка бота...');
    bot.stopPolling();
    process.exit(0);
});
