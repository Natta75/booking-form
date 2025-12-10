/**
 * Google reCAPTCHA Enterprise интеграция
 *
 * Этот модуль использует новый reCAPTCHA Enterprise API вместо устаревшего v3.
 * Требует настройки в Google Cloud Console.
 */

const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const config = require('./config');
const logger = require('./logger');

class RecaptchaEnterpriseManager {
  constructor() {
    this.enabled = !!(config.recaptcha.projectId && config.recaptcha.apiKey && config.recaptcha.siteKey);

    if (this.enabled) {
      // Инициализация клиента reCAPTCHA Enterprise
      const clientConfig = {};

      // Если указаны credentials, используем их для локальной разработки
      if (config.recaptcha.credentials) {
        clientConfig.keyFilename = config.recaptcha.credentials;
      }

      this.client = new RecaptchaEnterpriseServiceClient(clientConfig);
      this.projectPath = this.client.projectPath(config.recaptcha.projectId);

      logger.info('reCAPTCHA Enterprise initialized', {
        projectId: config.recaptcha.projectId
      });
    } else {
      logger.warn('reCAPTCHA Enterprise disabled - missing configuration');
    }
  }

  /**
   * Создание Assessment для проверки токена reCAPTCHA
   *
   * @param {string} token - Токен от клиента
   * @param {string} action - Действие (например, 'submit')
   * @param {string} userIpAddress - IP адрес пользователя (опционально)
   * @returns {Promise<Object>} - Результат проверки
   */
  async createAssessment(token, action = 'submit', userIpAddress = null) {
    if (!this.enabled) {
      logger.warn('reCAPTCHA Enterprise verification skipped - not configured');
      return {
        success: true,
        score: null,
        reason: 'disabled'
      };
    }

    if (!token) {
      logger.warn('reCAPTCHA token is missing');
      return {
        success: false,
        score: 0,
        reason: 'missing_token'
      };
    }

    try {
      const request = {
        parent: this.projectPath,
        assessment: {
          event: {
            token: token,
            siteKey: config.recaptcha.siteKey,
            expectedAction: action,
          },
        },
      };

      // Добавляем IP адрес если доступен
      if (userIpAddress) {
        request.assessment.event.userIpAddress = userIpAddress;
      }

      logger.info('Creating reCAPTCHA Enterprise assessment', {
        action: action,
        hasToken: !!token,
        hasIpAddress: !!userIpAddress
      });

      // Создание Assessment
      const [response] = await this.client.createAssessment(request);

      // Проверка результата
      if (!response.tokenProperties.valid) {
        logger.warn('reCAPTCHA token is invalid', {
          invalidReason: response.tokenProperties.invalidReason,
          action: response.tokenProperties.action
        });

        return {
          success: false,
          score: 0,
          reason: response.tokenProperties.invalidReason,
          reasons: response.riskAnalysis?.reasons || []
        };
      }

      // Проверка, что action совпадает
      if (response.tokenProperties.action !== action) {
        logger.warn('reCAPTCHA action mismatch', {
          expected: action,
          actual: response.tokenProperties.action
        });

        return {
          success: false,
          score: response.riskAnalysis?.score || 0,
          reason: 'action_mismatch'
        };
      }

      // Получение score
      const score = response.riskAnalysis?.score || 0;
      const reasons = response.riskAnalysis?.reasons || [];

      logger.info('reCAPTCHA Enterprise assessment completed', {
        score: score,
        reasons: reasons,
        action: action
      });

      // Проверка score (минимум 0.5 для прохождения)
      // Можно настроить threshold в зависимости от требований
      const threshold = 0.5;
      const success = score >= threshold;

      if (!success) {
        logger.warn('reCAPTCHA score below threshold', {
          score: score,
          threshold: threshold,
          reasons: reasons
        });
      }

      return {
        success: success,
        score: score,
        reasons: reasons,
        assessmentName: response.name
      };

    } catch (error) {
      logger.error('reCAPTCHA Enterprise assessment failed', {
        error: error.message,
        code: error.code,
        details: error.details
      });

      // В случае ошибки API, можно решить пропустить пользователя или блокировать
      // Здесь блокируем для безопасности
      return {
        success: false,
        score: 0,
        reason: 'api_error',
        error: error.message
      };
    }
  }

  /**
   * Аннотация существующего Assessment (опционально)
   * Используется для обратной связи Google о результате действия
   *
   * @param {string} assessmentName - Название Assessment
   * @param {string} annotation - Тип аннотации (LEGITIMATE, FRAUDULENT, etc.)
   */
  async annotateAssessment(assessmentName, annotation) {
    if (!this.enabled) {
      return;
    }

    try {
      const request = {
        name: assessmentName,
        annotation: annotation,
      };

      await this.client.annotateAssessment(request);
      logger.info('Assessment annotated', {
        assessmentName: assessmentName,
        annotation: annotation
      });
    } catch (error) {
      logger.error('Failed to annotate assessment', {
        error: error.message,
        assessmentName: assessmentName
      });
    }
  }
}

module.exports = RecaptchaEnterpriseManager;
