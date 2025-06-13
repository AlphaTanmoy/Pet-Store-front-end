import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Microservice } from '../environment/constants';
import { getApiUrl } from '../environment/endpoints';
import { AuthService } from './auth.service';

export interface NavbarItem {
  id: string;
  menuName: string;
  menuLink: string | null;
  svgFileDataLink: string;
  listOfSubMenu: NavbarItem[];
  doHaveRedirectionLink: boolean;
  isOpen?: boolean; // Optional property for dropdown state
}

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private cachedNavbarItems: NavbarItem[] | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getNavbarItems(): Observable<NavbarItem[]> {
    if (this.cachedNavbarItems) {
      return of(this.cachedNavbarItems);
    }

    const token = this.authService.getToken();
    const headers: { [key: string]: string } = {};
    
    if (token) {
      headers['Alpha'] = `Alpha ${token}`;
    }

    const url = getApiUrl(Microservice.CORE, 'GET_NAVBAR_LIST');
    
    return this.http.get<{
      status: boolean;
      message: string;
      data?: NavbarItem[];
    }>(url, { headers }).pipe(
      map(response => {
        if (response.status && response.data) {
          this.cachedNavbarItems = response.data;
          return response.data;
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }

  clearCache(): void {
    this.cachedNavbarItems = null;
  }
}
