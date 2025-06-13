import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, OnDestroy {
  @Input() color: string = '#4f46e5'; // Default indigo-600
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() speed: 'slow' | 'normal' | 'fast' = 'normal';
  @Input() showError: boolean = false;
  @Input() errorMessage: string = 'The Server is down, It will be back soon..';
  @Output() retry = new EventEmitter<void>();
  
  showRetry = false;

  paws: { active: boolean; size: number }[] = [
    { active: false, size: 1 },
    { active: false, size: 1 },
    { active: false, size: 1 }
  ];

  private animationInterval: any;
  private speedMap = {
    slow: 500,
    normal: 300,
    fast: 150
  };

  get loaderClasses() {
    return {
      'loader-sm': this.size === 'sm',
      'loader-md': this.size === 'md',
      'loader-lg': this.size === 'lg'
    };
  }

  ngOnInit() {
    if (this.showError) {
      return;
    }
    
    let index = 0;
    const speed = this.speedMap[this.speed];

    this.animationInterval = setInterval(() => {
      // Animate paws with smooth transitions
      this.paws.forEach((paw, i) => {
        if (i === index) {
          // Current active paw
          paw.active = true;
          paw.size = 1.3;
        } else if (i === (index - 1 + this.paws.length) % this.paws.length) {
          // Previous paw - slightly smaller
          paw.active = false;
          paw.size = 1.1;
        } else if (i === (index - 2 + this.paws.length) % this.paws.length) {
          // Two paws back - reset to default
          paw.active = false;
          paw.size = 1;
        }
      });

      index = (index + 1) % this.paws.length;
    }, speed);
  }

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  onRetry() {
    this.showRetry = false;
    this.retry.emit();
  }
}