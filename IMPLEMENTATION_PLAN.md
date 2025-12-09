# План реализации формы бронирования

## Обзор проекта

Создание веб-формы бронирования с 5 итерациями развития, интеграцией Telegram уведомлений, хранением данных в Google Таблицах и соответствием требованиям 152-ФЗ о персональных данных.

**Ключевые требования:**
- 4 поля: Имя, Телефон, Email, Дата
- 5 итераций: от базовой HTML формы до полнофункционального решения
- Уведомления в Telegram о новых бронированиях
- Хранение данных в Google Таблицах
- Защита от спама (reCAPTCHA v3)
- Соответствие 152-ФЗ РФ
- Размещение на сервере Timeweb через GitHub

---

## Структура проекта

```
/home/sernatalia/booking/
├── .env                      # Переменные окружения (не в Git)
├── .env.example              # Шаблон для .env
├── .gitignore
├── README.md
├── package.json
├── index.html                # Главная страница с формой
├── css/
│   └── styles.css            # Все стили
├── js/
│   ├── validation.js         # Клиентская валидация
│   ├── submission.js         # Обработка отправки
│   └── animations.js         # Анимации и UX
├── backend/
│   ├── server.js             # Express сервер
│   ├── telegram.js           # Telegram интеграция
│   ├── sheets.js             # Google Sheets интеграция
│   ├── validation.js         # Серверная валидация
│   ├── config.js             # Конфигурация
│   └── logger.js             # Логирование
├── config/
│   └── google-credentials.json  # Google API ключи (не в Git)
└── docs/
    ├── privacy-policy.html   # Политика конфиденциальности
    └── consent.html          # Согласие на обработку ПД
```

---

## Технологический стек

**Frontend:**
- HTML5 (семантическая разметка, нативная валидация)
- CSS3 (переменные, анимации, transitions)
- Vanilla JavaScript (без фреймворков)
- Google reCAPTCHA v3 (невидимая защита от ботов)

**Backend:**
- Node.js 18+
- Express.js (веб-сервер)
- node-telegram-bot-api (Telegram интеграция)
- googleapis (Google Sheets API)
- helmet (security headers)
- express-rate-limit (защита от DDoS)
- validator (серверная валидация)

**Deployment:**
- Git + GitHub (версионирование)
- Timeweb сервер (хостинг)
- PM2 (process manager)
- nginx (reverse proxy)
- Let's Encrypt (SSL сертификат)

---

## Итерация 1: Базовая HTML форма

**Цель:** Создать простую рабочую форму без валидации.

**Шаги:**
1. Создать `index.html` с базовой структурой
2. Добавить форму с 4 полями:
   - Имя (текстовое поле)
   - Телефон (текстовое поле)
   - Email (текстовое поле)
   - Дата (текстовое поле)
3. Добавить кнопку "Отправить"
4. Создать `css/styles.css` с базовыми стилями (читаемость, простой layout)
5. Форма должна иметь `id="bookingForm"` для дальнейшей работы с JS

**Критерий успеха:** Форма отображается, все поля видны, кнопка кликабельна.

---

## Итерация 2: HTML5 валидация

**Цель:** Добавить встроенную браузерную валидацию через HTML5 атрибуты.

**Изменения в `index.html`:**
1. Добавить атрибут `required` ко всем полям
2. Изменить типы инпутов:
   - `type="text"` для имени → добавить `minlength="2"` `maxlength="100"`
   - `type="tel"` для телефона → добавить `pattern="^(\+7|8)[0-9]{10}$"`
   - `type="email"` для email (автоматическая валидация)
   - `type="date"` для даты → добавить `min="2025-12-09"` (сегодня)
3. Добавить `placeholder` с примерами для каждого поля
4. Добавить `autocomplete` атрибуты для лучшего UX

**Критерий успеха:** Браузер показывает стандартные сообщения об ошибках при некорректном вводе.

---

## Итерация 3: JavaScript валидация

**Цель:** Реализовать custom валидацию с контролем на JavaScript.

**Создать `js/validation.js`:**

1. **Функции валидации:**
   - `validateName(name)` - проверка имени (2-100 символов, только буквы/пробелы/дефисы)
   - `validatePhone(phone)` - российский формат (+7 или 8, 11 цифр)
   - `validateEmail(email)` - RFC-совместимый email
   - `validateDate(dateString)` - не в прошлом, не более года вперед

2. **Event listeners:**
   - `input` event: валидация в реальном времени при вводе
   - `blur` event: валидация при потере фокуса
   - `submit` event: валидация всей формы перед отправкой

3. **Логика обработки ошибок:**
   - Если поле невалидно → показать сообщение об ошибке
   - Если поле валидно → очистить ошибку
   - Предотвратить отправку формы если есть ошибки

**Добавить в `index.html`:**
- Контейнеры для сообщений об ошибках под каждым полем
- `<script src="js/validation.js"></script>`

**Критерий успеха:** Custom ошибки появляются при вводе, форма не отправляется с невалидными данными.

---

## Итерация 4: Красивая обработка ошибок

**Цель:** Создать профессиональный UX с цветными рамками, анимациями и визуальным фидбеком.

**Обновить `css/styles.css`:**

1. **CSS переменные для цветовой схемы:**
   ```css
   :root {
     --color-primary: #4CAF50;
     --color-error: #f44336;
     --color-border-default: #ddd;
     --color-border-focus: #2196F3;
     --transition-speed: 0.3s;
   }
   ```

2. **Состояния полей:**
   - Default: серая рамка
   - Focus: синяя рамка с легкой тенью
   - Error: красная рамка + shake анимация
   - Success: зеленая рамка + иконка галочки

3. **Анимации:**
   - Shake для невалидных полей (keyframe animation)
   - Fade in/out для сообщений об ошибках
   - Smooth transitions для изменения цветов рамок
   - Pulse на кнопке submit

4. **Интерактивность кнопки:**
   - Disabled состояние (серая, неактивная)
   - Hover эффект (подъем на 2px, затемнение)
   - Loading состояние (спиннер)

**Создать `js/animations.js`:**
- Функции для добавления/удаления CSS классов
- Управление визуальными состояниями полей
- Smooth скроллинг к первой ошибке

**Обновить `js/validation.js`:**
- Интегрировать визуальный фидбек при валидации
- Добавить/удалять классы `.error` и `.success`
- Динамически показывать/скрывать сообщения об ошибках

**Критерий успеха:** Форма выглядит профессионально, ошибки понятны, анимации плавные.

---

## Итерация 5: Успешная отправка

**Цель:** Обработать успешную отправку с благодарственным сообщением.

**Создать `js/submission.js`:**

1. **Функция `handleSubmit(event)`:**
   - `event.preventDefault()` - предотвратить стандартную отправку
   - Собрать данные формы в объект
   - Валидировать все поля финально
   - Показать loading состояние на кнопке
   - Логировать данные в консоль (для этой итерации)
   - Имитировать задержку сети (1 секунда)
   - Скрыть форму с fade-out анимацией
   - Показать благодарственное сообщение с fade-in

2. **Структура данных для логирования:**
   ```javascript
   {
     name: "...",
     phone: "...",
     email: "...",
     date: "...",
     timestamp: "2025-12-09T12:34:56.789Z"
   }
   ```

**Добавить в `index.html`:**

1. **Благодарственное сообщение:**
   ```html
   <div id="thankYouMessage" class="thank-you-message hidden">
     <div class="success-icon-large">✓</div>
     <h2>Спасибо, <span class="user-name"></span>!</h2>
     <p>Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
     <button onclick="submitAnother()">Оставить еще одну заявку</button>
   </div>
   ```

2. **Функция `submitAnother()`:**
   - Скрыть благодарственное сообщение
   - Показать форму обратно
   - Сбросить все поля (`form.reset()`)
   - Очистить все состояния валидации

**Обновить `css/styles.css`:**
- Стили для благодарственного сообщения
- Fade-in/fade-out анимации
- Центрирование контента

**Критерий успеха:** После отправки форма скрывается, появляется благодарственное сообщение, данные в консоли.

---

## Telegram Bot интеграция

### Шаг 1: Создание бота

1. Открыть Telegram → найти **@BotFather**
2. Отправить `/newbot`
3. Ввести имя бота (например: "Booking Notifications")
4. Ввести username бота (например: "sernatalia_booking_bot")
5. Сохранить **Bot Token** (формат: `123456789:ABCdefGHI...`)

### Шаг 2: Получение Chat ID

**Вариант 1 - через API:**
1. Отправить любое сообщение своему боту
2. Открыть: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
3. Найти `"chat":{"id":123456789}`

**Вариант 2 - через скрипт:**
Создать `backend/getChatId.js`:
```javascript
const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  console.log('Chat ID:', msg.chat.id);
  bot.stopPolling();
});

console.log('Отправьте боту любое сообщение...');
```

Запустить: `node backend/getChatId.js`

### Шаг 3: Реализация интеграции

**Создать `backend/telegram.js`:**

```javascript
const TelegramBot = require('node-telegram-bot-api');

class TelegramNotifier {
  constructor(token, chatId) {
    this.bot = new TelegramBot(token, { polling: false });
    this.chatId = chatId;
  }

  async sendBookingNotification(bookingData) {
    const message = `
🆕 <b>Новая заявка на бронирование</b>

👤 <b>Имя:</b> ${bookingData.name}
📱 <b>Телефон:</b> ${bookingData.phone}
📧 <b>Email:</b> ${bookingData.email}
📅 <b>Дата:</b> ${new Date(bookingData.date).toLocaleDateString('ru-RU')}

⏰ <b>Получено:</b> ${new Date(bookingData.timestamp).toLocaleString('ru-RU')}
    `.trim();

    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML'
      });
      return { success: true };
    } catch (error) {
      console.error('Telegram error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = TelegramNotifier;
```

### Шаг 4: Environment Variables

Добавить в `.env`:
```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHI...
TELEGRAM_CHAT_ID=123456789
```

---

## Google Sheets интеграция

### Шаг 1: Настройка Google Cloud

1. Перейти на [Google Cloud Console](https://console.cloud.google.com/)
2. Создать новый проект: "Booking Form"
3. Включить **Google Sheets API**:
   - APIs & Services → Library
   - Найти "Google Sheets API" → Enable

### Шаг 2: Service Account

1. APIs & Services → Credentials
2. Create Credentials → Service Account
3. Имя: "booking-form-service"
4. Роль: Editor
5. Create Key → JSON
6. Сохранить как `/home/sernatalia/booking/config/google-credentials.json`

### Шаг 3: Создание таблицы

1. Создать Google Sheet: "Booking Form Submissions"
2. Заголовки (первая строка):
   - A: "Timestamp"
   - B: "Name"
   - C: "Phone"
   - D: "Email"
   - E: "Date"
   - F: "IP Address"
3. Поделиться таблицей с email из Service Account JSON (дать права Editor)
4. Скопировать Sheet ID из URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### Шаг 4: Реализация интеграции

**Создать `backend/sheets.js`:**

```javascript
const { google } = require('googleapis');
const path = require('path');

class GoogleSheetsManager {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/google-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
  }

  async appendBooking(bookingData) {
    const values = [[
      new Date(bookingData.timestamp).toLocaleString('ru-RU'),
      bookingData.name,
      bookingData.phone,
      bookingData.email,
      new Date(bookingData.date).toLocaleDateString('ru-RU'),
      bookingData.ipAddress || 'N/A'
    ]];

    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:F',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });

      return { success: true, rowsAdded: response.data.updates.updatedRows };
    } catch (error) {
      console.error('Google Sheets error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = GoogleSheetsManager;
```

Добавить в `.env`:
```
GOOGLE_SHEET_ID=your_sheet_id_here
```

---

## Google reCAPTCHA v3 интеграция

### Шаг 1: Регистрация в Google reCAPTCHA

1. Перейти на [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Создать новый сайт:
   - Label: "Booking Form"
   - Type: **reCAPTCHA v3**
   - Domains: `yourdomain.ru` (или localhost для разработки)
3. Получить:
   - **Site Key** (для frontend)
   - **Secret Key** (для backend)

### Шаг 2: Frontend интеграция

**В `index.html` добавить в `<head>`:**
```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

**Обновить `js/submission.js`:**
```javascript
async function handleSubmit(event) {
  event.preventDefault();

  // Валидация...

  // Получить reCAPTCHA token
  const token = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'});

  // Отправить на сервер вместе с формой
  const formData = {
    name: ...,
    phone: ...,
    email: ...,
    date: ...,
    recaptchaToken: token
  };

  // Fetch запрос...
}
```

### Шаг 3: Backend верификация

**Обновить `backend/server.js`:**
```javascript
const axios = require('axios');

async function verifyRecaptcha(token) {
  const response = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    null,
    {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token
      }
    }
  );

  return response.data.success && response.data.score >= 0.5;
}

app.post('/api/submit', limiter, async (req, res) => {
  // Проверить reCAPTCHA
  const isHuman = await verifyRecaptcha(req.body.recaptchaToken);
  if (!isHuman) {
    return res.status(400).json({
      success: false,
      error: 'Проверка reCAPTCHA не пройдена'
    });
  }

  // Остальная логика...
});
```

Добавить в `.env`:
```
RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...
```

---

## Backend сервер (Node.js/Express)

**Создать `backend/server.js`:**

```javascript
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const path = require('path');

const TelegramNotifier = require('./telegram');
const GoogleSheetsManager = require('./sheets');
const config = require('./config');
const logger = require('./logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Rate limiting (5 запросов за 15 минут)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Слишком много запросов. Попробуйте позже.' },
});

// Инициализация сервисов
const telegram = new TelegramNotifier(
  process.env.TELEGRAM_BOT_TOKEN,
  process.env.TELEGRAM_CHAT_ID
);
const sheets = new GoogleSheetsManager();

// Валидация данных
function validateBookingData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Имя должно содержать минимум 2 символа');
  }

  const phone = data.phone.replace(/\D/g, '');
  if (!/^[78]\d{10}$/.test(phone)) {
    errors.push('Неверный формат телефона');
  }

  if (!validator.isEmail(data.email)) {
    errors.push('Неверный формат email');
  }

  const selectedDate = new Date(data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    errors.push('Дата не может быть в прошлом');
  }

  if (!data.consent) {
    errors.push('Необходимо согласие на обработку ПД');
  }

  return errors;
}

// Очистка данных
function sanitizeData(data) {
  return {
    name: validator.escape(validator.trim(data.name)),
    phone: validator.trim(data.phone).replace(/\D/g, ''),
    email: validator.normalizeEmail(validator.trim(data.email)),
    date: validator.trim(data.date),
    consent: !!data.consent,
    timestamp: new Date().toISOString(),
  };
}

// API endpoint
app.post('/api/submit', limiter, async (req, res) => {
  try {
    // reCAPTCHA проверка
    const isHuman = await verifyRecaptcha(req.body.recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({
        success: false,
        error: 'Проверка reCAPTCHA не пройдена'
      });
    }

    // Валидация
    const errors = validateBookingData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Очистка
    const bookingData = sanitizeData(req.body);
    bookingData.ipAddress = req.ip;

    // Сохранение в Google Sheets
    const sheetsResult = await sheets.appendBooking(bookingData);
    if (!sheetsResult.success) {
      throw new Error('Не удалось сохранить в Google Sheets');
    }

    // Отправка в Telegram
    await telegram.sendBookingNotification(bookingData);

    // Логирование
    logger.info('Новое бронирование', {
      name: bookingData.name,
      email: bookingData.email
    });

    res.json({
      success: true,
      message: 'Заявка успешно отправлена'
    });

  } catch (error) {
    logger.error('Ошибка обработки заявки', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Произошла ошибка. Попробуйте позже.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

---

## Безопасность и соответствие 152-ФЗ

### Требования 152-ФЗ

1. **Согласие пользователя**: Получить явное согласие перед сбором ПД
2. **Цель сбора**: Указать зачем собираются данные
3. **Безопасность**: Технические меры защиты
4. **Права пользователей**: Доступ, исправление, удаление данных
5. **Политика конфиденциальности**: Понятная и доступная

### Реализация

**1. Чекбокс согласия в форме:**

Добавить в `index.html`:
```html
<div class="form-group">
  <label class="checkbox-label">
    <input type="checkbox" id="consent" name="consent" required>
    <span>
      Я согласен(а) на обработку моих персональных данных в соответствии с
      <a href="/docs/privacy-policy.html" target="_blank">Политикой конфиденциальности</a>
    </span>
  </label>
</div>
```

**2. Создать `docs/privacy-policy.html`:**

Содержание:
- Оператор ПД (ваши данные как владельца)
- Цель обработки (обработка бронирований)
- Категории ПД (имя, телефон, email, дата)
- Правовое основание (согласие пользователя)
- Срок хранения (например, 3 года)
- Третьи лица (Google Sheets, Telegram)
- Права пользователей (доступ, исправление, удаление)
- Меры безопасности (HTTPS, шифрование)
- Контактная информация

**3. Security headers (в `backend/server.js`):**

```javascript
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
  }
}));
```

**4. HTTPS enforcement:**

```javascript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

**5. Rate limiting:**

Уже реализован (5 запросов за 15 минут).

**6. Input sanitization:**

Используем `validator` для escape и trim.

**7. Минимизация данных:**

Собираем только необходимое: имя, телефон, email, дата.

---

## Deployment на Timeweb

### Подготовка сервера

**SSH подключение:**
```bash
ssh user@your-server-ip
```

**Установка зависимостей:**
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# nginx
sudo apt install -y nginx

# PM2
sudo npm install -g pm2

# Git
sudo apt install -y git

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### Клонирование репозитория

```bash
# Создание директории
sudo mkdir -p /var/www/booking
sudo chown -R $USER:$USER /var/www/booking

# Клонирование
cd /var/www/booking
git clone https://github.com/your-username/booking-form.git .

# Установка зависимостей
npm install --production
```

### Конфигурация

**Создать `.env` на сервере:**
```bash
nano .env
```

Содержание:
```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.ru

TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

GOOGLE_SHEET_ID=...

RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
```

**Загрузить `google-credentials.json` через SCP:**
```bash
# С локальной машины
scp /path/to/google-credentials.json user@server:/var/www/booking/config/

# На сервере установить права
chmod 600 /var/www/booking/config/google-credentials.json
```

### Настройка nginx

```bash
sudo nano /etc/nginx/sites-available/booking
```

Конфигурация:
```nginx
server {
    listen 80;
    server_name yourdomain.ru www.yourdomain.ru;

    # Статические файлы
    location / {
        root /var/www/booking;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # API прокси
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

Активация:
```bash
sudo ln -s /etc/nginx/sites-available/booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL сертификат

```bash
sudo certbot --nginx -d yourdomain.ru -d www.yourdomain.ru

# Авто-обновление
sudo certbot renew --dry-run
```

### PM2 запуск

```bash
cd /var/www/booking

# Запуск
pm2 start backend/server.js --name booking-form

# Автозапуск при перезагрузке
pm2 save
pm2 startup systemd
# Выполнить команду, которую выведет PM2

# Мониторинг
pm2 status
pm2 logs booking-form
```

### Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

### Deployment скрипт

**Создать `deploy.sh` локально:**
```bash
#!/bin/bash
echo "Deploying to Timeweb..."

git pull origin main
npm install --production
pm2 restart booking-form
sudo systemctl reload nginx

echo "Deployment complete!"
```

```bash
chmod +x deploy.sh
```

---

## GitHub Setup

### Инициализация репозитория

```bash
cd /home/sernatalia/booking

git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Создать `.gitignore`:

```
# Environment
.env
.env.local
.env.production

# Credentials
config/google-credentials.json

# Dependencies
node_modules/
package-lock.json

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### Создать `.env.example`:

```
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

GOOGLE_SHEET_ID=your_sheet_id_here

RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### Первый commit:

```bash
git add .
git commit -m "Initial commit: Booking form with 5 iterations"
```

### Создать GitHub репозиторий и push:

```bash
git remote add origin https://github.com/your-username/booking-form.git
git branch -M main
git push -u origin main
```

---

## Критические файлы для создания

При реализации создать следующие файлы в указанном порядке:

### Итерация 1:
1. `/home/sernatalia/booking/index.html`
2. `/home/sernatalia/booking/css/styles.css`

### Итерация 2:
3. Обновить `index.html` (добавить HTML5 атрибуты)

### Итерация 3:
4. `/home/sernatalia/booking/js/validation.js`

### Итерация 4:
5. Обновить `css/styles.css` (анимации, состояния)
6. `/home/sernatalia/booking/js/animations.js`

### Итерация 5:
7. `/home/sernatalia/booking/js/submission.js`
8. Обновить `index.html` (добавить thank you message)

### Backend:
9. `/home/sernatalia/booking/package.json`
10. `/home/sernatalia/booking/.env.example`
11. `/home/sernatalia/booking/.gitignore`
12. `/home/sernatalia/booking/backend/config.js`
13. `/home/sernatalia/booking/backend/logger.js`
14. `/home/sernatalia/booking/backend/telegram.js`
15. `/home/sernatalia/booking/backend/sheets.js`
16. `/home/sernatalia/booking/backend/validation.js`
17. `/home/sernatalia/booking/backend/server.js`

### Compliance:
18. `/home/sernatalia/booking/docs/privacy-policy.html`
19. `/home/sernatalia/booking/docs/consent.html`

### Deployment:
20. `/home/sernatalia/booking/deploy.sh`
21. `/home/sernatalia/booking/README.md`

---

## Dependencies (package.json)

```json
{
  "name": "booking-form",
  "version": "1.0.0",
  "description": "Booking form with Telegram and Google Sheets",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "node-telegram-bot-api": "^0.64.0",
    "googleapis": "^128.0.0",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "validator": "^13.11.0",
    "cors": "^2.8.5",
    "winston": "^3.11.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Порядок выполнения

1. **Создание структуры проекта** (папки, .gitignore)
2. **Итерации 1-5** (последовательная разработка frontend)
3. **Telegram bot setup** (создание бота, получение токена и chat ID)
4. **Google Sheets setup** (создание проекта, service account, таблицы)
5. **reCAPTCHA setup** (регистрация, получение ключей)
6. **Backend разработка** (server.js, интеграции)
7. **Документы 152-ФЗ** (privacy policy, consent)
8. **GitHub repository** (commit, push)
9. **Deployment на Timeweb** (nginx, PM2, SSL)
10. **Тестирование** (проверка всех функций в production)

---

## Успешное завершение

Проект считается завершенным когда:
- ✅ Все 5 итераций реализованы
- ✅ Форма работает с валидацией и красивыми ошибками
- ✅ Telegram уведомления приходят при новых заявках
- ✅ Данные сохраняются в Google Таблицы
- ✅ reCAPTCHA защищает от спама
- ✅ Политика конфиденциальности и согласие на месте
- ✅ Код на GitHub
- ✅ Сайт работает на Timeweb с SSL
- ✅ Все безопасно и соответствует 152-ФЗ
