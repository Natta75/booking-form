// Обработка отправки формы с интеграцией backend

let recaptchaSiteKey = null;
let recaptchaWidgetId = null;

// Загрузка конфигурации с сервера
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        recaptchaSiteKey = config.recaptchaSiteKey;

        // Динамически загрузить скрипт reCAPTCHA v3
        if (recaptchaSiteKey) {
            loadRecaptchaScript();
        } else {
            console.warn('reCAPTCHA site key not configured');
        }
    } catch (error) {
        console.warn('Failed to load config:', error);
    }
}

// Динамическая загрузка скрипта reCAPTCHA
function loadRecaptchaScript() {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
        console.log('reCAPTCHA script loaded');
        initRecaptcha();
    };
    script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
    };
    document.head.appendChild(script);
}

// Инициализация reCAPTCHA
function initRecaptcha() {
    if (!recaptchaSiteKey) return;

    grecaptcha.ready(function() {
        console.log('reCAPTCHA готова');
    });
}

// Получение reCAPTCHA токена
async function getRecaptchaToken() {
    if (!recaptchaSiteKey) {
        console.warn('reCAPTCHA не настроена');
        return null;
    }

    try {
        const token = await grecaptcha.execute(recaptchaSiteKey, { action: 'submit' });
        return token;
    } catch (error) {
        console.error('Ошибка reCAPTCHA:', error);
        return null;
    }
}

// Обработка отправки формы
async function handleSubmit(event) {
    event.preventDefault();

    // Финальная валидация всех полей
    if (!validateAllFields()) {
        scrollToFirstError();
        return;
    }

    // Проверка чекбокса согласия
    const consentCheckbox = document.getElementById('consent');
    if (!consentCheckbox.checked) {
        showErrorMessage('consent', 'Необходимо согласие на обработку персональных данных');
        return;
    }

    // Показать loading состояние на кнопке
    setButtonLoadingState(true);

    try {
        // Получить reCAPTCHA токен
        const recaptchaToken = await getRecaptchaToken();

        // Собрать данные формы
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            date: document.getElementById('date').value,
            consent: consentCheckbox.checked,
            recaptchaToken: recaptchaToken,
            timestamp: new Date().toISOString()
        };

        // Логировать данные в консоль (для отладки)
        console.log('=== Отправка заявки на бронирование ===');
        console.log('Имя:', formData.name);
        console.log('Телефон:', formData.phone);
        console.log('Email:', formData.email);
        console.log('Дата:', new Date(formData.date).toLocaleDateString('ru-RU'));
        console.log('========================================');

        // Отправить данные на сервер
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        // Убрать loading состояние
        setButtonLoadingState(false);

        if (response.ok && result.success) {
            // Успешная отправка
            console.log('✅ Заявка успешно отправлена!');
            showSuccessMessage(formData.name);
        } else {
            // Ошибка от сервера
            console.error('❌ Ошибка сервера:', result.error || result.errors);
            showServerError(result.error || result.errors);
        }

    } catch (error) {
        // Сетевая ошибка
        console.error('❌ Сетевая ошибка:', error);
        setButtonLoadingState(false);
        showNetworkError();
    }
}

// Показать сообщение об успехе
function showSuccessMessage(name) {
    // Скрыть форму с fade-out анимацией
    const form = document.getElementById('bookingForm');
    form.classList.add('fade-out');

    setTimeout(() => {
        form.style.display = 'none';

        // Показать благодарственное сообщение с fade-in
        const thankYouMessage = document.getElementById('thankYouMessage');
        const userName = name.split(' ')[0]; // Первое слово из имени
        thankYouMessage.querySelector('.user-name').textContent = userName;
        thankYouMessage.classList.remove('hidden');
        thankYouMessage.classList.add('fade-in');
    }, 500);
}

// Показать ошибку от сервера
function showServerError(errorData) {
    if (Array.isArray(errorData)) {
        // Массив ошибок валидации
        alert('Ошибка валидации:\n\n' + errorData.join('\n'));
    } else {
        // Одиночная ошибка
        alert('Ошибка: ' + errorData);
    }
}

// Показать сетевую ошибку
function showNetworkError() {
    alert('Ошибка сети. Проверьте подключение к интернету и попробуйте снова.');
}

// Оставить еще одну заявку
function submitAnother() {
    const form = document.getElementById('bookingForm');
    const thankYouMessage = document.getElementById('thankYouMessage');

    // Скрыть благодарственное сообщение
    thankYouMessage.classList.remove('fade-in');
    thankYouMessage.classList.add('fade-out');

    setTimeout(() => {
        thankYouMessage.classList.add('hidden');
        thankYouMessage.classList.remove('fade-out');

        // Сбросить форму
        form.reset();
        form.style.display = 'block';
        form.classList.remove('fade-out');
        form.classList.add('fade-in');

        // Очистить все состояния валидации
        const fields = ['name', 'phone', 'email', 'date', 'consent'];
        fields.forEach(fieldId => {
            removeAllStates(fieldId);
            hideErrorMessage(fieldId);
        });

        // Убрать класс fade-in после анимации
        setTimeout(() => {
            form.classList.remove('fade-in');
        }, 300);
    }, 300);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('bookingForm');

    // Переопределить обработчик submit
    form.addEventListener('submit', handleSubmit);

    // Загрузить конфигурацию и инициализировать reCAPTCHA
    await loadConfig();
});
