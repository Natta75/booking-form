# Настройка reCAPTCHA Enterprise

Этот проект использует **Google reCAPTCHA Enterprise** - новую систему Google Cloud для защиты от ботов и спама. Это обновлённая версия, заменяющая устаревший reCAPTCHA v3.

## Основные отличия от reCAPTCHA v3

| Параметр | reCAPTCHA v3 (старая) | reCAPTCHA Enterprise (новая) |
|----------|----------------------|------------------------------|
| **Endpoint** | `www.google.com/recaptcha/api.js` | `www.google.com/recaptcha/enterprise.js` |
| **Backend API** | `siteverify` (HTTP запрос) | `@google-cloud/recaptcha-enterprise` SDK |
| **Ключи** | Site Key + Secret Key | Site Key + API Key + Project ID |
| **Домен** | Не требует подтверждения | Требует подтверждения в GCP |
| **Проверка** | POST на `siteverify` | Assessment API через SDK |

---

## Шаг 1: Создание проекта в Google Cloud Console

### 1.1. Войдите в Google Cloud Console
Откройте: https://console.cloud.google.com/

### 1.2. Создайте новый проект (или выберите существующий)
1. Нажмите на выпадающее меню проектов (вверху страницы)
2. Нажмите **"Новый проект"**
3. Введите название проекта (например, `booking-form`)
4. Нажмите **"Создать"**

### 1.3. Запишите Project ID
После создания проекта скопируйте **Project ID** (не путать с названием!). Он понадобится для настройки.

**Пример**: `booking-form-123456`

---

## Шаг 2: Настройка reCAPTCHA Enterprise

### 2.1. Откройте reCAPTCHA Enterprise
1. В Google Cloud Console откройте меню (≡)
2. Перейдите: **Security** → **reCAPTCHA Enterprise**
3. Если нужно, включите API:
   - Нажмите **"Enable API"**
   - Дождитесь активации (может занять 1-2 минуты)

### 2.2. Создайте ключ reCAPTCHA
1. Нажмите **"Создать ключ"** (Create Key)
2. Заполните форму:

   **Отображаемое имя**: `Booking Form`

   **Тип платформы**: Website (веб-сайт)

   **Домены**:
   - Для локальной разработки: `localhost`
   - Для продакшена: ваш домен (например, `example.com`)

   **Настройки интеграции**:
   - ✅ Checkbox: Score based (рекомендуется)
   - Порог (threshold): `0.5` (по умолчанию)

3. Нажмите **"Создать"**

### 2.3. Получите Site Key
После создания вы увидите **Site Key** - это публичный ключ для фронтенда.

**Пример**: `6LcXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX`

Скопируйте его - он понадобится в `.env` файле.

---

## Шаг 3: Создание API Key

### 3.1. Откройте Credentials
1. В Google Cloud Console перейдите в меню
2. Выберите: **APIs & Services** → **Credentials**

### 3.2. Создайте API Key
1. Нажмите **"+ Create Credentials"**
2. Выберите **"API Key"**
3. Скопируйте сгенерированный ключ

**Пример**: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 3.3. Настройте ограничения (рекомендуется)
1. Нажмите **"Edit API key"**
2. В разделе **"API restrictions"**:
   - Выберите **"Restrict key"**
   - Включите только: **reCAPTCHA Enterprise API**
3. В разделе **"Application restrictions"** (опционально):
   - Можете добавить ограничение по IP адресам вашего сервера
4. Сохраните

---

## Шаг 4: Подтверждение домена

### 4.1. Зачем это нужно?
reCAPTCHA Enterprise требует, чтобы домен был подтверждён в вашем проекте GCP.

### 4.2. Для localhost (локальная разработка)
`localhost` обычно работает автоматически. Если возникают проблемы:
1. В настройках ключа reCAPTCHA добавьте `localhost` и `127.0.0.1` в список доменов

### 4.3. Для продакшен-домена
1. В Google Cloud Console перейдите: **APIs & Services** → **Domain verification**
2. Нажмите **"Add domain"**
3. Введите ваш домен (например, `example.com`)
4. Следуйте инструкциям:
   - **Вариант 1**: Добавьте TXT-запись в DNS
   - **Вариант 2**: Загрузите HTML-файл на ваш сервер
5. После проверки домен будет подтверждён

---

## Шаг 5: Настройка Service Account (опционально для локальной разработки)

### 5.1. Когда это нужно?
- При локальной разработке на машине без доступа к GCP
- Если вы НЕ используете Google Cloud для хостинга

### 5.2. Создание Service Account
1. В Google Cloud Console: **IAM & Admin** → **Service Accounts**
2. Нажмите **"+ Create Service Account"**
3. Заполните:
   - **Name**: `recaptcha-backend`
   - **Role**: `reCAPTCHA Enterprise Agent`
4. Нажмите **"Create and Continue"**, затем **"Done"**

### 5.3. Создание ключа
1. Нажмите на созданный Service Account
2. Перейдите на вкладку **"Keys"**
3. Нажмите **"Add Key"** → **"Create new key"**
4. Выберите формат: **JSON**
5. Нажмите **"Create"** - файл с ключом будет скачан

### 5.4. Сохраните ключ в проекте
1. Создайте папку `credentials` в корне проекта:
   ```bash
   mkdir credentials
   ```

2. Переместите скачанный JSON-файл в эту папку
3. Переименуйте его в `service-account.json`:
   ```bash
   mv ~/Downloads/booking-form-*.json credentials/service-account.json
   ```

4. **ВАЖНО**: Добавьте в `.gitignore`:
   ```
   credentials/
   ```

---

## Шаг 6: Настройка переменных окружения

Откройте файл `.env` в корне проекта и заполните следующие переменные:

```env
# Google reCAPTCHA Enterprise
RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Google Cloud Project
GOOGLE_CLOUD_PROJECT_ID=booking-form-123456

# Путь к Service Account (только для локальной разработки)
# Раскомментируйте следующую строку, если используете service account:
# GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account.json
```

### Где взять каждое значение:

| Переменная | Откуда взять |
|-----------|--------------|
| `RECAPTCHA_SITE_KEY` | Шаг 2.3 - Site Key из reCAPTCHA Enterprise |
| `RECAPTCHA_API_KEY` | Шаг 3.2 - API Key из Credentials |
| `GOOGLE_CLOUD_PROJECT_ID` | Шаг 1.3 - Project ID из GCP |
| `GOOGLE_APPLICATION_CREDENTIALS` | Шаг 5.4 - Путь к service-account.json (опционально) |

---

## Шаг 7: Тестирование

### 7.1. Запустите сервер
```bash
npm start
```

### 7.2. Проверьте логи
При запуске вы должны увидеть:
```
✅ reCAPTCHA Enterprise protection: enabled
```

Если видите `⚠️ reCAPTCHA Enterprise protection: disabled`, проверьте:
1. Все переменные в `.env` заполнены
2. Project ID указан правильно
3. API Key активен
4. reCAPTCHA Enterprise API включён в GCP

### 7.3. Проверьте форму
1. Откройте http://localhost:3000
2. Откройте DevTools (F12) → Console
3. Заполните и отправьте форму
4. В консоли должны появиться сообщения:
   ```
   reCAPTCHA Enterprise script loaded
   reCAPTCHA Enterprise готова
   ```

### 7.4. Проверьте логи сервера
При отправке формы вы должны увидеть:
```
Creating reCAPTCHA Enterprise assessment
reCAPTCHA Enterprise assessment completed { score: 0.9 }
reCAPTCHA verification passed
```

---

## Решение проблем

### Проблема: "reCAPTCHA Enterprise protection: disabled"
**Причина**: Не заполнены переменные окружения

**Решение**:
1. Проверьте файл `.env`
2. Убедитесь, что все три переменные заполнены:
   - `RECAPTCHA_SITE_KEY`
   - `RECAPTCHA_API_KEY`
   - `GOOGLE_CLOUD_PROJECT_ID`

---

### Проблема: "Failed to load reCAPTCHA Enterprise script"
**Причина**: Неверный Site Key или проблемы с CSP

**Решение**:
1. Проверьте `RECAPTCHA_SITE_KEY` в `.env`
2. Убедитесь, что домен добавлен в настройках ключа reCAPTCHA
3. Проверьте CSP настройки в `backend/server.js`

---

### Проблема: "reCAPTCHA token is invalid"
**Причина**: Домен не подтверждён или не добавлен в reCAPTCHA

**Решение**:
1. Перейдите в GCP → reCAPTCHA Enterprise → Ваш ключ
2. Убедитесь, что текущий домен добавлен в список доменов
3. Для localhost добавьте: `localhost` и `127.0.0.1`
4. Для продакшена: подтвердите домен (Шаг 4.3)

---

### Проблема: "API key not valid"
**Причина**: API Key неправильный или не имеет доступа к reCAPTCHA Enterprise API

**Решение**:
1. Проверьте `RECAPTCHA_API_KEY` в `.env`
2. В GCP → Credentials → ваш API Key
3. Убедитесь, что включён **reCAPTCHA Enterprise API**
4. Если нужно, создайте новый API Key

---

### Проблема: "Permission denied" или "403 Forbidden"
**Причина**: Service Account не имеет нужных прав

**Решение**:
1. Проверьте, что Service Account имеет роль: `reCAPTCHA Enterprise Agent`
2. В GCP: IAM & Admin → IAM
3. Найдите ваш Service Account
4. Добавьте роль, если её нет

---

## Продакшен: Хостинг на Timeweb Cloud

Если вы размещаете проект на Timeweb Cloud, следуйте инструкциям:

### Вариант 1: Service Account (рекомендуется)
1. Создайте Service Account (Шаг 5)
2. Загрузите `service-account.json` на сервер
3. В переменных окружения Timeweb укажите:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
   ```

### Вариант 2: Workload Identity (если сервер в GCP)
Если ваш сервер работает в Google Cloud (Compute Engine, Cloud Run и т.д.), Service Account не нужен - используется автоматическая аутентификация.

---

## Полезные ссылки

- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Node.js SDK](https://www.npmjs.com/package/@google-cloud/recaptcha-enterprise)

---

## Итоговый чеклист

- [ ] Создан проект в Google Cloud Console
- [ ] Включён reCAPTCHA Enterprise API
- [ ] Создан ключ reCAPTCHA и получен Site Key
- [ ] Создан API Key с доступом к reCAPTCHA Enterprise API
- [ ] Домен добавлен в настройки ключа reCAPTCHA
- [ ] Заполнены переменные в `.env`:
  - [ ] `RECAPTCHA_SITE_KEY`
  - [ ] `RECAPTCHA_API_KEY`
  - [ ] `GOOGLE_CLOUD_PROJECT_ID`
- [ ] (Опционально) Создан Service Account и настроен `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Сервер запускается без ошибок
- [ ] Форма работает и проходит проверку reCAPTCHA

---

**Готово!** Теперь ваш проект защищён современной системой reCAPTCHA Enterprise.
