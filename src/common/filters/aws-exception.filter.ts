import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AwsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AwsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let errorCode = 'INTERNAL_ERROR';

    if (this.isAwsError(exception)) {
      this.logger.error(`AWS Error: ${exception.name} - ${exception.message}`);

      switch (exception.name) {
        case 'MessageRejected':
          status = HttpStatus.BAD_REQUEST;
          message = 'Mensagem rejeitada pelo provedor de email';
          errorCode = 'MESSAGE_REJECTED';
          break;
        case 'InvalidParameterException':
          status = HttpStatus.BAD_REQUEST;
          message = 'Parâmetro inválido fornecido';
          errorCode = 'INVALID_PARAMETER';
          break;
        case 'MailFromDomainNotVerifiedException':
          status = HttpStatus.FORBIDDEN;
          message = 'Domínio de origem não verificado no SES';
          errorCode = 'MAIL_FROM_DOMAIN_NOT_VERIFIED';
          break;
        case 'LimitExceededException':
          status = HttpStatus.TOO_MANY_REQUESTS;
          message = 'Limite de envio excedido';
          errorCode = 'LIMIT_EXCEEDED';
          break;
        case 'AuthorizationErrorException':
          status = HttpStatus.FORBIDDEN;
          message = 'Sem permissão para realizar esta operação';
          errorCode = 'AUTHORIZATION_ERROR';
          break;
        case 'ThrottlingException':
        case 'ThrottledException':
          status = HttpStatus.TOO_MANY_REQUESTS;
          message = 'Taxa de requisições excedida';
          errorCode = 'THROTTLED';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = `Erro no serviço AWS: ${exception.message}`;
          errorCode = 'AWS_SERVICE_ERROR';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Error: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private isAwsError(
    exception: unknown,
  ): exception is Error & { name: string } {
    return (
      exception instanceof Error &&
      'name' in exception &&
      'message' in exception
    );
  }
}
