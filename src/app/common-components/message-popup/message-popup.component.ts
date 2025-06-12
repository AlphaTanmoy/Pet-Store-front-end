import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { Message, MessageType } from '../../models/message.model';

@Component({
  selector: 'app-message-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-popup.component.html',
  styleUrls: ['./message-popup.component.css']
})
export class MessagePopupComponent implements OnInit, OnDestroy {
  message: string = '';
  type: MessageType = 'info';
  show: boolean = false;
  private subscription: Subscription | null = null;
  private hideTimeout: any = null;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.subscription = this.messageService.message$.subscribe(message => {
      if (message) {
        this.showMessage(message);
      } else {
        this.hideMessage();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.clearHideTimeout();
  }

  get iconClass(): string {
    switch (this.type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'alert-triangle';
      case 'info':
      default:
        return 'info';
    }
  }

  close(): void {
    this.hideMessage();
    this.messageService.clear();
  }

  private showMessage(message: Message): void {
    this.clearHideTimeout();
    
    if (message.error) {
      if (typeof message.error === 'string') {
        this.message = message.error;
      } else if (message.error.errorMessage) {
        this.message = message.error.errorMessage;
      } else if (message.error.message) {
        this.message = message.error.message;
      } else {
        this.message = message.text;
      }
    } else {
      this.message = message.text;
    }
    
    this.type = message.type;
    this.show = true;

    const duration = message.duration || (message.type === 'error' ? 10000 : 5000);
    this.hideTimeout = setTimeout(() => {
      this.hideMessage();
    }, duration);
  }

  private hideMessage(): void {
    this.clearHideTimeout();
    this.show = false;
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}
