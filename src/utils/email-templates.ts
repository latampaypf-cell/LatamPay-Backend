/**
 * LatamPay - Plantillas de Correo Electrónico
 * 
 * Este archivo centraliza el diseño de los correos para garantizar consistencia visual
 * y facilitar el mantenimiento de la marca.
 */

const APP_COLOR = '#3178c6';
const SECONDARY_COLOR = '#666666';
const SUCCESS_COLOR = '#28a745';
const WARNING_COLOR = '#dc3545';

/**
 * Layout base que envuelve a todos los correos.
 */
const baseLayout = (content: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: ${APP_COLOR}; padding: 30px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">LatamPay 🚀</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Tu billetera digital en Latinoamérica</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px; line-height: 1.6; color: #333333;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 25px; text-align: center; font-size: 12px; color: ${SECONDARY_COLOR}; border-top: 1px solid #eeeeee;">
      <p style="margin: 0 0 10px 0;">Este es un correo automático, por favor no respondas a esta dirección.</p>
      <p style="margin: 0;">&copy; 2026 LatamPay S.A. | América Latina</p>
      <div style="margin-top: 15px;">
        <a href="#" style="color: ${APP_COLOR}; text-decoration: none; margin: 0 10px;">Privacidad</a>
        <a href="#" style="color: ${APP_COLOR}; text-decoration: none; margin: 0 10px;">Soporte</a>
      </div>
    </div>
  </div>
`;

/**
 * Plantilla: Bienvenida al registrarse
 */
export const getWelcomeTemplate = (name: string) => ({
  subject: '¡Bienvenido a LatamPay! 🚀',
  text: `Hola ${name}, bienvenido a LatamPay. Tu cuenta ha sido creada exitosamente.`,
  html: baseLayout(`
    <h2 style="color: ${APP_COLOR}; margin-top: 0;">¡Hola, ${name}!</h2>
    <p>Estamos muy emocionados de tenerte con nosotros. LatamPay es la forma más fácil y rápida de manejar tus finanzas en toda la región.</p>
    <p>Ya puedes empezar a:</p>
    <ul style="padding-left: 20px;">
      <li>Cargar saldo en moneda local (ARS, COP, VES).</li>
      <li>Realizar transferencias instantáneas sin comisiones.</li>
      <li>Cambiar tus divisas con las mejores tasas del mercado.</li>
    </ul>
    <div style="text-align: center; margin: 35px 0;">
      <a href="#" style="background-color: ${APP_COLOR}; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ingresar a mi Cuenta</a>
    </div>
    <p style="font-size: 14px; color: ${SECONDARY_COLOR};">Si no te registraste en LatamPay, ignora este mensaje.</p>
  `)
});

/**
 * Plantilla: Seguridad - Cambio de Contraseña
 */
export const getSecurityUpdateTemplate = (name: string) => ({
  subject: 'Seguridad: Contraseña actualizada 🔐',
  text: `Hola ${name}, tu contraseña de LatamPay ha sido actualizada correctamente.`,
  html: baseLayout(`
    <h2 style="color: ${WARNING_COLOR}; margin-top: 0;">Aviso de Seguridad</h2>
    <p>Hola <strong>${name}</strong>,</p>
    <p>Te informamos que la contraseña de tu cuenta ha sido <strong>actualizada exitosamente</strong>.</p>
    <div style="background-color: #fff3f3; border-left: 4px solid ${WARNING_COLOR}; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">Si <strong>no realizaste este cambio</strong>, por favor contacta a nuestro equipo de soporte de inmediato o intenta recuperar tu cuenta.</p>
    </div>
    <p>Si fuiste tú, puedes ignorar este mensaje.</p>
  `)
});

/**
 * Plantilla: Depósito Exitoso
 */
export const getDepositTemplate = (name: string, amount: number, currency: string) => ({
  subject: 'Depósito exitoso - LatamPay ✅',
  text: `Hola ${name}, se han acreditado ${amount} ${currency} en tu cuenta.`,
  html: baseLayout(`
    <h2 style="color: ${SUCCESS_COLOR}; margin-top: 0;">¡Depósito Acreditado!</h2>
    <p>Hola <strong>${name}</strong>, los fondos ya están disponibles en tu billetera.</p>
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; border: 1px solid #dcfce7;">
      <span style="display: block; font-size: 14px; color: ${SECONDARY_COLOR};">Monto Acreditado</span>
      <span style="display: block; font-size: 32px; font-weight: bold; color: ${SUCCESS_COLOR};">${amount} ${currency}</span>
    </div>
    <p>Puedes ver el detalle en tu historial de transacciones.</p>
  `)
});

/**
 * Plantilla: Retiro de Fondos
 */
export const getWithdrawTemplate = (name: string, amount: number, currency: string) => ({
  subject: 'Retiro de fondos - LatamPay 💸',
  text: `Hola ${name}, se ha realizado un retiro de ${amount} ${currency} de tu cuenta.`,
  html: baseLayout(`
    <h2 style="color: #333333; margin-top: 0;">Notificación de Retiro</h2>
    <p>Hola <strong>${name}</strong>, se ha procesado una solicitud de retiro de fondos.</p>
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; border: 1px solid #eeeeee;">
      <span style="display: block; font-size: 14px; color: ${SECONDARY_COLOR};">Monto Retirado</span>
      <span style="display: block; font-size: 32px; font-weight: bold; color: #333333;">${amount} ${currency}</span>
    </div>
    <p style="font-size: 14px; color: ${SECONDARY_COLOR};">Si no reconoces esta operación, bloquea tu cuenta inmediatamente desde la app.</p>
  `)
});

/**
 * Plantilla: Transferencia Enviada (Comprobante)
 */
export const getTransferSentTemplate = (name: string, amount: number, currency: string, toName: string) => ({
  subject: 'Comprobante de Transferencia - LatamPay 📄',
  text: `Has enviado ${amount} ${currency} a ${toName}.`,
  html: baseLayout(`
    <h2 style="color: ${APP_COLOR}; margin-top: 0;">Transferencia Exitosa</h2>
    <p>Hola <strong>${name}</strong>, tu envío de dinero se ha completado.</p>
    <table style="width: 100%; background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: ${SECONDARY_COLOR};">Destinatario:</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${toName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: ${SECONDARY_COLOR}; border-top: 1px solid #eeeeee;">Monto:</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid #eeeeee; color: ${APP_COLOR};">${amount} ${currency}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: ${SECONDARY_COLOR}; border-top: 1px solid #eeeeee;">Fecha:</td>
        <td style="padding: 8px 0; text-align: right; border-top: 1px solid #eeeeee;">${new Date().toLocaleDateString()}</td>
      </tr>
    </table>
    <p>El comprobante oficial está disponible en tu actividad.</p>
  `)
});

/**
 * Plantilla: Transferencia Recibida
 */
export const getTransferReceivedTemplate = (name: string, amount: number, currency: string, fromName: string) => ({
  subject: '¡Has recibido dinero! 💰',
  text: `Hola ${name}, has recibido ${amount} ${currency} de ${fromName}.`,
  html: baseLayout(`
    <h2 style="color: ${SUCCESS_COLOR}; margin-top: 0;">¡Dinero Recibido!</h2>
    <p>Hola <strong>${name}</strong>, alguien te ha enviado dinero a través de LatamPay.</p>
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; border: 1px solid #dcfce7;">
      <span style="display: block; font-size: 14px; color: ${SECONDARY_COLOR};">Has recibido</span>
      <span style="display: block; font-size: 32px; font-weight: bold; color: ${SUCCESS_COLOR};">${amount} ${currency}</span>
      <span style="display: block; font-size: 14px; color: ${SECONDARY_COLOR}; margin-top: 10px;">De: ${fromName}</span>
    </div>
    <p>Los fondos ya están disponibles para su uso.</p>
  `)
});

/**
 * Plantilla: Intercambio (Swap)
 */
export const getSwapTemplate = (name: string, fromAmount: number, fromCurr: string, toAmount: number, toCurr: string) => ({
  subject: 'Intercambio de divisas exitoso - LatamPay 🔄',
  text: `Has cambiado ${fromAmount} ${fromCurr} por ${toAmount} ${toCurr}.`,
  html: baseLayout(`
    <h2 style="color: #333333; margin-top: 0;">Resumen de Intercambio</h2>
    <p>Hola <strong>${name}</strong>, tu cambio de divisa se ha realizado con éxito.</p>
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #eeeeee;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="color: ${SECONDARY_COLOR};">Entregaste:</span>
        <span style="font-weight: bold;">${fromAmount} ${fromCurr}</span>
      </div>
      <div style="text-align: center; margin: 10px 0; font-size: 20px;">⬇️</div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: ${SECONDARY_COLOR};">Recibiste:</span>
        <span style="font-weight: bold; color: ${SUCCESS_COLOR};">${toAmount} ${toCurr}</span>
      </div>
    </div>
    <p>La tasa se aplicó según el valor de mercado al momento de la operación.</p>
  `)
});
