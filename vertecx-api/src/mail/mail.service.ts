import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface MailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS, // Contraseña de aplicación Gmail
            },
        });
    }

    async sendMail(options: MailOptions): Promise<boolean> {
        try {
            const info = await this.transporter.sendMail({
                from: `"Vertecx" <${process.env.MAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });

            this.logger.log(`Correo enviado a ${options.to} — ID: ${info.messageId}`);
            return true;
        } catch (error) {
            this.logger.error(`Error enviando correo a ${options.to}: ${error.message}`);
            throw error;
        }
    }

    // ─── Template HTML para Orden de Compra ────────────────────────────────────
    buildOrderEmailHtml(data: {
        numeroOrden: string;
        supplierName: string;
        fecha?: string;
        productos: { producto: string; cantidad: number; precioUnitario: number }[];
        total: number;
        descripcion?: string;
    }): string {
        const itemsRows = data.productos
            .map(
                (p) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${p.producto}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${p.cantidad}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">$${p.precioUnitario.toLocaleString('es-CO')}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">$${(p.cantidad * p.precioUnitario).toLocaleString('es-CO')}</td>
        </tr>`,
            )
            .join('');

        return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orden de Compra</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">VERTECX</h1>
              <p style="margin:4px 0 0;color:#aaaaaa;font-size:13px;">Sistema de Gestión Empresarial</p>
            </td>
          </tr>

          <!-- Título -->
          <tr>
            <td style="padding:28px 32px 0;">
              <h2 style="margin:0;color:#111111;font-size:18px;">Orden de Compra</h2>
              <p style="margin:8px 0 0;color:#555555;font-size:14px;">
                Estimado(a) <strong>${data.supplierName}</strong>, le compartimos la siguiente orden de compra:
              </p>
            </td>
          </tr>

          <!-- Info de la orden -->
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;padding:16px;">
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#888;font-size:12px;">N° Orden</span><br>
                    <strong style="font-size:15px;color:#111;">${data.numeroOrden}</strong>
                  </td>
                  <td style="padding:4px 0;text-align:right;">
                    <span style="color:#888;font-size:12px;">Fecha estimada de entrega</span><br>
                    <strong style="font-size:15px;color:#111;">${data.fecha ?? 'Por definir'}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tabla de productos -->
          <tr>
            <td style="padding:0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#f0f0f0;">
                    <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;">Producto</th>
                    <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Cant.</th>
                    <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">Precio Unit.</th>
                    <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding:16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:right;">
                    <span style="font-size:14px;color:#555;">Total de la Orden: </span>
                    <strong style="font-size:20px;color:#111;">$${data.total.toLocaleString('es-CO')}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${data.descripcion
                ? `<tr>
              <td style="padding:0 32px 24px;">
                <div style="background:#fff7ed;border-left:3px solid #f97316;padding:12px 16px;border-radius:4px;">
                  <p style="margin:0;font-size:13px;color:#555;"><strong>Observaciones:</strong> ${data.descripcion}</p>
                </div>
              </td>
            </tr>`
                : ''
            }

          <!-- Footer -->
          <tr>
            <td style="background:#f5f5f5;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;">
                Este correo fue generado automáticamente por Vertecx.<br>
                Por favor no responda a este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
    }
}
