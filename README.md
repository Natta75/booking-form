# 📋 Форма бронирования

Полнофункциональная веб-форма бронирования с интеграцией Telegram уведомлений, хранением данных в Google Таблицах и соответствием требованиям 152-ФЗ РФ.

## ✨ Возможности

- ✅ **5 итераций разработки** - от базовой HTML формы до полнофункционального решения
- 📱 **Telegram уведомления** - мгновенные оповещения о новых заявках
- 📊 **Google Sheets** - автоматическое сохранение данных в таблицу
- 🛡️ **reCAPTCHA v3** - защита от спама и ботов
- 🔒 **152-ФЗ РФ** - полное соответствие законодательству о персональных данных
- 🎨 **Красивый UI** - анимации, валидация в реальном времени, цветные состояния
- 🚀 **Production-ready** - готов к deployment на Timeweb

## 📁 Структура проекта

```
/home/sernatalia/booking/
├── index.html                     # Главная страница с формой
├── css/
│   └── styles.css                 # Все стили
├── js/
│   ├── validation.js              # Клиентская валидация
│   ├── submission.js              # Обработка отправки
│   └── animations.js              # Анимации и UX
├── backend/
│   ├── server.js                  # Express сервер
│   ├── telegram.js                # Telegram интеграция
│   ├── sheets.js                  # Google Sheets интеграция
│   ├── validation.js              # Серверная валидация
│   ├── config.js                  # Конфигурация
│   ├── logger.js                  # Логирование
│   └── getChatId.js               # Утилита для получения Chat ID
├── config/
│   └── google-credentials.json    # Google API ключи (не в Git)
├── docs/
│   ├── privacy-policy.html        # Политика конфиденциальности
│   └── consent.html               # Согласие на обработку ПД
├── .env                           # Переменные окружения (не в Git)
├── .env.example                   # Шаблон для .env
├── package.json
└── deploy.sh                      # Скрипт деплоя
```

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/Natta75/booking-form.git
cd booking-form
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Заполните переменные в `.env`:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

GOOGLE_SHEET_ID=your_sheet_id_here

RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте браузер: http://localhost:3000

## 🔧 Настройка интеграций

### Telegram Bot

1. Найдите **@BotFather** в Telegram
2. Отправьте `/newbot`
3. Укажите имя и username бота
4. Сохраните **Bot Token**
5. Получите **Chat ID**:

```bash
node backend/getChatId.js
# Отправьте боту любое сообщение
```

6. Добавьте токен и Chat ID в `.env`

### Google Sheets

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект
3. Включите **Google Sheets API**
4. Создайте **Service Account**
5. Скачайте JSON ключ → сохраните как `config/google-credentials.json`
6. Создайте Google Sheet с заголовками:
   - A: Timestamp
   - B: Name
   - C: Phone
   - D: Email
   - E: Date
   - F: IP Address
7. Поделитесь таблицей с email из Service Account (дать права Editor)
8. Скопируйте Sheet ID из URL → добавьте в `.env`

### Google reCAPTCHA v3

1. Перейдите на [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Создайте новый сайт:
   - Тип: **reCAPTCHA v3**
   - Домены: `localhost` (для dev) и `yourdomain.ru` (для prod)
3. Получите **Site Key** и **Secret Key**
4. Добавьте ключи в `.env`

## 📝 Соответствие 152-ФЗ

Перед запуском в production **обязательно заполните** контактные данные в следующих файлах:

- `docs/privacy-policy.html` - замените все `[Укажите...]` на реальные данные
- `docs/consent.html` - замените все `[Укажите...]` на реальные данные

**Требуется указать:**
- Наименование организации/ИП
- Юридический адрес
- Контактный email
- Контактный телефон

## 🌐 Deployment на Timeweb

### Подготовка сервера

```bash
# SSH подключение
ssh user@your-server-ip

# Установка зависимостей
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2
sudo apt install -y certbot python3-certbot-nginx
```

### Клонирование и настройка

```bash
# Создание директории
sudo mkdir -p /var/www/booking
sudo chown -R $USER:$USER /var/www/booking

# Клонирование
cd /var/www/booking
git clone https://github.com/Natta75/booking-form.git .

# Установка зависимостей
npm install --production

# Настройка .env
nano .env
# Заполните все переменные для production

# Загрузка Google credentials (через SCP с локальной машины)
# scp /path/to/google-credentials.json user@server:/var/www/booking/config/
chmod 600 config/google-credentials.json
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
```

### PM2 запуск

```bash
cd /var/www/booking

# Запуск
pm2 start backend/server.js --name booking-form

# Автозапуск
pm2 save
pm2 startup systemd

# Мониторинг
pm2 status
pm2 logs booking-form
```

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Обновление проекта

```bash
cd /var/www/booking
chmod +x deploy.sh
./deploy.sh
```

## 📊 Полезные команды

```bash
# Разработка
npm run dev          # Запуск с nodemon
npm start            # Запуск production

# PM2
pm2 logs booking-form     # Просмотр логов
pm2 restart booking-form  # Перезапуск
pm2 stop booking-form     # Остановка
pm2 monit                 # Мониторинг

# Логи
tail -f logs/combined.log  # Все логи
tail -f logs/error.log     # Только ошибки
```

## 🧪 Тестирование

1. Откройте форму в браузере
2. Попробуйте отправить с невалидными данными → должны появиться ошибки
3. Заполните форму корректно → проверьте:
   - Уведомление в Telegram
   - Запись в Google Sheets
   - Благодарственное сообщение на странице

## 🛡️ Безопасность

- ✅ HTTPS (SSL/TLS) шифрование
- ✅ Helmet security headers
- ✅ Rate limiting (5 запросов за 15 минут)
- ✅ CORS защита
- ✅ Input sanitization
- ✅ reCAPTCHA v3 антибот защита
- ✅ Логирование всех действий

## 📄 Лицензия

MIT License

## 👤 Автор

Создано с использованием Claude Code

---

**Поддержка:** При возникновении вопросов создайте Issue в GitHub репозитории.
