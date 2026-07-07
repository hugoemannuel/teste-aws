import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SendSmsDto {
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Telefone deve estar no formato E.164 (ex: +5511999999999)',
  })
  phoneNumber: string;

  @IsString()
  @MinLength(1, { message: 'Mensagem não pode estar vazia' })
  message: string;

  @IsOptional()
  @IsEnum(['Transactional', 'Promotional'])
  messageType?: 'Transactional' | 'Promotional';
}
