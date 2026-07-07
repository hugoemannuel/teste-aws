export interface ISendSmsOptions {
  phoneNumber: string;
  message: string;
  messageType?: 'Transactional' | 'Promotional';
}

export interface ISendSmsResponse {
  messageId: string;
  timestamp: Date;
}

export interface ISmsSender {
  send(options: ISendSmsOptions): Promise<ISendSmsResponse>;
}
