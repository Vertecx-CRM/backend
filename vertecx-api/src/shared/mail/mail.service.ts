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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 10px; overflow: hidden; border: 1px solid #ddd;">
          <div style="background-color: #b20000; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Restablecer contraseña</h2>
          </div>
          <div style="padding: 25px; color: #333;">
            <p>Hola <b>${name}</b>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña en <b>SistemaPC</b>.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${link}" style="display: inline-block; background: #b20000; color: white; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600;">
                Restablecer contraseña
              </a>
            </div>

            <p style="margin-top: 10px; font-size: 12px; color: #666;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:
              <br/>
              <a href="${link}" style="color: #0078d4; text-decoration: none;">${link}</a>
            </p>

            <p style="margin-top: 18px;">
              Si tú no solicitaste este cambio, puedes ignorar este correo.
            </p>
          </div>
          <div style="background: #b20000; color: white; text-align: center; padding: 15px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} SistemaPC | Soporte técnico</p>
          </div>
        </div>
      `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando correo de recuperación:', error);
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
}
