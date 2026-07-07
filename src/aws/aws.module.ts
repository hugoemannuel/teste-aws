import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SESClient } from '@aws-sdk/client-ses';
import { SNSClient } from '@aws-sdk/client-sns';

export const SES_CLIENT = 'SES_CLIENT';
export const SNS_CLIENT = 'SNS_CLIENT';

const sesClientProvider: Provider = {
  provide: SES_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const region = configService.getOrThrow<string>('AWS_REGION');
    const accessKeyId = configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = configService.getOrThrow<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    return new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  },
};

const snsClientProvider: Provider = {
  provide: SNS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const region =
      configService.get<string>('AWS_SNS_REGION') ||
      configService.getOrThrow<string>('AWS_REGION');
    const accessKeyId = configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = configService.getOrThrow<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    return new SNSClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  },
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [sesClientProvider, snsClientProvider],
  exports: [SES_CLIENT, SNS_CLIENT],
})
export class AwsModule {}
