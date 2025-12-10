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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  userName: string = '';
  userType: string = '';
  pageTitle: string = '';
  pageSubtitle: string = '';
  userInitials: string = '';
  isMenuOpen: boolean = false;

  tabs: Tab[] = [];

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUserData: any = null;

  ngOnInit() {
    // Get user data from API
    this.currentUserData = this.authService.currentUser();
    this.userType = this.authService.type || '';
    this.userName = this.currentUserData?.name || this.currentUserData?.email?.split('@')[0] || 'User';

    // Generate initials
    this.userInitials = this.getInitials(this.userName);

    this.loadUserDashboard();
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  loadUserDashboard() {
    const type = this.userType.toLowerCase();

    switch (type) {
      case 'candidate':
        this.pageTitle = `Welcome back, ${this.userName}`;
        this.pageSubtitle = "Let's prove your skills today";
        this.tabs = [
          { label: 'Active Challenges', route: '/dashboard/candidate', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['candidate'] },
          { label: 'My Portfolio', route: '/dashboard/candidate/browse', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', roles: ['candidate'] },
          { label: 'AI Coach', route: '/dashboard/candidate', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', roles: ['candidate'] },
          { label: 'Leaderboard', route: '/dashboard/candidate', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['candidate'] }
        ];
        break;

      case 'company':
        this.pageTitle = this.currentUserData?.companyName || 'Company Dashboard';
        this.pageSubtitle = 'Finding verified talent, faster';
        this.tabs = [
          { label: 'My Challenges', route: '/dashboard/company', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['company'] },
          { label: 'Submissions', route: '/dashboard/company', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['company'] },
          { label: 'Talent Pool', route: '/dashboard/company', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['company'] },
          { label: 'Analytics', route: '/dashboard/company', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['company'] }
        ];
        break;

      case 'challenger':
        this.pageTitle = 'Challenge Creator Hub';
        this.pageSubtitle = 'Create competitions, discover talent, build community';
        this.tabs = [
          { label: 'Active Challenges', route: '/dashboard/challenger', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['challenger'] },
          { label: 'Completed', route: '/dashboard/challenger', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['challenger'] },
          { label: 'Create New', route: '/dashboard/challenger/create-bounty', icon: 'M12 4v16m8-8H4', roles: ['challenger'] }
        ];
        break;

      case 'admin':
        this.pageTitle = 'Admin Control Center';
        this.pageSubtitle = 'Platform management and oversight';
        this.tabs = [
          { label: 'Overview', route: '/dashboard/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['admin'] },
          { label: 'User Management', route: '/dashboard/admin/candidates', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['admin'] },
          { label: 'Challenges', route: '/dashboard/admin', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: ['admin'] },
          { label: 'Moderation', route: '/dashboard/admin', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', roles: ['admin'] },
          { label: 'Analytics', route: '/dashboard/admin', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['admin'] }
        ];
        break;

      default:
        this.pageTitle = 'Dashboard';
        this.pageSubtitle = 'Welcome';
        this.tabs = [];
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}
