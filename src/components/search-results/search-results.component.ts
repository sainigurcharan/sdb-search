import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { SearchResult } from '../../types/search-result.interface';
import { SearchResultsService } from '../../services/search-results.service';
import { SearchService } from '../../services/search.service';
import { SearchCriteria } from '../../types/search-criteria.interface';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'supplier',
    'service',
    'period_from',
    'period_to',
    'pax_from',
    'pax_to',
    'price',
    'price_for',
    'days',
    'market',
    'category',
    'currency',
    'active',
    'estimated'
  ];

  dataSource = new MatTableDataSource<SearchResult>([]);
  loading = false;
  error = '';
  searchCriteria: SearchCriteria = {};

  constructor(
    private searchResultsService: SearchResultsService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.searchCriteria = this.searchService.getSearchCriteria();
    this.loadSearchResults();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  private loadSearchResults(): void {
    this.loading = true;
    this.error = '';

    this.searchResultsService.getSearchResults().subscribe({
      next: (data: SearchResult[]) => {
        // Apply search criteria filtering
        const filteredData = this.applySearchFilter(data, this.searchCriteria);
        this.dataSource.data = filteredData;
        this.loading = false;
        
        // Set up sorting after data is loaded
        setTimeout(() => {
          this.dataSource.sort = this.sort;
        });
      },
      error: (err) => {
        this.error = 'Failed to load search results. Please try again.';
        this.loading = false;
        console.error('Error loading search results:', err);
      }
    });
  }

  private applySearchFilter(data: SearchResult[], criteria: SearchCriteria): SearchResult[] {
    return data.filter(item => {
      // Supplier filter
      if (criteria.supplier && !item.supplier.toLowerCase().includes(criteria.supplier.toLowerCase())) {
        return false;
      }

      // Service filter
      if (criteria.service && !item.service.toLowerCase().includes(criteria.service.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (criteria.periodFrom || criteria.periodTo) {
        const itemFromDate = new Date(item.period_from);
        const itemToDate = new Date(item.period_to);
        
        if (criteria.periodFrom) {
          const searchFromDate = new Date(criteria.periodFrom);
          if (itemToDate < searchFromDate) return false;
        }
        
        if (criteria.periodTo) {
          const searchToDate = new Date(criteria.periodTo);
          if (itemFromDate > searchToDate) return false;
        }
      }

      // Pax range filter
      if (criteria.paxFrom && item.pax_to < criteria.paxFrom) return false;
      if (criteria.paxTo && item.pax_from > criteria.paxTo) return false;

      // Price range filter
      if (criteria.priceFrom && item.price < criteria.priceFrom) return false;
      if (criteria.priceTo && item.price > criteria.priceTo) return false;

      // Market filter
      if (criteria.market && item.market !== criteria.market) return false;

      // Category filter
      if (criteria.category && item.category !== criteria.category) return false;

      // Currency filter
      if (criteria.currency && item.currency !== criteria.currency) return false;

      // Active filter
      if (criteria.active && item.active !== criteria.active) return false;

      return true;
    });
  }

  isDifficultPeriod(date: string): boolean {
    // Logic to determine if a date falls in a difficult period
    // This is a placeholder - implement based on your business rules
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    // Example: December and January are difficult periods
    return month === 11 || month === 0;
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
