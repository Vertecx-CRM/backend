import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // Correo de bienvenida con credenciales
  async sendUserPassword(email: string, name: string, password: string) {
    try {
      const brandRed = '#B22222';
      const brandBlack = '#000000';
      const lightGray = '#f4f4f4';

      const mailOptions = {
        from: `"Soporte SistemasPC" <${process.env.MAIL_USER}>`,
        to: email,
        subject: '🔑 Credenciales de Acceso - SistemasPC',
        html: `
        <div style="background-color: ${lightGray}; padding: 40px 10px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #eeeeee; border-top: 6px solid ${brandRed};">
            
            <div style="padding: 30px 40px; text-align: left;">
              <h2 style="margin: 0; color: ${brandBlack}; font-size: 12px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">
                SistemasPC / Seguridad
              </h2>
              <h1 style="margin: 10px 0 0 0; color: ${brandBlack}; font-size: 28px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                CONFIGURACIÓN DE CUENTA
              </h1>
            </div>

            <div style="padding: 0 40px 40px 40px; color: #555555; line-height: 1.6;">
              <p style="font-size: 16px; margin-bottom: 25px;">
                Hola <strong style="color: ${brandBlack};">${name}</strong>,<br>
                Se ha generado un perfil de acceso para tu usuario en nuestra plataforma de infraestructura tecnológica.
              </p>

              <div style="background-color: ${lightGray}; border-left: 4px solid ${brandBlack}; padding: 25px; margin-bottom: 30px;">
                <p style="margin: 0 0 15px 0; font-size: 10px; font-weight: 900; color: ${brandRed}; letter-spacing: 2px; text-transform: uppercase;">
                  Credenciales de Acceso
                </p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 5px 0; font-size: 13px; color: #888888; width: 100px;">USUARIO:</td>
                    <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: ${brandBlack}; font-family: monospace;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-size: 13px; color: #888888;">PASSWORD:</td>
                    <td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: ${brandBlack}; font-family: monospace;">${password}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 35px;">
                <a href="${process.env.FRONTEND_URL}/auth/loginlogin" 
                   style="background-color: ${brandBlack}; color: #ffffff; padding: 15px 35px; text-decoration: none; font-size: 12px; font-weight: 900; letter-spacing: 2px; display: inline-block; border-radius: 0px;">
                  ACCEDER AL PORTAL
                </a>
              </div>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <p style="font-size: 12px; color: #999999; margin: 0;">
                  <strong>AVISO DE SEGURIDAD:</strong> Por protocolos de ingeniería, te recomendamos cambiar esta contraseña en tu primer inicio de sesión. Esta clave es de uso personal e intransferible.
                </p>
              </div>
            </div>

            <div style="background-color: ${brandBlack}; color: #ffffff; padding: 20px 40px; text-align: center; font-size: 10px; font-weight: bold; letter-spacing: 1px;">
              © ${new Date().getFullYear()} SISTEMAS PC — INFRAESTRUCTURA Y TECNOLOGÍA
            </div>

          </div>
        </div>
      `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de bienvenida.',
      );
    }
  }
  // Correo de notificación de actualización de cuenta
  async sendUpdateNotification(
    email: string,
    name: string,
    changesHtml: string,
  ) {
    try {
      const formattedChanges = changesHtml
        .split('<br/>')
        .map((c) => `<li style="margin-bottom: 6px;">${c}</li>`)
        .join('');

      const mailOptions = {
        from: `"Soporte SistemaPC" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Actualización de tu cuenta en SistemaPC',
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 10px; border: 1px solid #ddd; overflow: hidden;">
  <div style="background-color: #b20000; color: white; padding: 20px; text-align: center;">
    <h2 style="margin: 0;">Actualización de cuenta</h2>
  </div>

  <div style="padding: 25px; color: #333;">
    <p>Hola <b>${name}</b>,</p>

    <p>
      Queremos informarte que <b>los datos de tu cuenta han sido actualizados correctamente</b>.  
      Por favor, <b>revisa tu cuenta para confirmar que toda la información sea correcta</b>.
    </p>

    <p style="margin-top: 20px;">
      Si no realizaste estos cambios, por favor contacta de inmediato al 
      <b>equipo de soporte técnico</b>.
    </p>
  </div>

  <div style="background: #b20000; color: white; text-align: center; padding: 15px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} SistemaPC | Soporte técnico</p>
  </div>
</div>

        </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando correo de actualización:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de actualización.',
      );
    }
  }

  // Correo de notificación de eliminación de cuenta
  async sendAccountDeletionNotice(email: string, name: string) {
    try {
      const mailOptions = {
        from: `"Soporte SistemaPC" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Tu cuenta ha sido eliminada de SistemaPC',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 10px; border: 1px solid #ddd; overflow: hidden;">
        <div style="background-color: #c62828; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Cuenta eliminada</h2>
        </div>
        <div style="padding: 25px; color: #333;">
          <p>Hola <b>${name}</b>,</p>
          <p>Te informamos que tu cuenta ha sido <b>eliminada</b> del sistema <b>SistemaPC</b>.</p>
          <p>Ya no tendrás acceso a la plataforma ni a tus datos personales asociados.</p>
          <p style="margin-top: 15px;">Si consideras que esta acción fue un error o deseas más información, por favor contacta al equipo de soporte técnico:</p>
          <p style="margin-top: 10px;"><a href="mailto:${process.env.MAIL_USER}" style="color: #0078d4; text-decoration: none;">${process.env.MAIL_USER}</a></p>
          <p style="margin-top: 20px;">Gracias por haber hecho parte de <b>SistemaPC</b>.</p>
        </div>
        <div style="background: #c62828; color: white; text-align: center; padding: 15px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} SistemaPC | Soporte técnico</p>
        </div>
      </div>
      `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando correo de eliminación:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de eliminación.',
      );
    }
  }

  async sendPasswordReset(email: string, name: string, link: string) {
    try {
      const mailOptions = {
        from: `"Soporte SistemaPC" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Restablecer contraseña - SistemaPC',
        html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <div style="background-color: #0D141C; padding: 30px; text-align: center; border-bottom: 4px solid #B20000;">
            <h1 style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase;">
              SISTEMAS PC
            </h1>
          </div>

          <div style="padding: 40px; color: #333333; line-height: 1.6;">
            <h2 style="color: #0D141C; font-size: 20px; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; letter-spacing: -0.5px;">
              Restablecer Credenciales
            </h2>
            
            <p style="font-size: 15px; margin-bottom: 10px;">Hola <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #555555; margin-bottom: 30px;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en nuestra infraestructura. Si fuiste tú, procede mediante el siguiente protocolo de seguridad:
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${link}" style="background-color: #B20000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; transition: background 0.3s ease;">
                Actualizar Contraseña
              </a>
            </div>

            <p style="font-size: 13px; color: #777777; font-style: italic; margin-bottom: 20px;">
              * Este enlace expirará por motivos de seguridad.
            </p>

            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;" />

            <p style="font-size: 11px; color: #999999; line-height: 1.4;">
              Si el botón no funciona, copia y pega este enlace técnico en tu navegador:
              <br />
              <a href="${link}" style="color: #B20000; text-decoration: none; word-break: break-all;">${link}</a>
            </p>

            <p style="font-size: 13px; color: #555555; margin-top: 25px;">
              Si no solicitaste este cambio, puedes ignorar este mensaje. Tu cuenta permanece segura.
            </p>
          </div>

          <div style="background-color: #f9f9f9; padding: 25px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="margin: 0; font-size: 10px; color: #999999; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
              © ${new Date().getFullYear()} SISTEMAS PC | DEPARTAMENTO TÉCNICO
            </p>
          </div>

        </div>
      </div>
      `,
      };
      // ... resto de tu lógica de envío
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando mail:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperación.',
      );
    }
  }

  async sendAppointmentScheduled(
    email: string,
    name: string,
    context: string,
    when: string,
  ) {
    try {
      const safeName = (name ?? '').trim();
      const safeContext = (context ?? '').trim();
      const safeWhen = (when ?? '').trim();

      const displayName = safeName || 'cliente';
      const displayContext = safeContext || 'cita';
      const displayWhen = safeWhen || 'la fecha acordada';

      const mailOptions = {
        from: `"Soporte SistemaPC" <${process.env.MAIL_USER}>`,
        to: email,
        subject: `Tu ${displayContext} fue agendada`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 10px; border: 1px solid #ddd; overflow: hidden;">
            <div style="background-color: #b20000; color: white; padding: 18px 20px; text-align: center;">
              <h2 style="margin: 0;">Confirmaci&oacute;n de agenda</h2>
            </div>

            <div style="padding: 22px; color: #333; line-height: 1.6;">
              <p>Hola <b>${displayName}</b>,</p>
              <p>Tu ${displayContext} est&aacute; agendada para:</p>
              <p style="margin: 12px 0; padding: 12px; background: #eef6ff; border-radius: 8px; border: 1px solid #cfe2ff;">
                <b>${displayWhen}</b>
              </p>
              <p>Si necesitas reprogramar o tienes dudas, cont&aacute;ctanos respondiendo a este correo.</p>
            </div>

            <div style="background: #b20000; color: white; text-align: center; padding: 14px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} SistemaPC | Soporte t&eacute;cnico</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando correo de agenda:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de agenda.',
      );
    }
  }

  async sendQuoteCreated(
    email: string,
    name: string,
    quote: any,
    audience: 'cliente' | 'admin',
    technicianName?: string,
  ) {
    try {
      const safeName = String(name ?? '').trim() || 'cliente';
      const safeAudience = audience === 'admin' ? 'admin' : 'cliente';
      const quoteId = Number(quote?.quotesid ?? 0) || 'N/A';
      const requestId = Number(
        quote?.serviceRequest?.serviceRequestId ?? quote?.serviceRequestId ?? 0,
      ) || 'N/A';
      const total = Number(quote?.total ?? 0);
      const formattedTotal = total.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      });
      const details = Array.isArray(quote?.details) ? quote.details : [];
      const detailLines = details
        .map((detail: any) => {
          const description = String(detail?.description ?? '').trim() || 'Item';
          const quantity = Math.max(1, Math.round(Number(detail?.quantity ?? 1)));
          const subtotal = Number(detail?.subtotal ?? 0).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
          });
          return `<li>${description} x ${quantity} - ${subtotal}</li>`;
        })
        .join('');

      const subject =
        safeAudience === 'admin'
          ? `Nueva cotizacion #${quoteId} registrada`
          : `Tu cotizacion #${quoteId} fue creada`;
      const rawServiceType = String(
        quote?.serviceRequest?.serviceType ?? quote?.serviceType ?? '',
      )
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
      const isInstallationFlow = rawServiceType.includes('instal');

      const headerCopy =
        safeAudience === 'admin'
          ? isInstallationFlow
            ? 'Se genero una nueva cotizacion desde una asesoria tecnica previa a instalacion.'
            : 'Se genero una nueva cotizacion desde una solicitud de servicio.'
          : isInstallationFlow
            ? 'Tu cotizacion fue registrada correctamente tras la asesoria tecnica previa y queda pendiente de tu revision.'
            : 'Tu cotizacion fue registrada correctamente y queda pendiente de tu revision.';

      const techCopy = technicianName
        ? `<p><strong>Tecnico relacionado:</strong> ${technicianName}</p>`
        : '';

      const mailOptions = {
        from: `"Soporte SistemaPC" <${process.env.MAIL_USER}>`,
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; background: #f9f9f9; border-radius: 10px; border: 1px solid #ddd; overflow: hidden;">
            <div style="background-color: #b20000; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Cotizacion creada</h2>
            </div>

            <div style="padding: 24px; color: #333; line-height: 1.6;">
              <p>Hola <b>${safeName}</b>,</p>
              <p>${headerCopy}</p>

              <div style="margin: 18px 0; padding: 16px; background: #fff; border: 1px solid #eee; border-radius: 8px;">
                <p style="margin: 0 0 8px 0;"><strong>Cotizacion:</strong> #${quoteId}</p>
                <p style="margin: 0 0 8px 0;"><strong>${isInstallationFlow ? 'Asesoria tecnica previa' : 'Solicitud de servicio'}:</strong> #${requestId}</p>
                <p style="margin: 0 0 8px 0;"><strong>Total estimado:</strong> ${formattedTotal}</p>
                ${techCopy}
              </div>

              ${
                detailLines
                  ? `<div style="margin-top: 18px;">
                      <p style="margin: 0 0 8px 0;"><strong>Detalle:</strong></p>
                      <ul style="margin: 0; padding-left: 18px;">${detailLines}</ul>
                    </div>`
                  : ''
              }

              ${
                safeAudience === 'cliente'
                  ? '<p style="margin-top: 18px;">Desde tu panel podras aceptarla o cancelarla antes de la aprobacion administrativa.</p>'
                  : '<p style="margin-top: 18px;">Recuerda que la cotizacion requiere aceptacion del cliente antes de aprobarla.</p>'
              }
            </div>

            <div style="background: #b20000; color: white; text-align: center; padding: 14px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} SistemaPC | Soporte tecnico</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando correo de cotizacion:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de cotizacion.',
      );
    }
  }
}
