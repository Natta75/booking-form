// Функции валидации

function validateName(name) {
    const trimmed = name.trim();

    if (trimmed.length < 2 || trimmed.length > 100) {
        return { valid: false, error: 'Имя должно содержать от 2 до 100 символов' };
    }

    if (!/^[А-Яа-яЁёA-Za-z\s-]+$/.test(trimmed)) {
        return { valid: false, error: 'Имя может содержать только буквы, пробелы и дефисы' };
    }

    return { valid: true };
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');

    if (!/^[78]\d{10}$/.test(cleaned)) {
        return { valid: false, error: 'Телефон должен быть в формате +7XXXXXXXXXX или 8XXXXXXXXXX' };
    }

    return { valid: true };
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
        return { valid: false, error: 'Введите корректный email адрес' };
    }

    return { valid: true };
}

function validateDate(dateString) {
    if (!dateString) {
        return { valid: false, error: 'Выберите дату' };
    }

    const selected = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
        return { valid: false, error: 'Дата не может быть в прошлом' };
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (selected > maxDate) {
        return { valid: false, error: 'Дата не может быть более чем через год' };
    }

    return { valid: true };
}

// Показать ошибку
function showError(fieldId, message) {
    addErrorState(fieldId);
    showErrorMessage(fieldId, message);
}

// Скрыть ошибку
function hideError(fieldId) {
    removeAllStates(fieldId);
    hideErrorMessage(fieldId);
}

// Валидация конкретного поля
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value;
    let result;

    switch(fieldId) {
        case 'name':
            result = validateName(value);
            break;
        case 'phone':
            result = validatePhone(value);
            break;
        case 'email':
            result = validateEmail(value);
            break;
        case 'date':
            result = validateDate(value);
            break;
        default:
            return true;
    }

    if (result.valid) {
        hideError(fieldId);
        addSuccessState(fieldId);
        return true;
    } else {
        showError(fieldId, result.error);
        return false;
    }
}

// Валидация всей формы
function validateAllFields() {
    const fields = ['name', 'phone', 'email', 'date'];
    let isValid = true;

    fields.forEach(fieldId => {
        if (!validateField(fieldId)) {
            isValid = false;
        }
    });

    return isValid;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bookingForm');
    const fields = ['name', 'phone', 'email', 'date'];

    // Валидация при вводе (input event)
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);

        field.addEventListener('input', function() {
            // Валидируем только если поле уже имело ошибку
            const errorElement = document.getElementById(`${fieldId}-error`);
            if (errorElement && errorElement.style.display !== 'none') {
                validateField(fieldId);
            }
        });

        // Валидация при потере фокуса (blur event)
        field.addEventListener('blur', function() {
            if (field.value.trim() !== '') {
                validateField(fieldId);
            }
        });
    });

    // Валидация при отправке формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validateAllFields()) {
            console.log('Форма валидна, можно отправлять');
            // Здесь будет логика отправки в следующих итерациях
        } else {
            console.log('Форма содержит ошибки');
            scrollToFirstError();
        }
    });
});
