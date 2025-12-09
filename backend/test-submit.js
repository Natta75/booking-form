// Тестовый скрипт для проверки отправки формы
require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/submit';

// Тестовые данные
const testBooking = {
    name: 'Тестовый Пользователь',
    phone: '+79001234567',
    email: 'test@example.com',
    date: '2025-12-15',
    consent: true,
    recaptchaToken: null // reCAPTCHA отключена
};

async function testSubmit() {
    console.log('🧪 Начинаю тестирование формы...\n');

    try {
        console.log('📤 Отправка тестовой заявки...');
        console.log('Данные:', JSON.stringify(testBooking, null, 2));

        const response = await axios.post(API_URL, testBooking);

        console.log('\n✅ Успешно!');
        console.log('Статус:', response.status);
        console.log('Ответ:', JSON.stringify(response.data, null, 2));

        console.log('\n📋 Проверьте:');
        console.log('1. Google Sheets - должна появиться новая строка');
        console.log('2. Telegram - должно прийти уведомление');

    } catch (error) {
        console.error('\n❌ Ошибка при отправке:');
        if (error.response) {
            console.error('Статус:', error.response.status);
            console.error('Данные:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Сообщение:', error.message);
        }
    }
}

// Тест валидации
async function testValidation() {
    console.log('\n\n🧪 Тестирование валидации...\n');

    const invalidData = {
        name: 'A', // Слишком короткое имя
        phone: '123', // Неверный формат
        email: 'invalid-email', // Неверный email
        date: '2020-01-01', // Дата в прошлом
        consent: false // Нет согласия
    };

    try {
        console.log('📤 Отправка невалидных данных...');
        await axios.post(API_URL, invalidData);
        console.log('❌ Валидация не сработала!');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ Валидация работает правильно!');
            console.log('Ошибки:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ Неожиданная ошибка:', error.message);
        }
    }
}

// Тест health check
async function testHealth() {
    console.log('\n\n🧪 Проверка health endpoint...\n');

    try {
        const response = await axios.get('http://localhost:3000/api/health');
        console.log('✅ Health check OK');
        console.log('Ответ:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
    }
}

// Запуск всех тестов
async function runAllTests() {
    await testHealth();
    await testValidation();
    await testSubmit();

    console.log('\n\n✅ Все тесты завершены!');
    console.log('\n📝 Ручное тестирование:');
    console.log('1. Откройте http://localhost:3000 в браузере');
    console.log('2. Заполните форму и отправьте');
    console.log('3. Проверьте анимации и валидацию');
    console.log('4. Убедитесь, что форма работает без reCAPTCHA');
}

runAllTests();
