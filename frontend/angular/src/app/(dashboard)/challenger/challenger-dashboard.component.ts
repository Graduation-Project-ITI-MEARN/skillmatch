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
  // Dependency Injection using inject()
  private challengerService = inject(ChallengerService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  // State Variables
  activeTab: 'active' | 'completed' | 'create' = 'active';
  isLoading = false;

  // Data Containers
  stats: any = {};
  wallet: any = {};
  challenges: any[] = [];
  topCandidates: any[] = [];

  // Form Group
  createForm: FormGroup;

  // Categories Data with Icons
  categories = [
    { name: 'Coding', icon: 'code' },
    { name: 'Design', icon: 'pen-tool' },
    { name: 'Marketing', icon: 'trending-up' },
    { name: 'Video', icon: 'video' },
    { name: 'Writing', icon: 'file-text' },
  ];

  constructor() {
    // Initialize Form with Validators
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['Coding', Validators.required],
      difficulty: ['medium', Validators.required],
      duration: [7, [Validators.required, Validators.min(1), Validators.max(60)]], // Default 7 days
      type: ['prize', Validators.required],
      prizeAmount: [null, [Validators.required, Validators.min(100)]], // Minimum 100 EGP
      skills: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadWallet();
    this.loadLeaderboard();
    this.loadActiveChallenges();
  }

  // --- Performance Helper ---
  trackByName(index: number, item: any): string {
    return item.name;
  }

  // --- UI Helper Methods ---

  isFieldInvalid(field: string): boolean {
    const control = this.createForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  getDaysLeft(deadlineInput: string | Date | undefined): string {
    // 1. Handle missing date
    if (!deadlineInput) return 'No Deadline';

    // 2. Parse Date safely
    const deadline = new Date(deadlineInput);
    if (isNaN(deadline.getTime())) return 'Invalid Date';

    // 3. Calculate Difference
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();

    // 4. Handle "Ended" case immediately
    if (diffTime < 0) return 'Ended';

    // 5. Convert to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Ends Today';
    if (diffDays === 1) return '1 Day Left';

    return `${diffDays} Days Left`;
  }

  switchTab(tab: 'active' | 'completed' | 'create') {
    this.activeTab = tab;
    if (tab === 'active') this.loadActiveChallenges();
    if (tab === 'completed') this.loadCompletedChallenges();
  }

  // --- Data Loading Methods ---

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

  // --- Form Submission ---

  onSubmitChallenge() {
    // 1. Validation Check
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toastr.warning('Please fix the errors in the form.');
      return;
    }

    this.isLoading = true;
    const formData = this.createForm.value;

    // 2. Prepare Payload
    // Convert comma-separated string to array
    const skillsArray = formData.skills.split(',').map((s: string) => s.trim());

    // Calculate Deadline Date based on Duration (Days)
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + formData.duration);

    const payload = {
      ...formData,
      skills: skillsArray,
      deadline: deadlineDate, // Send calculated Date object
      currency: 'EGP',
      status: 'published',
    };

    // 3. API Call
    this.challengerService.createChallenge(payload).subscribe({
      next: () => {
        this.toastr.success('Challenge Published Successfully!');

        // Reset form to default state
        this.createForm.reset({
          category: 'Coding',
          difficulty: 'medium',
          type: 'prize',
          duration: 7,
        });

        // Refresh data and switch view
        this.switchTab('active');
        this.loadStats();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to create challenge');
        this.isLoading = false;
      },
    });
  }
}
