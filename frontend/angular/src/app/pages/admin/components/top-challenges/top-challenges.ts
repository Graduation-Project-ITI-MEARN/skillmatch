import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';
import {
  LucideAngularModule,
  Trophy,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from 'lucide-angular';
import { ChallengesService, TopChallenge } from '../../services/challenges.service';

@Component({
  selector: 'app-top-challenges',
  standalone: true,
  imports: [CommonModule, UiCard, LucideAngularModule],
  templateUrl: './top-challenges.html',
})
export class TopChallengesComponent implements OnInit {
  private challengeService = inject(ChallengesService);

  challenges = signal<TopChallenge[]>([]);
  loading = signal(true);

  icons = { Trophy, TrendingUp, Users, DollarSign, Activity };

  ngOnInit() {
    this.challengeService.getTopChallenges().subscribe({
      next: (data) => {
        this.challenges.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        console.error('Failed to load top challenges', e);
        this.loading.set(false);
      },
    });
  }
}
