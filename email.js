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
            email: process.env.BREVO_SENDER_EMAIL || 'adminempresapruebas1@gmail.com'
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

/**
 * Notifica al administrador cuando un proveedor sube un documento
 * @param {string} adminEmail - Correo del administrador
 * @param {string} proveedorNombre - Nombre del proveedor
 * @param {string} documentoNombre - Nombre del documento subido
 */
async function emailProveedorSubioDocumento(adminEmail, proveedorNombre, documentoNombre) {
    const htmlContent = `
        <h2>📄 Nuevo documento subido</h2>
        <p>El proveedor <strong>${proveedorNombre}</strong> ha subido un nuevo documento.</p>
        <p><strong>Documento:</strong> ${documentoNombre}</p>
        <p>Por favor, revisa el documento en el Portal de Proveedores.</p>
        <a href="https://tu-portal.up.railway.app/admin/documentos" 
           style="background:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:10px;">
            Ver documentos pendientes
        </a>
    `;

    return await sendEmail(
        adminEmail,
        `📄 Nuevo documento de ${proveedorNombre}`,
        htmlContent
    );
}

module.exports = { 
    sendEmail,
    emailProveedorSubioDocumento  // ← Agrega esta línea
};