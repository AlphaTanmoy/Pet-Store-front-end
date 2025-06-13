import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface MultiDropdownOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-multi-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './multi-dropdown.component.html',
  styleUrls: ['./multi-dropdown.component.css']
})
export class MultiDropdownComponent {
  @Input() options: MultiDropdownOption[] = [];
  @Input() selectedValues: any[] = [];
  @Input() label: string = '';
  @Input() placeholder: string = 'Select options';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() showClear: boolean = true;
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() hint: string = '';
  @Input() maxSelections: number | null = null;
  @Input() showSelectAll: boolean = false;
  @Input() searchable: boolean = true;
  
  @Output() selectedValuesChange = new EventEmitter<any[]>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<{ values: any[]; options: MultiDropdownOption[] }>();

  searchText: string = '';
  filteredOptions: MultiDropdownOption[] = [];
  allSelected: boolean = false;
  indeterminate: boolean = false;

  ngOnInit() {
    this.filteredOptions = [...this.options];
    this.updateSelectAllState();
  }

  ngOnChanges(changes: any) {
    if (changes.options) {
      this.filteredOptions = [...this.options];
      this.updateSelectAllState();
    }
  }

  onSearchChange(searchText: string): void {
    this.searchText = searchText.toLowerCase();
    this.filteredOptions = this.options.filter(option => 
      option.label.toLowerCase().includes(this.searchText)
    );
  }

  onSelectionChange(): void {
    this.updateSelectAllState();
    this.selectedValuesChange.emit([...this.selectedValues]);
    
    const selectedOptions = this.options.filter(option => 
      this.selectedValues.includes(option.value)
    );
    
    this.selectionChange.emit({
      values: [...this.selectedValues],
      options: selectedOptions
    });
  }

  onOpened(): void {
    this.searchText = '';
    this.filteredOptions = [...this.options];
    this.opened.emit();
  }

  onClosed(): void {
    this.closed.emit();
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedValues = [];
    this.allSelected = false;
    this.indeterminate = false;
    this.onSelectionChange();
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedValues = [];
    } else {
      this.selectedValues = this.filteredOptions
        .filter(option => !option.disabled)
        .map(option => option.value);
    }
    this.onSelectionChange();
  }

  private updateSelectAllState(): void {
    if (!this.filteredOptions.length) {
      this.allSelected = false;
      this.indeterminate = false;
      return;
    }

    const selectedCount = this.filteredOptions
      .filter(option => this.selectedValues.includes(option.value) && !option.disabled)
      .length;
    
    const totalSelectable = this.filteredOptions.filter(option => !option.disabled).length;
    
    this.allSelected = selectedCount === totalSelectable && totalSelectable > 0;
    this.indeterminate = selectedCount > 0 && selectedCount < totalSelectable;
  }

  getSelectedLabels(): string[] {
    return this.options
      .filter(option => this.selectedValues.includes(option.value))
      .map(option => option.label);
  }

  removeChip(value: any, event: Event): void {
    event.stopPropagation();
    this.selectedValues = this.selectedValues.filter(v => v !== value);
    this.onSelectionChange();
  }

  trackByValue(index: number, option: MultiDropdownOption): any {
    return option.value;
  }

  getOptionLabel(value: any): string {
    const option = this.options.find(opt => opt.value === value);
    return option ? option.label : '';
  }
}
