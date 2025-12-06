import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Tab {
  label: string;
  route: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}

closeMenu() {
  this.isMenuOpen = false;
}

  userName: string = '';
  userType: string = '';
  pageTitle: string = '';
  pageSubtitle: string = '';
  userInitials: string = '';
  isMenuOpen: boolean = false;

  tabs: Tab[] = [];

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    this.userType = this.authService.type || '';
    this.userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
    this.userInitials = this.getInitials(this.userName);
    this.loadUserDashboard();
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  loadUserDashboard() {
    const type = this.userType.toLowerCase();
    const currentUser = this.authService.currentUser();

    switch (type) {
      case 'candidate':
        this.pageTitle = `Welcome back, ${this.userName}`;
        this.pageSubtitle = "Let's prove your skills today";
        this.tabs = [
          { label: 'Active Challenges', route: '/dashboard/candidate', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['candidate'] },
          { label: 'My Portfolio', route: '/dashboard/candidate/browse', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', roles: ['candidate'] }
        ];
        break;

      case 'company':
        this.pageTitle = currentUser?.companyName || 'Company Dashboard';
        this.pageSubtitle = 'Finding verified talent, faster';
        this.tabs = [
          { label: 'My Challenges', route: '/dashboard/company', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['company'] },
          { label: 'Submissions', route: '/dashboard/company', icon: 'M9 12h6m-6 4h6', roles: ['company'] }
        ];
        break;

      case 'challenger':
        this.pageTitle = 'Challenge Creator Hub';
        this.pageSubtitle = 'Create competitions, discover talent, build community';
        this.tabs = [
          { label: 'Active Challenges', route: '/dashboard/challenger', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['challenger'] },
          { label: 'Create New', route: '/dashboard/challenger/create-bounty', icon: 'M12 4v16m8-8H4', roles: ['challenger'] }
        ];
        break;

      case 'admin':
        this.pageTitle = 'Admin Control Center';
        this.pageSubtitle = 'Platform management and oversight';
        this.tabs = [
          { label: 'Overview', route: '/dashboard/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3', roles: ['admin'] },
          { label: 'User Management', route: '/dashboard/admin/candidates', icon: 'M12 4.354a4 4 0 110 5.292', roles: ['admin'] }
        ];
        break;

      default:
        this.pageTitle = 'Dashboard';
        this.pageSubtitle = 'Welcome';
        this.tabs = [];
    }
  }

  logout() {
    this.authService.logout();
  }
}
