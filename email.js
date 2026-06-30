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

/**
 * Notifica al proveedor que su documento fue RECHAZADO
 */
async function emailDocumentoRechazado(proveedorEmail, proveedorNombre, documentoNombre, motivo = '') {
    const motivoHtml = motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : '';
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #dc3545;">❌ Documento Rechazado</h2>
            <p>Hola <strong>${proveedorNombre}</strong>,</p>
            <p>Te informamos que el siguiente documento ha sido <strong>rechazado</strong> y requiere tu atención:</p>
            <p style="background: #f8f9fa; padding: 10px; border-left: 4px solid #dc3545;">
                📄 <strong>${documentoNombre}</strong>
            </p>
            ${motivoHtml}
            <p>Por favor, ingresa al portal para subir una versión corregida del documento.</p>
            <a href="https://tu-portal.up.railway.app/proveedor/documentos" 
               style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:10px;">
                Ir al Portal
            </a>
            <br><br>
            <p>Saludos,<br><strong>Equipo de Compras / Portal de Proveedores</strong></p>
        </div>
    `;

    return await sendEmail(
        proveedorEmail,
        `❌ Acción requerida: Documento Rechazado (${documentoNombre})`,
        htmlContent
    );
}

/**
 * 🎉 Notifica al proveedor que TODOS sus documentos fueron aprobados
 * Este correo se envía UNA SOLA VEZ cuando el proveedor completa todos los requisitos
 */
async function emailProveedorAprobado(proveedorEmail, proveedorNombre) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🎉 ¡Felicidades!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #28a745; margin-top: 0;">Proveedor Aprobado</h2>
                
                <p>Hola <strong>${proveedorNombre}</strong>,</p>
                
                <p>¡Nos complace informarte que has completado exitosamente todos los requisitos de documentación!</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px;">
                    <p style="margin: 0; font-size: 16px;">
                        ✅ <strong>Todos tus documentos han sido aprobados</strong><br>
                        ✅ <strong>Tu cuenta de proveedor está activa</strong><br>
                        ✅ <strong>Ya puedes participar en nuestros procesos de compra</strong>
                    </p>
                </div>
                
                <p>Ahora formas parte de nuestro directorio de proveedores autorizados. Nuestro equipo de compras podrá contactarte para futuras oportunidades de negocio.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://tu-portal.up.railway.app/proveedor/dashboard" 
                       style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                        Ir a mi Panel de Proveedor
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                    Si tienes alguna pregunta o necesitas actualizar tu información, no dudes en contactarnos.
                </p>
                
                <p>¡Bienvenido a nuestro equipo de proveedores!<br>
                <strong>Equipo de Compras</strong></p>
            </div>
        </div>
    `;

    return await sendEmail(
        proveedorEmail,
        `🎉 ¡Felicidades! Tu cuenta de proveedor ha sido aprobada`,
        htmlContent
    );
}

module.exports = { 
    sendEmail,
    emailProveedorSubioDocumento,
    emailDocumentoRechazado,
    emailProveedorAprobado  // ← Nueva función agregada
};