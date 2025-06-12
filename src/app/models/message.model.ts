export type MessageType = 'success' | 'error' | 'info' | 'warning';

export interface ErrorResponse {
  errorMessage?: string;
  message?: string;
  details?: string;
  errorCode?: string | number;
  errorType?: string;
  timeStamp?: string;
  [key: string]: any;
}

export interface Message {
  text: string;
  type: MessageType;
  duration?: number;
  error?: ErrorResponse | string | any;
}
