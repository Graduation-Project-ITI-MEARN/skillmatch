import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Trophy,
  Users,
  DollarSign,
  Activity,
  Eye,
  Settings,
} from 'lucide-angular';
import { ChallengesService, Challenge } from '../services/challenges.service';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-challenges',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, TranslateModule],
  templateUrl: './challenges.html',
})
export class Challenges implements OnInit {
  private challengeService = inject(ChallengesService);

  // Data State
  allChallenges = signal<Challenge[]>([]);
  loading = signal(true);

  // Tabs Mapping
  // Key = UI Label, Value = Backend Status
  tabs = [
    { label: 'DASHBOARD.ADMIN.CHALLENGES.ALL', value: 'all' },
    { label: 'DASHBOARD.ADMIN.CHALLENGES.ACTIVE', value: 'published' },
    { label: 'DASHBOARD.ADMIN.CHALLENGES.PENDING', value: 'draft' },
    { label: 'DASHBOARD.ADMIN.CHALLENGES.COMPLETED', value: 'closed' },
  ];

  currentTab = signal<string>('all');

  // Computed: Filter logic on Frontend
  filteredChallenges = computed(() => {
    const tab = this.currentTab();
    const challenges = this.allChallenges();

    if (tab === 'all') return challenges;
    return challenges.filter((c) => c.status === tab);
  });

  icons = { Trophy, Users, DollarSign, Activity, Eye, Settings };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.challengeService.getAllChallenges().subscribe({
      next: (data) => {
        this.allChallenges.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(val: string) {
    this.currentTab.set(val);
  }
}
