import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarService, NavbarItem } from '../../services/navbar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  menuItems: NavbarItem[] = [];
  isSidebarOpen = false;

  constructor(
    private router: Router,
    private navbarService: NavbarService
  ) {}

  ngOnInit(): void {
    this.loadNavbarItems();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private loadNavbarItems(): void {
    this.navbarService.getNavbarItems().subscribe(items => {
      this.menuItems = items;
    });
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  toggleSubMenu(event: Event, item: NavbarItem): void {
    if (!item.doHaveRedirectionLink && item.listOfSubMenu.length > 0) {
      event.preventDefault();
      item['isOpen'] = !item['isOpen'];
    }
  }
}
