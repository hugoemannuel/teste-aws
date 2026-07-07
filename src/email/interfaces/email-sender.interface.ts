export interface ISendEmailOptions {
  to: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface ISendEmailResponse {
  messageId: string;
  timestamp: Date;
}

export interface IEmailSender {
  send(options: ISendEmailOptions): Promise<ISendEmailResponse>;
}
