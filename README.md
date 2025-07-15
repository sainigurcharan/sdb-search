# Search Results Dashboard

A comprehensive Angular application for searching and displaying service results with responsive design, sorting capabilities, and modern UI components.

## 🚀 Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Advanced Search**: Multiple criteria search with form validation
- **Sortable Results**: All columns are sortable with Angular Material
- **Modern UI**: Built with Angular Material and Tailwind CSS
- **Real-time Data**: Fetches data from REST API endpoints
- **Professional Layout**: Clean, modern design with hover effects and animations

## 🛠️ Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Angular CLI** (v19 or higher)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd search-results-dashboard
```

### Step 2: Install Dependencies

```bash
# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli

# Install project dependencies
yarn install
# or
npm install

```

### Step 3: Start Development Server

```bash
yarn run dev
# or
npm run dev
```

The application will be available at `http://localhost:4200`

---

## 🔄 Application Workflow

### Overview

The application consists of two main screens:

1. **Search Screen** (`/search`) - Where users input search criteria
2. **Results Screen** (`/results`) - Displays filtered search results

### Workflow Steps

```
1. User lands on Search Screen (/search)
2. User fills search form with criteria
3. User clicks "Search Services" button
4. Application validates form inputs
5. Application sends search request to API
6. User is redirected to Results Screen (/results)
7. Results are displayed in sortable table
8. User can return to Search Screen via "Back" link
```

### Local URLs

- **Search Screen**: `http://localhost:4200/search`
- **Results Screen**: `http://localhost:4200/results`
- **Default Route**: `http://localhost:4200/` (redirects to search)

---

## 🌐 API Endpoints

### Search Endpoint

**URL**: `POST /api/search`

**Request Body**:
```json
{
  "supplier": "string",
  "service": "string",
  "periodFrom": "YYYY-MM-DD",
  "periodTo": "YYYY-MM-DD",
  "paxFrom": "number",
  "paxTo": "number",
  "priceFrom": "number",
  "priceTo": "number",
  "market": "string",
  "category": "string",
  "currency": "string",
  "active": "A" | "I" | "All"
}
```

### Results Endpoint

**URL**: `GET /api/search-results`

**Response Format**:
```json
[
  {
    "supplier": "string",
    "service": "string",
    "period_from": "YYYY-MM-DD",
    "period_to": "YYYY-MM-DD",
    "pax_from": "number",
    "pax_to": "number",
    "price": "number",
    "price_for": "string",
    "days": "string",
    "market": "string",
    "category": "string",
    "currency": "string",
    "active": "string",
    "estimated": "string"
  }
]
```

### Field Mappings

| Frontend Field | API Field | Type | Description |
|----------------|-----------|------|-------------|
| Supplier Short Name | supplier | string | Service provider name |
| Service Name | service | string | Name of the service |
| Period From | period_from | string | Start date (YYYY-MM-DD) |
| Period To | period_to | string | End date (YYYY-MM-DD) |
| PaxFr | pax_from | number | Minimum passengers |
| PaxTo | pax_to | number | Maximum passengers |
| Price | price | number | Service price |
| Price For | price_for | string | Price unit (Per Person, Per Group) |
| Days | days | string | Available days (1234567) |
| Market | market | string | Market category |
| Category | category | string | Service category |
| Curr | currency | string | Currency code |
| Active | active | string | Active status (A/I) |
| Estimated | estimated | string | Estimated flag (Y/N) |

---

## 🔐 JWT Authentication Guide

### Implementation Steps

#### Step 1: Install JWT Dependencies

```bash
yarn add @auth0/angular-jwt
```

#### Step 2: Create Authentication Service

```typescript
// src/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    return this.http.post<any>('/api/auth/login', { username, password })
      .pipe(map(user => {
        // Store user details and JWT token in local storage
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  getToken(): string | null {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser?.token || null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }
}
```

#### Step 3: Create Authentication Guard

```typescript
// src/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
```

#### Step 4: Create JWT Interceptor

```typescript
// src/interceptors/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

#### Step 5: Configure in Main Application

```typescript
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthGuard } from './guards/auth.guard';

bootstrapApplication(App, {
  providers: [
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
      { path: 'results', component: SearchResultsComponent, canActivate: [AuthGuard] },
      { path: '', redirectTo: '/search', pathMatch: 'full' }
    ]),
    provideHttpClient(withInterceptors([JwtInterceptor])),
    provideAnimations()
  ]
});
```

#### Step 6: Session Management

```typescript
// Add to AuthService
private setupTokenRefresh() {
  const token = this.getToken();
  if (token) {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = decoded.exp * 1000;
    const now = Date.now();
    
    if (expirationTime > now) {
      setTimeout(() => {
        this.logout();
        // Redirect to login
      }, expirationTime - now);
    }
  }
}
```

---

## 💻 Local Development

### Development Commands

```bash
# Start development server
yarn run dev

# Build for production
yarn run build

# Run tests
yarn test

# Lint code
yarn lint
```

### Environment Configuration

Create environment files:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  jwtSecret: 'your-secret-key'
};
```

### API Mock Data

The application includes mock data for development. To connect to real API:

1. Update `SearchResultsService` to use HTTP calls
2. Configure API endpoints in environment files
3. Remove mock data from service methods

---

## 📁 Project Structure

```
src/
├── components/
│   ├── search/
│   │   ├── search.component.ts
│   │   ├── search.component.html
│   │   └── search.component.css
│   └── search-results/
│       ├── search-results.component.ts
│       ├── search-results.component.html
│       └── search-results.component.css
├── services/
│   ├── auth.service.ts
│   └── search-results.service.ts
├── guards/
│   └── auth.guard.ts
├── interceptors/
│   └── jwt.interceptor.ts
├── types/
│   └── search-result.interface.ts
├── environments/
│   └── environment.ts
├── global_styles.css
├── index.html
└── main.ts
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
yarn install
```

#### 2. Angular Material Theme Issues
```bash
# Ensure correct theme import in global_styles.css
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

#### 3. Tailwind CSS Not Working
```bash
# Verify tailwind.config.js content paths
content: ["./src/**/*.{html,ts}"]
```

#### 4. Routing Issues
```bash
# Ensure base href is set in index.html
<base href="/">
```

### Performance Optimization

1. **Lazy Loading**: Implement route-based code splitting
2. **OnPush Strategy**: Use for better change detection
3. **Track By Functions**: For ngFor loops
4. **Service Workers**: For caching and offline support

### Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Angular, Material Design, and Tailwind CSS**
