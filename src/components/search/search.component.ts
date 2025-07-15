import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SearchService } from '../../services/search.service';
import { SearchCriteria } from '../../types/search-criteria.interface';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  marketOptions: string[] = [];
  categoryOptions: string[] = [];
  currencyOptions: string[] = [];
  activeOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private searchService: SearchService
  ) {
    this.searchForm = this.fb.group({
      supplier: [''],
      service: [''],
      periodFrom: [''],
      periodTo: [''],
      paxFrom: ['', [Validators.min(1)]],
      paxTo: ['', [Validators.min(1)]],
      priceFrom: ['', [Validators.min(0)]],
      priceTo: ['', [Validators.min(0)]],
      market: [''],
      category: [''],
      currency: [''],
      active: ['']
    });
  }

  ngOnInit(): void {
    this.loadDropdownOptions();
    this.loadPreviousSearchCriteria();
  }

  private loadDropdownOptions(): void {
    this.marketOptions = this.searchService.getMarketOptions();
    this.categoryOptions = this.searchService.getCategoryOptions();
    this.currencyOptions = this.searchService.getCurrencyOptions();
    this.activeOptions = this.searchService.getActiveOptions();
  }

  private loadPreviousSearchCriteria(): void {
    const criteria = this.searchService.getSearchCriteria();
    if (criteria && Object.keys(criteria).length > 0) {
      this.searchForm.patchValue(criteria);
    }
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      const formValue = this.searchForm.value;
      const searchCriteria: SearchCriteria = {
        ...formValue,
        periodFrom: formValue.periodFrom ? this.formatDate(formValue.periodFrom) : undefined,
        periodTo: formValue.periodTo ? this.formatDate(formValue.periodTo) : undefined
      };

      // Remove empty values
      Object.keys(searchCriteria).forEach(key => {
        if (searchCriteria[key as keyof SearchCriteria] === '' || 
            searchCriteria[key as keyof SearchCriteria] === null || 
            searchCriteria[key as keyof SearchCriteria] === undefined) {
          delete searchCriteria[key as keyof SearchCriteria];
        }
      });

      this.searchService.setSearchCriteria(searchCriteria);
      this.router.navigate(['/results']);
    }
  }

  onClear(): void {
    this.searchForm.reset();
    this.searchService.clearSearchCriteria();
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  // Form validation helpers
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.searchForm.get(fieldName);
    return field ? field.hasError(errorType) && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.searchForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('min')) {
      return `${fieldName} must be greater than 0`;
    }
    if (field.hasError('required')) {
      return `${fieldName} is required`;
    }
    return '';
  }
}
