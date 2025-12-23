import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Zap, Users, DollarSign, Star } from 'lucide-angular';

import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';
import { NotificationsDropdownComponent } from '@shared/components/notifications-dropdown/notifications-dropdown.component';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-challenger-shell',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    LucideAngularModule,
    TranslateModule,
    RouterModule,
    NotificationsDropdownComponent,
  ],
  templateUrl: './challenger-layout.html',
})
export class ChallengerShellComponent implements OnInit {
  private theme = inject(ThemeService);
  private authService = inject(AuthService);

  name = 'Loading...';
  initials = '..';

  icons = { Zap, Users, DollarSign, Star };

  // 👇 FIX 1: Clean Tabs.
  // If the Dashboard handles navigation internally, we only need a link to get back to "Overview".
  tabs: DashboardTab[] = [
    {
      labelKey: 'DASHBOARD.TABS.OVERVIEW',
      route: '/dashboard/challenger/overview',
      icon: Zap,
    },
    // Removed "Submissions", "New Bounty", "Completed" to avoid duplication
  ];

  // 👇 FIX 2: Empty Stats.
  // We remove the data here so the Parent doesn't render a second grid of cards.
  stats: any[] = [];

  ngOnInit() {
    this.theme.setTheme('challenger');

    this.authService.verifyUser().subscribe({
      next: (user: any) => {
        if (user && user.name) {
          this.name = user.name;
          this.initials = user.name
            .split(' ')
            .map((n: string) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        } else {
          this.name = 'Challenger';
          this.initials = 'CH';
        }
      },
      error: () => {
        this.name = 'Challenger';
        this.initials = 'CH';
      },
    });
  }
}
