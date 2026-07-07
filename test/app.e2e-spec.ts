import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AwsExceptionFilter } from './../src/common/filters/aws-exception.filter';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AwsExceptionFilter());
    await app.init();
  });

  it('deve rejeitar POST /email/send sem body', () => {
    return request(app.getHttpServer()).post('/email/send').expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
