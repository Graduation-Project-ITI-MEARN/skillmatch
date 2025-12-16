import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';
import { ActivityLog, ActivityService } from 'src/app/core/services/activity';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, UiCard],
  templateUrl: './recent-activity.html',
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #e5e7eb;
        border-radius: 20px;
      }
    `,
  ],
})
export class RecentActivityComponent implements OnInit {
  private activityService = inject(ActivityService);

  activities = signal<ActivityLog[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.activityService.getRecentActivity().subscribe({
      next: (data) => {
        this.activities.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load activity', err);
        this.loading.set(false);
      },
    });
  }
}
