import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChallengerService } from './challenger.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-challenger-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './challenger-dashboard.component.html',
  styleUrls: ['./challenger-dashboard.component.scss'],
})
export class ChallengerDashboardComponent implements OnInit {
  private challengerService = inject(ChallengerService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  activeTab: 'active' | 'completed' | 'create' | 'analytics' = 'active';
  isLoading = false;

  stats: any = {};
  wallet: any = {};
  challenges: any[] = [];
  topCandidates: any[] = [];

  hiringStats: any = {};
  performanceData: any[] = [];

  createForm: FormGroup;

  // Updated categories to match your Backend's allowed list
  categories = [
    { name: 'Development', icon: 'code' },
    { name: 'Design', icon: 'pen-tool' },
    { name: 'Marketing', icon: 'trending-up' },
    { name: 'Writing', icon: 'file-text' },
    { name: 'Translation', icon: 'file-text' },
    { name: 'Data Entry', icon: 'file-text' },
  ];

  constructor() {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['Development', Validators.required],
      difficulty: ['medium', Validators.required],
      duration: [7, [Validators.required, Validators.min(1), Validators.max(60)]],
      type: ['prize', Validators.required],
      prizeAmount: [null, [Validators.required, Validators.min(100)]],
      skills: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadWallet();
    this.loadLeaderboard();
    this.loadActiveChallenges();
  }

  trackByName(index: number, item: any): string {
    return item.name;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.createForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  getDaysLeft(deadlineInput: string | Date | undefined): string {
    if (!deadlineInput) return 'No Deadline';

    const deadline = new Date(deadlineInput);
    if (isNaN(deadline.getTime())) return 'Invalid Date';

    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();

    if (diffTime < 0) return 'Ended';

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Ends Today';
    if (diffDays === 1) return '1 Day Left';

    return `${diffDays} Days Left`;
  }

  switchTab(tab: 'active' | 'completed' | 'create' | 'analytics') {
  this.activeTab = tab;
  if (tab === 'active') this.loadActiveChallenges();
  if (tab === 'completed') this.loadCompletedChallenges();
  if (tab === 'analytics') this.loadAnalyticsData(); // استدعاء الدالة الجديدة
}

  loadStats() {
    this.challengerService.getStats().subscribe({
      next: (res: any) => {
        this.stats = res.stats || {};
      },
      error: (err) => console.error('Failed to load stats', err),
    });
  }

  loadWallet() {
    this.challengerService.getWallet().subscribe({
      next: (res: any) => {
        this.wallet = res.data || {};
      },
      error: (err) => console.error('Failed to load wallet', err),
    });
  }

  loadLeaderboard() {
    this.challengerService.getLeaderboard().subscribe({
      next: (res: any) => {
        this.topCandidates = res.data || [];
      },
      error: (err) => console.error('Failed to load leaderboard', err),
    });
  }

  loadActiveChallenges() {
    this.isLoading = true;
    this.challengerService.getMyChallenges('published').subscribe({
      next: (res: any) => {
        this.challenges = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.challenges = [];
      },
    });
  }

  loadCompletedChallenges() {
    this.isLoading = true;
    this.challengerService.getMyChallenges('closed').subscribe({
      next: (res: any) => {
        this.challenges = res.data || [];
        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;
        this.challenges = [];
      },
    });
  }

  onSubmitChallenge() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toastr.warning('Please fix the errors in the form.');
      return;
    }

    this.isLoading = true;
    const formData = this.createForm.value;
    const skillsArray = formData.skills
      ? formData.skills.split(',').map((s: string) => s.trim())
      : [];

    // --- FIX: ROBUST DEADLINE CALCULATION ---
    const daysToAdd = Number(formData.duration); // Ensure it's a number
    const safeDays = !isNaN(daysToAdd) && daysToAdd > 0 ? daysToAdd : 7; // Fallback to 7 if invalid

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + safeDays);
    // ----------------------------------------

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      type: formData.type,
      prizeAmount: Number(formData.prizeAmount),
      skills: skillsArray,

      // Both keys to ensure backend catches one of them
      deadline: deadlineDate.toISOString(),

      currency: 'EGP',
      status: 'published',
      tags: skillsArray, // Sending as tags too, just in case backend expects that
    };

    console.log('🚀 Final Payload:', payload);

    this.challengerService.createChallenge(payload).subscribe({
      next: () => {
        this.toastr.success('Challenge Published Successfully!');
        this.createForm.reset({
          category: 'Development',
          difficulty: 'medium',
          type: 'prize',
          duration: 7,
        });
        this.switchTab('active');
        this.loadStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Backend Error:', err);
        this.toastr.error(
          err.error?.message || 'Failed to create challenge. Backend rejected data.'
        );
        this.isLoading = false;
      },
    });
  }


loadAnalyticsData() {
  this.challengerService.getHiringAnalytics().subscribe(res => {
    this.hiringStats = res.data;
  });

  this.challengerService.getJobPerformance().subscribe(res => {
    this.performanceData = res.data;
  });
}
}
