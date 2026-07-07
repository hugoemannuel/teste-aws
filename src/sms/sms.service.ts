import { Inject, Injectable, Logger } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SNS_CLIENT } from '../aws/aws.module';
import type {
  ISmsSender,
  ISendSmsOptions,
  ISendSmsResponse,
} from './interfaces/sms-sender.interface';

@Injectable()
export class SmsService implements ISmsSender {
  private readonly logger = new Logger(SmsService.name);

  constructor(@Inject(SNS_CLIENT) private readonly snsClient: SNSClient) {}

  async send(options: ISendSmsOptions): Promise<ISendSmsResponse> {
    const { phoneNumber, message } = options;

    this.logger.log(`Enviando SMS para: ${phoneNumber}`);

    try {
      const command = new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message,
        MessageAttributes: options.messageType
          ? {
              'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: options.messageType,
              },
            }
          : undefined,
      });

      const result = await this.snsClient.send(command);

      this.logger.log(
        `SMS enviado com sucesso. MessageId: ${result.MessageId}`,
      );

      return {
        messageId: result.MessageId ?? 'unknown',
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Falha ao enviar SMS: ${err.message}`, err.stack);
      throw error;
    }
  }
}
