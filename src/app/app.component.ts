import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { MessagePopupComponent } from './common-components/message-popup/message-popup.component';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { LoadingService } from './services/loading.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MessagePopupComponent,
    GlobalLoaderComponent
  ],
  template: `
    <router-outlet></router-outlet>
    <app-message-popup></app-message-popup>
    <app-global-loader></app-global-loader>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Pet Store';
  
  constructor(
    private router: Router,
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Handle route changes
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        // Reset loading and error states on route change
        this.loadingService.reset();
        
        // Scroll to top on route change
        window.scrollTo(0, 0);
      });
      
      // Handle page refresh confirmation
      window.addEventListener('beforeunload', (e) => {
        // Add any cleanup logic here if needed
      });
    }
  }
}
