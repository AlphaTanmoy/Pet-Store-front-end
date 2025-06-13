import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ActionButton {
  id: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn' | '';
  disabled?: boolean;
  tooltip?: string;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
}

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './action-buttons.component.html',
  styleUrl: './action-buttons.component.css'
})
export class ActionButtonsComponent {
  @Input() buttons: ActionButton[] = [];
  @Input() direction: 'row' | 'column' = 'row';
  @Input() gap: string = '8px';
  @Input() align: 'start' | 'center' | 'end' = 'start';
  @Output() buttonClick = new EventEmitter<string>();

  onButtonClick(buttonId: string): void {
    this.buttonClick.emit(buttonId);
  }

  get containerClass(): string {
    return `action-buttons-container ${this.direction} align-${this.align}`;
  }
}
