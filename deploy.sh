#!/bin/bash

# Deployment script для Timeweb сервера

set -e  # Остановить скрипт при ошибке

echo "🚀 Начало deployment на Timeweb..."

# 1. Получить последние изменения из Git
echo "📥 Получение последних изменений из Git..."
git pull origin main

# 2. Установить/обновить зависимости
echo "📦 Установка зависимостей..."
npm install --production

# 3. Проверить наличие .env файла
if [ ! -f .env ]; then
    echo "⚠️  ВНИМАНИЕ: .env файл не найден!"
    echo "Скопируйте .env.example в .env и заполните переменные окружения"
    exit 1
fi

# 4. Проверить наличие Google credentials
if [ ! -f config/google-credentials.json ]; then
    echo "⚠️  ВНИМАНИЕ: config/google-credentials.json не найден!"
    echo "Загрузите файл с учетными данными Google Service Account"
    exit 1
fi

# 5. Перезапустить PM2 процесс
echo "🔄 Перезапуск PM2 процесса..."
pm2 restart booking-form || pm2 start backend/server.js --name booking-form

# 6. Сохранить PM2 конфигурацию
pm2 save

# 7. Перезагрузить nginx (если нужно)
if command -v nginx &> /dev/null; then
    echo "🔄 Перезагрузка nginx..."
    sudo systemctl reload nginx
fi

# 8. Проверить статус
echo "✅ Проверка статуса..."
pm2 status booking-form

echo ""
echo "✅ Deployment завершен успешно!"
echo ""
echo "📊 Полезные команды:"
echo "  - Посмотреть логи: pm2 logs booking-form"
echo "  - Перезапустить: pm2 restart booking-form"
echo "  - Остановить: pm2 stop booking-form"
echo "  - Мониторинг: pm2 monit"
