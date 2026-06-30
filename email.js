// ==========================================
// MÓDULO DE EMAIL - VERSIÓN MÍNIMA Y SEGURA
// ==========================================

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  console.log('⚠️  nodemailer no disponible');
}

const CONFIG = {
  colors: { primary: '#1e40af', success: '#059669', danger: '#dc2626', warning: '#f59e0b', info: '#0284c7' },
  urls: { sistema: process.env.SISTEMA_URL || 'http://localhost:3000' }
};

let transporter = null;

// Inicializar SMTP de forma segura
try {
  if (nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,  // STARTTLS
    auth: { 
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: { 
    rejectUnauthorized: false
  },
  family: 4
});
    console.log('✅ SMTP configurado:', process.env.SMTP_HOST);
  } else {
    console.log('⚠️  SMTP no configurado, emails se simularán');
  }
} catch (err) {
  console.log('⚠️  Error configurando SMTP:', err.message);
}

// Función principal
async function enviarEmail(destinatario, asunto, html) {
  if (!destinatario || !asunto || !html) {
    return { ok: false, error: 'Parámetros inválidos' };
  }
  
  if (!transporter) {
    console.log(` [SIMULADO] ${asunto} → ${destinatario}`);
    return { ok: true, messageId: 'simulado' };
  }
  
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: destinatario,
      subject: asunto,
      html: html
    });
    console.log(`📧 ✅ Enviado a ${destinatario}`);
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error(` Error email:`, error.message);
    return { ok: false, error: error.message };
  }
}

// Plantilla base
function plantillaBase(titulo, colorHeader, contenido) {
  return `<!DOCTYPE html><html><body style="font-family:Arial;background:#f3f4f6;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
      <div style="background:${colorHeader};padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;">${titulo}</h1>
      </div>
      <div style="padding:30px;">${contenido}</div>
    </div>
  </body></html>`;
}

// Plantillas específicas
function emailProveedorSubioDocumento(proveedorNombre, tipoDocumento, nombreArchivo) {
  return plantillaBase('📄 Nuevo documento', '#1e40af',
    `<p>Hola Admin,</p><p><strong>${proveedorNombre}</strong> subió: ${tipoDocumento} - ${nombreArchivo}</p>
    <p><a href="${CONFIG.urls.sistema}" style="background:#1e40af;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;">Ir al Panel</a></p>`);
}

function emailDocumentoRechazado(proveedorNombre, tipoDocumento, motivo) {
  return plantillaBase('❌ Documento rechazado', '#dc2626',
    `<p>Hola <strong>${proveedorNombre}</strong>,</p><p>Tu documento <strong>${tipoDocumento}</strong> fue rechazado.</p>
    ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
    <p><a href="${CONFIG.urls.sistema}" style="background:#1e40af;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;">Ir a mi Panel</a></p>`);
}

function emailNuevaNota(proveedorNombre, tituloNota, contenidoNota) {
  return plantillaBase('📝 Nueva nota', '#f59e0b',
    `<p>Hola <strong>${proveedorNombre}</strong>,</p><p><strong>${tituloNota}</strong></p><p>${contenidoNota}</p>
    <p><a href="${CONFIG.urls.sistema}" style="background:#1e40af;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;">Ir a mi Panel</a></p>`);
}

function emailProveedorAprobado(proveedorNombre) {
  const fecha = new Date().toLocaleString('es-CO');
  return plantillaBase('🎉 ¡Felicidades! Proveedor Aprobado', '#059669',
    `<p>Hola <strong>${proveedorNombre}</strong>,</p>
    <div style="background:#d1fae5;padding:24px;border-radius:8px;text-align:center;border:2px solid #059669;">
      <div style="font-size:48px;">🎉</div>
      <h2 style="color:#065f46;">¡Felicidades!</h2>
      <p style="color:#065f46;font-size:18px;"><strong>APROBADO</strong></p>
      <p style="color:#065f46;">Fecha: ${fecha}</p>
    </div>
    <p>Tu registro como proveedor ha sido aprobado.</p>
    <p><a href="${CONFIG.urls.sistema}" style="background:#059669;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;">Ir a mi Panel</a></p>`);
}

function emailBienvenidaProveedor(email, password, nombreEmpresa) {
  return plantillaBase('🏢 Bienvenido', '#1e40af',
    `<p>Hola <strong>${nombreEmpresa}</strong>,</p>
    <div style="background:#f0f9ff;padding:20px;border-left:4px solid #1e40af;">
      <p><strong>📧 Email:</strong> ${email}</p>
      <p><strong>🔑 Contraseña:</strong> <code>${password}</code></p>
    </div>
    <div style="background:#fef3c7;padding:20px;border:2px solid #f59e0b;">
      <h3 style="color:#92400e;">️ Cambia tu contraseña al primer ingreso</h3>
    </div>
    <p><a href="${CONFIG.urls.sistema}" style="background:#1e40af;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;">Ir al Portal</a></p>`);
}

function emailRecordatorio(proveedorNombre, mensaje) {
  return plantillaBase('📨 Recordatorio', '#0284c7',
    `<p>Hola <strong>${proveedorNombre}</strong>,</p><p>${mensaje}</p>
    <p><a href="${CONFIG.urls.sistema}" style="background:#1e40af;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;">Ir a mi Panel</a></p>`);
}

// Funciones auxiliares
function verificarConfiguracion() {
  return { configurado: !!transporter, host: process.env.SMTP_HOST };
}

function obtenerUrlSistema() {
  return CONFIG.urls.sistema;
}

// Exportación
module.exports = {
  enviarEmail, plantillaBase,
  emailProveedorSubioDocumento, emailDocumentoRechazado, emailNuevaNota,
  emailProveedorAprobado, emailBienvenidaProveedor, emailRecordatorio,
  verificarConfiguracion, obtenerUrlSistema, CONFIG
};

console.log('✅ Módulo de email cargado');