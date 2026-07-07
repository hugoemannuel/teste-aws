import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer');

const mockConfig: Record<string, unknown> = {
  SMTP_FROM: 'no-reply@example.com',
  SMTP_HOST: 'email-smtp.us-east-1.amazonaws.com',
  SMTP_PORT: 587,
  SMTP_USER: 'smtp-user',
  SMTP_PASS: 'smtp-pass',
};

describe('EmailService', () => {
  let service: EmailService;
  const mockSendMail = jest.fn<Promise<{ messageId: string }>, []>();

  beforeEach(async () => {
    mockSendMail.mockReset();

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(
              <T>(key: string, defaultValue?: T): T | undefined =>
                (mockConfig[key] as T) ?? defaultValue,
            ),
            getOrThrow: jest.fn(<T>(key: string): T => {
              if (!(key in mockConfig))
                throw new Error(`Missing config: ${key}`);
              return mockConfig[key] as T;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('deve enviar email com sucesso', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const result = await service.send({
      to: 'destinatario@exemplo.com',
      subject: 'Teste',
      body: 'Corpo do email',
    });

    expect(result.messageId).toBe('test-message-id');
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'no-reply@example.com',
        to: 'destinatario@exemplo.com',
        subject: 'Teste',
        text: 'Corpo do email',
      }),
    );
  });

  it('deve lançar erro quando o envio falha', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP error'));

    await expect(
      service.send({
        to: 'destinatario@exemplo.com',
        subject: 'Teste',
        body: 'Corpo do email',
      }),
    ).rejects.toThrow('SMTP error');
  });

  it('deve enviar email com HTML quando isHtml=true', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'html-msg-id' });

    const result = await service.send({
      to: 'destinatario@exemplo.com',
      subject: 'HTML email',
      body: '<h1>Olá</h1>',
      isHtml: true,
    });

    expect(result.messageId).toBe('html-msg-id');
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: '<h1>Olá</h1>',
      }),
    );
  });
});
