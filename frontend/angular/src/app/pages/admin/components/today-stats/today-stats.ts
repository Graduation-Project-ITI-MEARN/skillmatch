import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-todays-stats',
  standalone: true,
  imports: [CommonModule, UiCard, TranslateModule],
  templateUrl: './today-stats.html',
})
export class TodaysStatsComponent implements OnInit {
  private http = inject(HttpClient);

  // FIXED: Added 'revenue' and matched keys to backend response
  stats = signal({
    newUsers: 0,
    newChallenges: 0,
    submissions: 0,
    revenue: 0,
  });

  loading = signal(true);

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/stats/daily`).subscribe({
      next: (res) => {
        // Ensure we handle the response structure correctly
        this.stats.set(res.data || { newUsers: 0, newChallenges: 0, submissions: 0, revenue: 0 });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
