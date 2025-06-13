import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio';
  options?: { value: any; label: string }[];
  placeholder?: string;
  value?: any;
  multiple?: boolean;
  required?: boolean;
}

@Component({
  selector: 'app-filter-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.css']
})
export class FilterSectionComponent {
  @Input() filters: FilterOption[] = [];
  @Input() title: string = 'Filters';
  @Input() showSearch: boolean = true;
  @Input() showReset: boolean = true;
  @Input() searchPlaceholder: string = 'Search...';
  @Output() filterChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Output() reset = new EventEmitter<void>();

  searchControl = new FormControl('');
  filterValues: { [key: string]: any } = {};

  constructor() {
    this.searchControl.valueChanges.subscribe(value => {
      this.onSearch(value || '');
    });
  }

  onFilterChange(filterId: string, value: any): void {
    this.filterValues[filterId] = value;
    this.filterChange.emit({ ...this.filterValues });
  }

  onCheckboxChange(filter: FilterOption, value: any, checked: boolean): void {
    const currentValues: any[] = this.filterValues[filter.id] || [];
    let newValues: any[];

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    this.filterValues[filter.id] = newValues;
    this.filterChange.emit({ ...this.filterValues });
  }

  onSearch(term: string): void {
    this.search.emit(term);
  }

  onReset(): void {
    this.searchControl.setValue('');
    this.filterValues = {};
    this.reset.emit();
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }
}
