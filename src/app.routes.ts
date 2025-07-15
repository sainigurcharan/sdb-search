import { Routes } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';

export const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'results', component: SearchResultsComponent },
  { path: '**', redirectTo: '/search' }
];
