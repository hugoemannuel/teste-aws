import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type {
  IEmailSender,
  ISendEmailOptions,
  ISendEmailResponse,
} from './interfaces/email-sender.interface';

@Injectable()
export class EmailService implements IEmailSender {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.getOrThrow<string>('SMTP_FROM');
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASS'),
      },
    });
  }

  async send(options: ISendEmailOptions): Promise<ISendEmailResponse> {
    const { to, subject, body, isHtml, cc, bcc } = options;

    this.logger.log(
      `Enviando email para: ${Array.isArray(to) ? to.join(', ') : to}`,
    );

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        [isHtml ? 'html' : 'text']: body,
      };

      if (cc) {
        mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc;
      }

      if (bcc) {
        mailOptions.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc;
      }

      const result = (await this.transporter.sendMail(mailOptions)) as {
        messageId: string;
      };

      this.logger.log(
        `Email enviado com sucesso. MessageId: ${result.messageId}`,
      );

      return {
        messageId: result.messageId ?? 'unknown',
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Falha ao enviar email: ${err.message}`, err.stack);
      throw error;
    }
  }
}
