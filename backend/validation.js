const validator = require('validator');

/**
 * Валидация данных формы бронирования
 */
class BookingValidator {
  /**
   * Валидация имени
   */
  static validateName(name) {
    const errors = [];

    if (!name || typeof name !== 'string') {
      errors.push('Имя обязательно для заполнения');
      return errors;
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      errors.push('Имя должно содержать минимум 2 символа');
    }

    if (trimmedName.length > 100) {
      errors.push('Имя не должно превышать 100 символов');
    }

    // Проверка на допустимые символы (буквы, пробелы, дефисы)
    if (!/^[а-яА-ЯёЁa-zA-Z\s\-]+$/.test(trimmedName)) {
      errors.push('Имя может содержать только буквы, пробелы и дефисы');
    }

    return errors;
  }

  /**
   * Валидация телефона (российский формат)
   */
  static validatePhone(phone) {
    const errors = [];

    if (!phone || typeof phone !== 'string') {
      errors.push('Телефон обязателен для заполнения');
      return errors;
    }

    // Удаляем все нецифровые символы
    const cleanedPhone = phone.replace(/\D/g, '');

    // Проверка на российский формат: +7 или 8, затем 10 цифр
    if (!/^[78]\d{10}$/.test(cleanedPhone)) {
      errors.push('Неверный формат телефона. Ожидается: +7XXXXXXXXXX или 8XXXXXXXXXX');
    }

    return errors;
  }

  /**
   * Валидация email
   */
  static validateEmail(email) {
    const errors = [];

    if (!email || typeof email !== 'string') {
      errors.push('Email обязателен для заполнения');
      return errors;
    }

    const trimmedEmail = email.trim();

    if (!validator.isEmail(trimmedEmail)) {
      errors.push('Неверный формат email');
    }

    if (trimmedEmail.length > 254) {
      errors.push('Email слишком длинный');
    }

    return errors;
  }

  /**
   * Валидация даты
   */
  static validateDate(dateString) {
    const errors = [];

    if (!dateString || typeof dateString !== 'string') {
      errors.push('Дата обязательна для заполнения');
      return errors;
    }

    const selectedDate = new Date(dateString);

    // Проверка валидности даты
    if (isNaN(selectedDate.getTime())) {
      errors.push('Неверный формат даты');
      return errors;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Дата не может быть в прошлом
    if (selectedDate < today) {
      errors.push('Дата не может быть в прошлом');
    }

    // Дата не более года вперед
    const oneYearAhead = new Date(today);
    oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);

    if (selectedDate > oneYearAhead) {
      errors.push('Дата не может быть более чем на год вперед');
    }

    return errors;
  }

  /**
   * Валидация согласия на обработку персональных данных
   */
  static validateConsent(consent) {
    const errors = [];

    if (consent !== true && consent !== 'true' && consent !== 1) {
      errors.push('Необходимо согласие на обработку персональных данных');
    }

    return errors;
  }

  /**
   * Полная валидация всех данных формы
   */
  static validateBookingData(data) {
    const allErrors = [];

    // Валидация каждого поля
    const nameErrors = this.validateName(data.name);
    const phoneErrors = this.validatePhone(data.phone);
    const emailErrors = this.validateEmail(data.email);
    const dateErrors = this.validateDate(data.date);
    const consentErrors = this.validateConsent(data.consent);

    // Объединение всех ошибок
    allErrors.push(...nameErrors, ...phoneErrors, ...emailErrors, ...dateErrors, ...consentErrors);

    return allErrors;
  }

  /**
   * Санитизация (очистка) данных
   */
  static sanitizeData(data) {
    return {
      name: validator.escape(validator.trim(data.name || '')),
      phone: validator.trim(data.phone || '').replace(/\D/g, ''),
      email: validator.normalizeEmail(validator.trim(data.email || '')) || data.email,
      date: validator.trim(data.date || ''),
      consent: !!data.consent,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = BookingValidator;
