import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  LucideAngularModule,
  Shield,
  Users,
  Flag,
  DollarSign,
  Activity,
  Settings,
  LayoutGrid,
  Bell,
  Trophy,
  AlertCircle,
} from 'lucide-angular';

// Layout & UI Components
import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ZardDropdownModule } from '@shared/components/zard-ui/dropdown/dropdown.module'; // Import Zard Dropdown

// Services
import { ThemeService } from 'src/app/core/services/theme';
import { AdminService } from '../services/admin.service';
import { NotificationsDropdownComponent } from '@shared/components/notifications-dropdown/notifications-dropdown.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    LucideAngularModule,
    DashboardLayoutComponent,
    ZardStatComponent,
    ZardDropdownModule,
    NotificationsDropdownComponent,
  ],
  templateUrl: './admin-layout.html',
})
export class AdminShellComponent implements OnInit {
  private theme = inject(ThemeService);
  private adminService = inject(AdminService);

  avatarIcon = Shield;
  stats = signal<any[]>([]);
  notifications = signal<any[]>([]);
  unreadCount = signal(0);

  // Data Signals
  icons = { Users, DollarSign, Flag, Activity, Bell };

  tabs: DashboardTab[] = [
    { labelKey: 'DASHBOARD.TABS.OVERVIEW', route: '/dashboard/admin/overview', icon: LayoutGrid },
    { labelKey: 'DASHBOARD.TABS.USERS', route: '/dashboard/admin/users', icon: Users },
    { labelKey: 'DASHBOARD.TABS.MODERATION', route: '/dashboard/admin/moderation', icon: Flag },
    { labelKey: 'DASHBOARD.TABS.SETTINGS', route: '/dashboard/admin/settings', icon: Settings },
  ];

  ngOnInit() {
    this.theme.setTheme('admin');
    this.loadData();
  }

  loadData() {
    // 2. Fetch Stats
    this.adminService.getStats().subscribe({
      next: (data) => {
        // Safe check: Ensure data exists before mapping
        if (!data) return;

        this.stats.set([
          {
            labelKey: 'DASHBOARD.STATS.TOTAL_USERS',
            value: data.totalUsers?.toLocaleString() || '0',
            trend: 'Total Registered',
            icon: Users,
            trendColor: 'info',
          },
          {
            labelKey: 'DASHBOARD.STATS.ACTIVE_CHALLENGES',
            value: data.activeChallenges?.toString() || '0',
            trend: 'Active Challenges',
            icon: Trophy,
            trendColor: 'success',
          },
          {
            labelKey: 'DASHBOARD.STATS.REVENUE',
            value: `$${data.revenue?.toLocaleString() || '0'}`,
            trend: 'Total Revenue',
            icon: DollarSign,
            trendColor: 'success',
          },
          {
            labelKey: 'DASHBOARD.STATS.REVIEWS',
            value: data.pendingReviews?.toString() || '0',
            trend: 'Requires Attention',
            icon: AlertCircle,
            trendColor: 'danger',
          },
        ]);
      },
      error: (err) => console.error('Failed to load stats', err),
    });

    // 3. Fetch Notifications (The cause of the 'filter' error)
    this.adminService.getNotifications().subscribe({
      next: (data) => {
        // CRITICAL FIX: Check if data is actually an array
        if (Array.isArray(data)) {
          this.notifications.set(data);
          this.unreadCount.set(data.filter((n: any) => !n.read).length);
        } else {
          console.warn('Notifications API returned non-array:', data);
          this.notifications.set([]);
          this.unreadCount.set(0);
        }
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        this.notifications.set([]); // Fallback to empty
      },
    });
  }

  // Notification Actions
  onMarkAllRead() {
    this.adminService.markAllRead().subscribe(() => {
      this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
      this.unreadCount.set(0);
    });
  }

  onReadOne(id: string) {
    this.adminService.markRead(id).subscribe(() => {
      this.notifications.update((list) =>
        list.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      this.unreadCount.update((c) => Math.max(0, c - 1));
    });
  }
}
