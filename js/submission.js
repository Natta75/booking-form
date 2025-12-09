// Обработка отправки формы

async function handleSubmit(event) {
    event.preventDefault();

    // Финальная валидация всех полей
    if (!validateAllFields()) {
        scrollToFirstError();
        return;
    }

    // Собрать данные формы
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        date: document.getElementById('date').value,
        timestamp: new Date().toISOString()
    };

    // Показать loading состояние на кнопке
    setButtonLoadingState(true);

    // Логировать данные в консоль
    console.log('=== Новая заявка на бронирование ===');
    console.log('Имя:', formData.name);
    console.log('Телефон:', formData.phone);
    console.log('Email:', formData.email);
    console.log('Дата:', new Date(formData.date).toLocaleDateString('ru-RU'));
    console.log('Отправлено:', new Date(formData.timestamp).toLocaleString('ru-RU'));
    console.log('====================================');

    // Имитировать задержку сети (1 секунда)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Убрать loading состояние
    setButtonLoadingState(false);

    // Скрыть форму с fade-out анимацией
    const form = document.getElementById('bookingForm');
    form.classList.add('fade-out');

    setTimeout(() => {
        form.style.display = 'none';

        // Показать благодарственное сообщение с fade-in
        const thankYouMessage = document.getElementById('thankYouMessage');
        const userName = formData.name.split(' ')[0]; // Первое слово из имени
        thankYouMessage.querySelector('.user-name').textContent = userName;
        thankYouMessage.classList.remove('hidden');
        thankYouMessage.classList.add('fade-in');
    }, 500);
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
        const fields = ['name', 'phone', 'email', 'date'];
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
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bookingForm');

    // Переопределить обработчик submit
    form.addEventListener('submit', handleSubmit);
});
