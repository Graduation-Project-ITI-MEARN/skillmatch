import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from 'src/app/core/services/candidateService';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './leaderboard.html',
})
export class Leaderboard implements OnInit {
  private candidateService = inject(CandidateService);

  leaderboard: any[] = [];
  currentUserId: string | null = null;

  activeFilter: 'all' | 'month' | 'week' = 'all';

  ngOnInit(): void {
    this.fetchCurrentUser();
    this.fetchLeaderboard();
  }

  fetchCurrentUser() {
    this.candidateService.getMe().subscribe({
      next: (res) => {
        this.currentUserId = res.data._id;
      },
    });
  }

  fetchLeaderboard() {
    this.candidateService.getLeaderboard().subscribe({
      next: (res) => {
        this.leaderboard = res.data || res;
      },
      error: (err) => console.error('Error fetching leaderboard', err),
    });
  }

  isCurrentUser(userId: string): boolean {
    return this.currentUserId === userId;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
