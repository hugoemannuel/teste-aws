import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SendEmailDto {
  @IsEmail({}, { message: 'Campo "to" deve ser um email válido' })
  to: string;

  @IsString()
  @MinLength(3, { message: 'Assunto deve ter no mínimo 3 caracteres' })
  subject: string;

  @IsString()
  @MinLength(10, { message: 'Corpo deve ter no mínimo 10 caracteres' })
  body: string;

  @IsOptional()
  isHtml?: boolean;

  @IsOptional()
  @IsString()
  cc?: string;

  @IsOptional()
  @IsString()
  bcc?: string;
}
