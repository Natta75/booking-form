const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class GoogleSheetsManager {
  constructor(spreadsheetId) {
    if (!spreadsheetId) {
      logger.warn('Google Sheet ID not provided. Sheet integration will be disabled.');
      this.enabled = false;
      return;
    }

    const credentialsPath = path.join(__dirname, '../config/google-credentials.json');

    if (!fs.existsSync(credentialsPath)) {
      logger.warn('Google credentials file not found. Sheet integration will be disabled.');
      this.enabled = false;
      return;
    }

    try {
      this.auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.spreadsheetId = spreadsheetId;
      this.enabled = true;
      logger.info('Google Sheets manager initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Sheets', { error: error.message });
      this.enabled = false;
    }
  }

  async appendBooking(bookingData) {
    if (!this.enabled) {
      logger.warn('Google Sheets integration is disabled');
      return { success: false, error: 'Integration disabled' };
    }

    const values = [[
      new Date(bookingData.timestamp).toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      bookingData.name,
      bookingData.phone,
      bookingData.email,
      new Date(bookingData.date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      bookingData.time || '',  // Time (пока пустое, поле не добавлено в форму)
      bookingData.message || ''  // Message (пока пустое, поле не добавлено в форму)
    ]];

    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Лист1!A:G',  // 7 колонок: Timestamp, Name, Phone, Email, Date, Time, Message
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });

      logger.info('Data saved to Google Sheets', {
        rowsAdded: response.data.updates.updatedRows,
        email: bookingData.email
      });

      return {
        success: true,
        rowsAdded: response.data.updates.updatedRows
      };
    } catch (error) {
      logger.error('Failed to save to Google Sheets', {
        error: error.message,
        email: bookingData.email
      });

      return { success: false, error: error.message };
    }
  }

  // Проверка подключения к таблице
  async testConnection() {
    if (!this.enabled) {
      return { success: false, error: 'Integration disabled' };
    }

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      logger.info('Google Sheets connection successful', {
        title: response.data.properties.title
      });

      return { success: true, title: response.data.properties.title };
    } catch (error) {
      logger.error('Google Sheets connection failed', {
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }
}

module.exports = GoogleSheetsManager;
