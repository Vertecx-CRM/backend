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

    async sendUserPassword(email: string, name: string, password: string) {
        try {
            const mailOptions = {
                from: `"Soporte SistemaPC" <${process.env.MAIL_USER}>`,
                to: email,
                subject: 'Bienvenido a SistemaPC - Credenciales de acceso',
                html: `
          <h2>Hola ${name}, ¡bienvenido a SistemaPC!</h2>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          <p><b>Usuario:</b> ${email}</p>
          <p><b>Contraseña:</b> ${password}</p>
          <p>Por seguridad, cambia tu contraseña al ingresar por primera vez.</p>
          <br/>
          <p>Atentamente,<br/>Equipo de Soporte SistemaPC</p>
        `,
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error enviando correo:', error);
            throw new InternalServerErrorException('No se pudo enviar el correo.');
        }
    }
}
