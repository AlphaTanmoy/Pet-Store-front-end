import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message, MessageType } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new BehaviorSubject<Message | null>(null);
  message$: Observable<Message | null> = this.messageSubject.asObservable();

  /**
   * Show a success message
   * @param text The message to display
   * @param duration Duration in milliseconds (default: 5000)
   */
  success(text: string, duration: number = 5000): void {
    this.show({ text, type: 'success', duration });
  }

  /**
   * Show an error message
   * @param error The error message or error object
   * @param duration Duration in milliseconds (default: 10000 for errors)
   */
  error(error: string | any, duration: number = 10000): void {
    if (typeof error === 'string') {
      this.show({ text: error, type: 'error', duration });
    } else {
      // Handle error object from backend
      const errorMessage = error?.error?.errorMessage || 
                         error?.error?.message || 
                         error?.message || 
                         'Server Down! Try Again Later';
      this.show({ 
        text: errorMessage, 
        type: 'error', 
        duration,
        error: error?.error || error
      });
    }
  }

  /**
   * Show a warning message
   * @param text The message to display
   * @param duration Duration in milliseconds (default: 5000)
   */
  warning(text: string, duration: number = 5000): void {
    this.show({ text, type: 'warning', duration });
  }

  /**
   * Show an info message
   * @param text The message to display
   * @param duration Duration in milliseconds (default: 5000)
   */
  info(text: string, duration: number = 5000): void {
    this.show({ text, type: 'info', duration });
  }

  /**
   * Show a custom message
   * @param message The message configuration
   */
  show(message: Message): void {
    this.messageSubject.next(message);
  }

  /**
   * Clear the current message
   */
  clear(): void {
    this.messageSubject.next(null);
  }

  /**
   * Show a message for a specific duration
   * @param message The message to display
   * @param duration Duration in milliseconds
   */
  showTemporary(message: Message, duration: number = 5000): void {
    const messageWithDuration = { ...message, duration };
    this.show(messageWithDuration);
  }
}
