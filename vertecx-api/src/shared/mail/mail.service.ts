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
            const mailOptions = {
                from: `"Soporte SistemaPC" <${process.env.MAIL_USER}>`,
                to: email,
                subject: 'Bienvenido a SistemaPC - Credenciales de acceso',
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 10px; overflow: hidden; border: 1px solid #ddd;">
          <div style="background-color: #0078d4; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">¡Bienvenido a <span style="color: #ffd700;">SistemaPC</span>!</h1>
          </div>
          <div style="padding: 25px; color: #333;">
            <p>Hola <b>${name}</b>,</p>
            <p>Tu cuenta ha sido creada exitosamente en <b>SistemaPC</b>. A continuación te compartimos tus credenciales de acceso:</p>

            <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><b>Correo:</b></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><b>Contraseña:</b></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${password}</td>
              </tr>
            </table>

            <p style="margin-top: 20px;">🔒 <i>Por seguridad, te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.</i></p>
            <p style="margin-top: 15px;">Gracias por confiar en <b>SistemaPC</b>.</p>
          </div>
          <div style="background: #0078d4; color: white; text-align: center; padding: 15px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} SistemaPC | Soporte técnico</p>
          </div>
        </div>
        `,
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error enviando correo:', error);
            throw new InternalServerErrorException('No se pudo enviar el correo.');
        }
    }

    // Correo de notificación de actualización de cuenta
    async sendUpdateNotification(email: string, name: string, changesHtml: string) {
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
          <div style="background-color: #0078d4; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Actualización de cuenta</h2>
          </div>
          <div style="padding: 25px; color: #333;">
            <p>Hola <b>${name}</b>,</p>
            <p>Se han realizado los siguientes cambios en tu cuenta:</p>
            <ul style="margin-top: 10px; padding-left: 20px;">${formattedChanges}</ul>

            <p style="margin-top: 20px;">Si no realizaste estos cambios, contacta inmediatamente al <b>equipo de soporte técnico</b>.</p>
          </div>
          <div style="background: #0078d4; color: white; text-align: center; padding: 15px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} SistemaPC | Soporte técnico</p>
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

}
