import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MessagePopupComponent } from './common-components/message-popup/message-popup.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, MessagePopupComponent],
    template: `
      <router-outlet></router-outlet>
      <app-message-popup></app-message-popup>
    `,
    styles: []
})
export class AppComponent {
  title = 'bootstraptoangular19';
}
