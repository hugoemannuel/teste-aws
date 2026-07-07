import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSmsDto } from './dto/send-sms.dto';
import { ISendSmsResponse } from './interfaces/sms-sender.interface';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendSmsDto): Promise<ISendSmsResponse> {
    return this.smsService.send({
      phoneNumber: dto.phoneNumber,
      message: dto.message,
      messageType: dto.messageType,
    });
  }
}
