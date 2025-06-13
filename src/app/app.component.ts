import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, Event } from '@angular/router';
import { MessagePopupComponent } from './common-components/message-popup/message-popup.component';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { LoadingService } from './services/loading.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MessagePopupComponent,
    GlobalLoaderComponent
  ],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
      <app-message-popup></app-message-popup>
      <app-global-loader *ngIf="isLoading"></app-global-loader>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f8fafc;
    }
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  title = 'Pet Store';
  isLoading = false;
  
  constructor(
    private router: Router,
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Subscribe to loading state changes
    if (isPlatformBrowser(this.platformId)) {
      this.subscriptions.add(
        this.loadingService.isLoading$.subscribe((loading: boolean) => {
          this.isLoading = loading;
        })
      );
    }
  }
  
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Handle route changes
      this.subscriptions.add(
        this.router.events.pipe(
          filter((event: any): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe(() => {
          // Reset loading and error states on route change
          this.loadingService.reset();
          
          // Scroll to top on route change
          window.scrollTo(0, 0);
        })
      );
      
      // Handle page refresh confirmation
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }
  
  private beforeUnloadHandler = (e: BeforeUnloadEvent) => {
    // Add any cleanup logic here if needed
    // This is intentionally left empty as it's just a placeholder for future cleanup
    console.log('Handling beforeunload event');
    
    // For modern browsers, we just need to set returnValue
    // and call preventDefault()
    e.preventDefault();
    
    // Chrome requires returnValue to be set
    e.returnValue = '';
    
    // For older browsers, return a string to show a custom message
    return '';
  };
  
  // Keep this for backward compatibility
  private handleBeforeUnload = this.beforeUnloadHandler;
  
  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.unsubscribe();
    
    // Remove event listener
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
    
    // Reset loading state
    this.loadingService.reset();
  }
}
