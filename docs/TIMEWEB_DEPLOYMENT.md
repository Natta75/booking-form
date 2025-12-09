# 🚀 Инструкция по деплою на Timeweb

## Краткое руководство по развертыванию формы бронирования на Timeweb

---

## 📋 Что вам понадобится

1. **Аккаунт Timeweb** с активным VPS/сервером
2. **SSH доступ** к серверу
3. **Домен** (опционально, но рекомендуется)
4. Настроенные учетные данные:
   - Telegram Bot Token и Chat ID
   - Google Sheets API credentials
   - (Опционально) reCAPTCHA ключи

---

## 🔧 Шаг 1: Подключение к серверу

```bash
ssh root@your-server-ip
# или
ssh username@your-server-ip
```

---

## 📦 Шаг 2: Установка необходимого ПО

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версии
node -v  # Должно быть >= 18.0.0
npm -v

# Git
sudo apt install -y git

# nginx (веб-сервер)
sudo apt install -y nginx

# PM2 (менеджер процессов)
sudo npm install -g pm2

# Certbot для SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

## 📂 Шаг 3: Клонирование проекта

```bash
# Создание директории
sudo mkdir -p /var/www/booking
sudo chown -R $USER:$USER /var/www/booking

# Переход в директорию
cd /var/www/booking

# Клонирование репозитория
git clone https://github.com/Natta75/booking-form.git .

# Установка зависимостей
npm install --production
```

---

## ⚙️ Шаг 4: Настройка переменных окружения

```bash
# Создание .env файла
nano .env
```

Скопируйте и заполните:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.ru

# Telegram
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id

# Google Sheets
GOOGLE_SHEET_ID=id_вашей_таблицы

# reCAPTCHA (опционально для production)
RECAPTCHA_SITE_KEY=ваш_site_key
RECAPTCHA_SECRET_KEY=ваш_secret_key
```

**Сохраните файл:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🔑 Шаг 5: Загрузка Google Credentials

С вашего **локального компьютера** выполните:

```bash
scp /path/to/google-credentials.json username@server-ip:/var/www/booking/config/
```

На сервере установите правильные права:

```bash
chmod 600 /var/www/booking/config/google-credentials.json
```

---

## 🌐 Шаг 6: Настройка nginx

```bash
sudo nano /etc/nginx/sites-available/booking
```

Вставьте конфигурацию:

```nginx
server {
    listen 80;
    server_name yourdomain.ru www.yourdomain.ru;

    # Статические файлы (HTML, CSS, JS)
    location / {
        root /var/www/booking;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # API проксирование на Node.js
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

    # Документы 152-ФЗ
    location /docs/ {
        root /var/www/booking;
        try_files $uri $uri/ =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

**Замените `yourdomain.ru` на ваш домен!**

Активация конфигурации:

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/booking /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 Шаг 7: Установка SSL сертификата

```bash
sudo certbot --nginx -d yourdomain.ru -d www.yourdomain.ru
```

Следуйте инструкциям Certbot. Он автоматически настроит HTTPS.

Проверка авто-обновления:

```bash
sudo certbot renew --dry-run
```

---

## 🚀 Шаг 8: Запуск приложения с PM2

```bash
cd /var/www/booking

# Запуск Node.js сервера
pm2 start backend/server.js --name booking-form

# Автозапуск при перезагрузке сервера
pm2 save
pm2 startup systemd
# ⚠️ Выполните команду, которую покажет PM2

# Проверка статуса
pm2 status
pm2 logs booking-form
```

---

## 🛡️ Шаг 9: Настройка firewall

```bash
# Разрешить SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

## ✅ Шаг 10: Проверка работы

1. Откройте в браузере: `https://yourdomain.ru`
2. Заполните форму и отправьте
3. Проверьте:
   - ✅ Уведомление в Telegram
   - ✅ Запись в Google Sheets
   - ✅ Благодарственное сообщение

---

## 🔄 Обновление проекта

Когда вы внесете изменения в GitHub, обновите сервер:

```bash
cd /var/www/booking
chmod +x deploy.sh
./deploy.sh
```

Или вручную:

```bash
cd /var/www/booking
git pull origin main
npm install --production
pm2 restart booking-form
sudo systemctl reload nginx
```

---

## 📊 Полезные команды

### PM2
```bash
pm2 status                    # Статус всех процессов
pm2 logs booking-form         # Просмотр логов
pm2 restart booking-form      # Перезапуск
pm2 stop booking-form         # Остановка
pm2 monit                     # Мониторинг (CPU, RAM)
```

### nginx
```bash
sudo systemctl status nginx   # Статус
sudo systemctl restart nginx  # Перезапуск
sudo nginx -t                 # Проверка конфигурации
```

### Логи
```bash
# Логи приложения (Winston)
tail -f /var/www/booking/logs/combined.log
tail -f /var/www/booking/logs/error.log

# Логи nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## ⚠️ Важные замечания

### 1. 152-ФЗ
Перед запуском в production **обязательно** отредактируйте:
- `docs/privacy-policy.html`
- `docs/consent.html`

Замените все `[Укажите...]` на ваши реальные данные (ИП/организация, адрес, контакты).

### 2. reCAPTCHA
Для production **настоятельно рекомендуется** включить reCAPTCHA:
1. Зарегистрируйте домен на https://www.google.com/recaptcha/admin
2. Добавьте ключи в `.env` на сервере
3. Перезапустите приложение: `pm2 restart booking-form`

### 3. Безопасность
- ✅ Никогда не коммитьте `.env` в Git
- ✅ Используйте сложные пароли для SSH
- ✅ Регулярно обновляйте систему: `sudo apt update && sudo apt upgrade`
- ✅ Настройте резервное копирование базы данных (Google Sheets)

### 4. Мониторинг
- Регулярно проверяйте логи: `pm2 logs booking-form`
- Настройте уведомления о падении сервера
- Следите за использованием ресурсов: `pm2 monit`

---

## 🆘 Устранение проблем

### Проблема: форма не отправляется
```bash
# Проверьте логи
pm2 logs booking-form --lines 50

# Проверьте переменные окружения
cat /var/www/booking/.env

# Перезапустите
pm2 restart booking-form
```

### Проблема: 502 Bad Gateway
```bash
# Проверьте, запущен ли Node.js
pm2 status

# Если не запущен, запустите
pm2 start backend/server.js --name booking-form

# Проверьте порт 3000
lsof -i :3000
```

### Проблема: SSL не работает
```bash
# Проверьте сертификаты
sudo certbot certificates

# Обновите сертификаты
sudo certbot renew
```

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs booking-form`
2. Проверьте конфигурацию nginx: `sudo nginx -t`
3. Создайте Issue на GitHub: https://github.com/Natta75/booking-form/issues

---

## 🎉 Готово!

Ваша форма бронирования теперь работает на production сервере Timeweb!

**URL:** https://yourdomain.ru

---

*Документ создан с помощью Claude Code*
