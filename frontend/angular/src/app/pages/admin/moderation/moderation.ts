import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Flag,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-angular';

import { ModerationService, Report } from '../services/moderation.service';
import { ZardDialogModule } from '@shared/components/zard-ui/dialog/dialog.component';
import { ZardDialogService } from '@shared/components/zard-ui/dialog/dialog.service';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ZardDialogModule, UiCard, TranslateModule],
  templateUrl: './moderation.html',
})
export class Moderation implements OnInit {
  private moderationService = inject(ModerationService);
  private router = inject(Router);
  private dialogService = inject(ZardDialogService);

  reports = signal<Report[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  currentTab = signal<'pending' | 'resolved' | 'dismissed'>('pending');
  currentPage = signal(1);
  limit = 10;

  tabs: { label: string; value: 'pending' | 'resolved' | 'dismissed' }[] = [
    { label: 'DASHBOARD.ADMIN.MODERATION.PENDING', value: 'pending' },
    { label: 'DASHBOARD.ADMIN.MODERATION.RESOLVED', value: 'resolved' },
    { label: 'DASHBOARD.ADMIN.MODERATION.DISMISSED', value: 'dismissed' },
  ];

  icons = { Flag, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, Filter };

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading.set(true);
    const params = {
      page: this.currentPage(),
      limit: this.limit,
      status: this.currentTab(),
      sort: '-createdAt',
    };
    this.moderationService.getReports(params).subscribe({
      next: (res) => {
        this.reports.set(res.data || []);
        this.totalCount.set(res.count || 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: 'pending' | 'resolved' | 'dismissed') {
    this.currentTab.set(tab);
    this.currentPage.set(1);
    this.loadReports();
  }

  nextPage() {
    if (this.reports().length === this.limit) {
      this.currentPage.update((p) => p + 1);
      this.loadReports();
    }
  }
  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadReports();
    }
  }

  /**
   * Action: DISMISS (Approve Content)
   */
  onDismiss(id: string) {
    // Replace browser confirm with Zard Dialog
    this.dialogService.create({
      zTitle: 'Dismiss Report?',
      zDescription:
        'Are you sure you want to dismiss this report? The content will remain visible on the platform.',
      zOkText: 'Yes, Dismiss',
      zCancelText: 'Cancel',
      zWidth: '400px',
      // The Logic moves inside here
      zOnOk: () => {
        this.moderationService.resolveReport(id, { status: 'dismissed' }).subscribe({
          next: () => {
            this.reports.update((list) => list.filter((r) => r._id !== id));
            this.totalCount.update((c) => c - 1);
          },
          error: (err) => console.error('Dismiss failed', err),
        });
      },
    });
  }

  /**
   * Action: REMOVE (Delete Content / Ban User)
   */
  onResolve(report: Report) {
    // 1. Determine Action based on Target Type
    let action: 'ban' | 'delete' | 'hide' = 'delete';

    // Check casing (backend might send User or user)
    const type = report.targetType.toLowerCase();

    if (type === 'user') {
      action = 'ban';
    } else {
      action = 'delete';
    }

    const title = action === 'ban' ? 'Ban User?' : 'Delete Content?';
    const description =
      action === 'ban'
        ? 'This will ban the user and restrict their access. This action cannot be easily undone.'
        : 'This will permanently remove the content from the platform. Are you sure?';

    // 2. Open Dialog
    this.dialogService.create({
      zTitle: title,
      zDescription: description,
      zOkText: action === 'ban' ? 'Ban User' : 'Delete Content',
      zCancelText: 'Cancel',
      zWidth: '400px',
      zOnOk: () => {
        // 3. Build Payload & Send
        const payload = {
          status: 'resolved' as const,
          action: action,
          adminNotes: `Resolved by admin: ${action} action taken.`,
        };

        this.moderationService.resolveReport(report._id, payload).subscribe({
          next: () => {
            this.reports.update((list) => list.filter((r) => r._id !== report._id));
            this.totalCount.update((c) => c - 1);
          },
          error: (err) => console.error('Resolve failed', err),
        });
      },
    });
  }

  /**
   * Action: REVIEW (Navigation)
   */
  onReview(report: Report) {
    if (!report.targetId) return;
    const type = report.targetType.toLowerCase();

    switch (type) {
      case 'user':
        this.router.navigate(['/dashboard/admin/users']);
        break;
      case 'challenge':
      case 'submission':
        this.router.navigate(['/dashboard/admin/challenges']);
        break;
      default:
        console.warn('Unknown target type:', type);
    }
  }

  // ... helper methods
  getItemName(report: Report): string {
    if (!report.targetId) return 'Deleted Content';
    const type = report.targetType.toLowerCase();

    if (type === 'user') return report.targetId.name || 'Unknown User';
    if (type === 'challenge') return report.targetId.title || 'Untitled Challenge';
    if (type === 'submission') return 'Submission Content';
    return 'Unknown Item';
  }
}
