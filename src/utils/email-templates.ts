/**
 * LatamPay - Plantillas de Correo Electrónico
 * 
 * Este archivo centraliza el diseño de los correos para garantizar consistencia visual
 * y facilitar el mantenimiento de la marca.
 */

// Colores de marca LatamPay (matchean Logo.svg y el frontend)
const BRAND_CYAN = '#22D3EE';
const BRAND_BLUE = '#3B82F6';
const BRAND_VIOLET = '#A855F7';
const BRAND_DARK = '#0F172A'; // slate-950, fondo del header/footer

const APP_COLOR = BRAND_BLUE;
const SECONDARY_COLOR = '#666666';
const SUCCESS_COLOR = '#10B981'; // emerald-500
const WARNING_COLOR = '#EF4444'; // red-500

const LOGO_URL = 'https://latam-pay-frontend.vercel.app/apple-touch-icon.png';

// CDN público de Icons8 (PNG estables, no requieren auth)
const SOCIAL_ICONS = {
  instagram: 'https://img.icons8.com/color/48/instagram-new.png',
  x: 'https://img.icons8.com/color/48/twitterx--v2.png',
  tiktok: 'https://img.icons8.com/color/48/tiktok--v1.png',
};

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

type TransferEmailOpts = {
  direction: 'sent' | 'received';
  name: string;
  counterpartyName: string;
  amount: number;
  currency: string;
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: Date) =>
  date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const buildTransferEmail = (opts: TransferEmailOpts) => {
  const isSent = opts.direction === 'sent';
  const title = isSent ? 'Transferencia enviada' : 'Transferencia recibida';
  const intro = isSent
    ? `Hola <strong>${opts.name}</strong>, tu envío de dinero se ha completado.`
    : `Hola <strong>${opts.name}</strong>, recibiste una transferencia en tu cuenta.`;
  const counterpartyLabel = isSent ? 'Destinatario' : 'Remitente';
  const amountColor = isSent ? APP_COLOR : SUCCESS_COLOR;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>${title}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">
  </head>
  <body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background-color:#f4f4f4;">
    <div dir="ltr">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <td valign="top">
              <!-- Header con logo + wordmark LatamPay -->
              <table cellspacing="0" cellpadding="0" align="center">
                <tbody>
                  <tr>
                    <td align="center">
                      <table width="600" cellspacing="0" cellpadding="0" bgcolor="${BRAND_DARK}" align="center">
                        <tbody>
                          <tr>
                            <td align="center" style="padding:40px 35px;">
                              <img src="${LOGO_URL}" alt="LatamPay" width="72" height="72" style="display:block;margin:0 auto;border-radius:16px;">
                              <h1 style="color:#ffffff;font-size:30px;font-weight:700;margin:18px 0 6px 0;letter-spacing:1px;font-family:Inter,Arial,sans-serif;">
                                Latam<span style="color:${BRAND_CYAN};">Pay</span>
                              </h1>
                              <p style="color:#94A3B8;font-size:13px;margin:0;font-family:Inter,Arial,sans-serif;">
                                Tu billetera digital en Latinoamérica
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Content -->
              <table align="center" cellspacing="0" cellpadding="0">
                <tbody>
                  <tr>
                    <td bgcolor="transparent" align="center">
                      <table cellspacing="0" bgcolor="#ffffff" align="center" width="600" cellpadding="0">
                        <tbody>
                          <tr>
                            <td align="left" style="padding:45px 35px 25px 35px;">
                              <table width="100%" cellspacing="0" cellpadding="0">
                                <tbody>
                                  <tr>
                                    <td width="530" valign="top" align="center">
                                      <h1 style="margin:0 0 10px 0;color:${amountColor};font-size:32px;">
                                        ${formatAmount(opts.amount)} ${opts.currency}
                                      </h1>
                                      <h2 style="margin:0 0 20px 0;color:#333333;font-size:22px;">
                                        ${title}
                                      </h2>
                                      <p style="margin:0 0 25px 0;color:#333333;line-height:1.5;">
                                        ${intro}
                                      </p>

                                      <table style="width:100%;background-color:#f8f9fa;border-radius:8px;margin:20px 0;border-collapse:collapse;">
                                        <tr>
                                          <td style="padding:12px 16px;color:${SECONDARY_COLOR};">${counterpartyLabel}:</td>
                                          <td style="padding:12px 16px;text-align:right;font-weight:bold;">${opts.counterpartyName}</td>
                                        </tr>
                                        <tr>
                                          <td style="padding:12px 16px;color:${SECONDARY_COLOR};border-top:1px solid #eeeeee;">Monto:</td>
                                          <td style="padding:12px 16px;text-align:right;font-weight:bold;border-top:1px solid #eeeeee;color:${amountColor};">${formatAmount(opts.amount)} ${opts.currency}</td>
                                        </tr>
                                        <tr>
                                          <td style="padding:12px 16px;color:${SECONDARY_COLOR};border-top:1px solid #eeeeee;">Fecha:</td>
                                          <td style="padding:12px 16px;text-align:right;border-top:1px solid #eeeeee;">${formatDate(new Date())}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>

                          <!-- Security notice -->
                          <tr>
                            <td align="left" style="padding:40px 35px 35px 35px;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tbody>
                                  <tr>
                                    <td align="left" width="530">
                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                        <tbody>
                                          <tr>
                                            <td align="center">
                                              <h5 style="margin:0;color:#333333;"><strong>Aviso de seguridad</strong></h5>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" style="padding-top:10px;">
                                              <p style="margin:0;color:${SECONDARY_COLOR};line-height:1.5;">
                                                Si no reconocés esta operación, contactá a soporte de inmediato.
                                              </p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Footer -->
              <table cellspacing="0" cellpadding="0" align="center">
                <tbody>
                  <tr>
                    <td align="center">
                      <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" width="600">
                        <tbody>
                          <tr>
                            <td align="left" style="padding:45px;">
                              <table cellpadding="0" align="right" cellspacing="0">
                                <tbody>
                                  <tr>
                                    <td align="left" width="510">
                                      <table cellpadding="0" width="100%" cellspacing="0">
                                        <tbody>
                                          <tr>
                                            <td align="center" style="font-size:0;padding-bottom:30px;">
                                              <table cellpadding="0" cellspacing="0" align="center">
                                                <tbody>
                                                  <tr>
                                                    <td valign="middle" align="center" style="padding:0 14px;">
                                                      <a href="#" target="_blank" style="text-decoration:none;">
                                                        <img height="40" width="40" title="Instagram" alt="Instagram" src="${SOCIAL_ICONS.instagram}" style="display:block;border:0;">
                                                      </a>
                                                    </td>
                                                    <td valign="middle" align="center" style="padding:0 14px;">
                                                      <a target="_blank" href="#" style="text-decoration:none;">
                                                        <img height="40" width="40" title="X" alt="X" src="${SOCIAL_ICONS.x}" style="display:block;border:0;">
                                                      </a>
                                                    </td>
                                                    <td valign="middle" align="center" style="padding:0 14px;">
                                                      <a href="#" target="_blank" style="text-decoration:none;">
                                                        <img height="40" width="40" title="TikTok" alt="TikTok" src="${SOCIAL_ICONS.tiktok}" style="display:block;border:0;">
                                                      </a>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style="font-family:Inter,Arial,sans-serif;font-size:0;">
                                              <table cellpadding="0" cellspacing="0" width="100%">
                                                <tbody>
                                                  <tr>
                                                    <td valign="top" width="25%" align="center" style="padding:5px 0;">
                                                      <a href="#" target="_blank" style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#333333;text-decoration:none;">Inicio</a>
                                                    </td>
                                                    <td align="center" valign="top" width="25%" style="padding:5px 0;border-left:1px solid #151515;">
                                                      <a href="#" target="_blank" style="font-size:14px;font-family:Inter,Arial,sans-serif;color:#333333;text-decoration:none;">Conversor</a>
                                                    </td>
                                                    <td valign="top" width="25%" align="center" style="padding:5px 0;border-left:1px solid #151515;">
                                                      <a target="_blank" href="#" style="font-size:14px;font-family:Inter,Arial,sans-serif;color:#333333;text-decoration:none;">Movimientos</a>
                                                    </td>
                                                    <td align="center" valign="top" width="25%" style="padding:5px 0;border-left:1px solid #151515;">
                                                      <a href="#" target="_blank" style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#333333;text-decoration:none;">Soporte</a>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style="font-family:Inter,Arial,sans-serif;font-size:0;padding:30px 0 20px 0;">
                                              <table cellspacing="0" width="100%" cellpadding="0">
                                                <tbody>
                                                  <tr>
                                                    <td width="50%" align="right" valign="top" style="padding:5px 15px;">
                                                      <a target="_blank" href="#" style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#333333;text-decoration:none;">Privacidad</a>
                                                    </td>
                                                    <td valign="top" width="50%" align="left" style="padding:5px 15px;border-left:1px solid #151515;">
                                                      <a href="#" target="_blank" style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#333333;text-decoration:none;">Términos</a>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" style="padding:10px 0;">
                                              <p style="line-height:200%;margin:0;color:${SECONDARY_COLOR};font-size:12px;">
                                                &copy; 2026 LatamPay S.A. — América Latina
                                              </p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`;
};

/**
 * Plantilla: Transferencia Enviada (Comprobante)
 */
export const getTransferSentTemplate = (name: string, amount: number, currency: string, toName: string) => ({
  subject: 'Comprobante de Transferencia - LatamPay 📄',
  text: `Has enviado ${formatAmount(amount)} ${currency} a ${toName}.`,
  html: buildTransferEmail({
    direction: 'sent',
    name,
    counterpartyName: toName,
    amount,
    currency,
  }),
});

/**
 * Plantilla: Transferencia Recibida
 */
export const getTransferReceivedTemplate = (name: string, amount: number, currency: string, fromName: string) => ({
  subject: '¡Has recibido dinero! 💰',
  text: `Hola ${name}, has recibido ${formatAmount(amount)} ${currency} de ${fromName}.`,
  html: buildTransferEmail({
    direction: 'received',
    name,
    counterpartyName: fromName,
    amount,
    currency,
  }),
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
