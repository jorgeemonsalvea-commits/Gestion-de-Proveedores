const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

// Configurar el cliente de Brevo con la API Key
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Envía un correo usando la API de Brevo
 * @param {string} toEmail - Correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} htmlContent - Contenido HTML del correo
 * @param {Object} params - Parámetros adicionales opcionales
 */
async function sendEmail(toEmail, subject, htmlContent, params = {}) {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = { 
            name: process.env.BREVO_SENDER_NAME || 'Portal de Proveedores', 
            email: process.env.BREVO_SENDER_EMAIL 
        };
        sendSmtpEmail.to = [{ email: toEmail }];
        
        // Parámetros dinámicos para plantillas (opcional)
        if (Object.keys(params).length > 0) {
            sendSmtpEmail.params = params;
        }

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Correo enviado correctamente. MessageID:', data.messageId);
        return { success: true, messageId: data.messageId };
        
    } catch (error) {
        console.error('❌ Error al enviar correo con Brevo:', error.response?.body || error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { sendEmail };