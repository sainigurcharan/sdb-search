import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchCriteria } from '../types/search-criteria.interface';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchCriteriaSubject = new BehaviorSubject<SearchCriteria>({});
  public searchCriteria$ = this.searchCriteriaSubject.asObservable();

  constructor() {}

  setSearchCriteria(criteria: SearchCriteria): void {
    this.searchCriteriaSubject.next(criteria);
  }

  getSearchCriteria(): SearchCriteria {
    return this.searchCriteriaSubject.value;
  }

  clearSearchCriteria(): void {
    this.searchCriteriaSubject.next({});
  }

  // Get dropdown options for form fields
  getMarketOptions(): string[] {
    return [
      'AdHoc',
      'Regular',
      'Premium',
      'Cultural',
      'Culinary',
      'Historical',
      'Adventure',
      'Photography',
      'Maritime',
      'Wellness',
      'Family',
      'Corporate',
      'Eco-Tourism',
      'Luxury',
      'Educational',
      'Extreme',
      'Romance',
      'Vintage'
    ];
  }

  getCategoryOptions(): string[] {
    return ['DKK', 'EUR', 'NOK', 'USD'];
  }

  getCurrencyOptions(): string[] {
    return ['DKK', 'EUR', 'NOK', 'USD'];
  }

  getActiveOptions(): string[] {
    return ['A', 'I'];
  }
}
