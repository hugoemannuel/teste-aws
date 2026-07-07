import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ISendEmailResponse } from './interfaces/email-sender.interface';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendEmailDto): Promise<ISendEmailResponse> {
    return this.emailService.send({
      to: dto.to,
      subject: dto.subject,
      body: dto.body,
      isHtml: dto.isHtml ?? false,
    });
  }
}
