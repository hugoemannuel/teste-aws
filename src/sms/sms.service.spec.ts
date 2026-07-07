import { Test, TestingModule } from '@nestjs/testing';
import { PublishCommand } from '@aws-sdk/client-sns';
import { SmsService } from './sms.service';
import { SNS_CLIENT } from '../aws/aws.module';

describe('SmsService', () => {
  let service: SmsService;
  const mockSnsClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: SNS_CLIENT,
          useValue: mockSnsClient,
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
  });

  it('deve enviar SMS com sucesso', async () => {
    mockSnsClient.send.mockResolvedValue({ MessageId: 'test-sms-id' });

    const result = await service.send({
      phoneNumber: '+5511999999999',
      message: 'Teste SMS',
    });

    expect(result.messageId).toBe('test-sms-id');
    expect(mockSnsClient.send).toHaveBeenCalledWith(expect.any(PublishCommand));
  });
});
