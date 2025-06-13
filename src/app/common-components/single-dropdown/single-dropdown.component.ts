import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface DropdownOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-single-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './single-dropdown.component.html',
  styleUrls: ['./single-dropdown.component.css']
})
export class SingleDropdownComponent {
  @Input() options: DropdownOption[] = [];
  @Input() label: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() showClear: boolean = true;
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() hint: string = '';
  @Input() value: any = null;
  
  @Output() valueChange = new EventEmitter<any>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<{ value: any; option: DropdownOption }>();

  onValueChange(event: any): void {
    this.valueChange.emit(event.value);
    const selectedOption = this.options.find(opt => opt.value === event.value);
    if (selectedOption) {
      this.selectionChange.emit({ value: event.value, option: selectedOption });
    }
  }

  onOpened(): void {
    this.opened.emit();
  }

  onClosed(): void {
    this.closed.emit();
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.value = null;
    this.valueChange.emit(null);
    this.selectionChange.emit({ value: null, option: { value: null, label: '' } });
  }

  compareWithFn(option1: any, option2: any): boolean {
    if (option1 === null || option2 === null) {
      return option1 === option2;
    }
    return option1 === option2;
  }
}
