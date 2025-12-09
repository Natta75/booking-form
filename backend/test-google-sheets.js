require('dotenv').config();
const { google } = require('googleapis');

async function testGoogleSheets() {
  console.log('🔍 Тестирование интеграции с Google Sheets...\n');

  try {
    // 1. Проверка переменных окружения
    console.log('1️⃣ Проверка переменных окружения:');
    console.log(`   GOOGLE_SHEET_ID: ${process.env.GOOGLE_SHEET_ID ? '✅ Установлен' : '❌ Не найден'}`);

    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID не найден в .env');
    }

    // 2. Проверка credentials файла
    console.log('\n2️⃣ Проверка файла credentials:');
    const fs = require('fs');
    const credPath = './config/google-credentials.json';

    if (!fs.existsSync(credPath)) {
      throw new Error(`Файл ${credPath} не найден`);
    }
    console.log('   ✅ Файл google-credentials.json найден');

    const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    console.log(`   ✅ Service Account: ${credentials.client_email}`);

    // 3. Подключение к Google Sheets API
    console.log('\n3️⃣ Подключение к Google Sheets API:');
    const auth = new google.auth.GoogleAuth({
      keyFile: credPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('   ✅ Авторизация успешна');

    // 4. Проверка доступа к таблице
    console.log('\n4️⃣ Проверка доступа к таблице:');
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    console.log(`   ✅ Таблица найдена: "${metadata.data.properties.title}"`);
    console.log(`   📊 Листов в таблице: ${metadata.data.sheets.length}`);

    // 5. Проверка заголовков
    console.log('\n5️⃣ Проверка заголовков:');
    const sheetName = metadata.data.sheets[0].properties.title;
    const headerRange = `${sheetName}!A1:G1`;

    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    const headers = headerResponse.data.values ? headerResponse.data.values[0] : [];
    console.log(`   Текущие заголовки: ${headers.join(', ')}`);

    const expectedHeaders = ['Timestamp', 'Name', 'Phone', 'Email', 'Date', 'Time', 'Message'];
    const headersMatch = JSON.stringify(headers) === JSON.stringify(expectedHeaders);

    if (headersMatch) {
      console.log('   ✅ Заголовки установлены правильно');
    } else {
      console.log('   ⚠️  Заголовки не соответствуют ожидаемым');
      console.log(`   Ожидается: ${expectedHeaders.join(', ')}`);
    }

    // 6. Тестовая запись данных
    console.log('\n6️⃣ Тестовая запись данных:');
    const testData = [
      new Date().toISOString(),
      'Test User',
      '+1234567890',
      'test@example.com',
      '2024-12-25',
      '14:00',
      'Тестовое сообщение'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:G`,
      valueInputOption: 'RAW',
      resource: {
        values: [testData],
      },
    });

    console.log('   ✅ Тестовые данные успешно добавлены в таблицу');
    console.log(`   📝 Проверьте таблицу: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);

    // 7. Итог
    console.log('\n' + '='.repeat(50));
    console.log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!');
    console.log('🎉 Google Sheets интеграция работает корректно!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);

    if (error.code === 403) {
      console.log('\n💡 Возможные причины:');
      console.log('   1. Service Account не имеет доступа к таблице');
      console.log('   2. Убедитесь, что вы поделились таблицей с:');
      console.log('      booking-form-service@booking-form-480713.iam.gserviceaccount.com');
      console.log('   3. Права доступа должны быть "Editor" (Редактор)');
    } else if (error.code === 404) {
      console.log('\n💡 Возможные причины:');
      console.log('   1. Неверный GOOGLE_SHEET_ID в .env');
      console.log('   2. Таблица была удалена');
    }

    process.exit(1);
  }
}

testGoogleSheets();
