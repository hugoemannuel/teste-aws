import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './aws/aws.module';
import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_SES_SOURCE: Joi.string().email().required(),
        AWS_SNS_REGION: Joi.string().default(Joi.ref('AWS_REGION')),
      }),
    }),
    AwsModule,
    EmailModule,
    SmsModule,
  ],
})
export class AppModule {}
