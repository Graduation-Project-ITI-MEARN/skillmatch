import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChallengerService } from '../challenger.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-challenge-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 lg:p-8">
      <!-- Back Button -->
      <a
        routerLink="/dashboard/challenger"
        class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        {{ 'CHALLENGER.SUBMISSIONS.BACK' | translate }}
      </a>

      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ 'CHALLENGER.SUBMISSIONS.TITLE' | translate }}</h1>
          <p class="text-gray-500">{{ challengeTitle }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="text-center py-12">
        <div
          class="animate-spin w-8 h-8 border-4 border-black-600 border-t-transparent rounded-full mx-auto"
        ></div>
        <p class="mt-4 text-gray-500">{{ 'CHALLENGER.SUBMISSIONS.LOADING' | translate }}</p>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!isLoading && submissions.length === 0"
        class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"
      >
        <div
          class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">{{ 'CHALLENGER.SUBMISSIONS.NO_SUBMISSIONS' | translate }}</h3>
        <p class="text-gray-500">{{ 'CHALLENGER.SUBMISSIONS.NO_SUBMISSIONS_DESC' | translate }}</p>
      </div>

      <!-- Submissions List -->
      <div *ngIf="!isLoading && submissions.length > 0" class="space-y-4">
        <div
          *ngFor="let sub of submissions"
          class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all"
        >
          <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div class="flex gap-4 items-center">
              <div
                class="w-12 h-12 rounded-full bg-primary-gradient text-white flex items-center justify-center font-bold text-lg shadow-sm"
              >
                {{ sub.initials }}
              </div>
              <div>
                <h3 class="font-bold text-lg text-gray-900">{{ sub.name }}</h3>
                <p class="text-gray-500 text-sm">{{ sub.role }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                [ngClass]="getStatusClass(sub.status)"
              >
                {{ 'CHALLENGER.SUBMISSIONS.STATUS.' + sub.status.toUpperCase() | translate }}
              </span>
              <div class="text-right">
                <div class="text-2xl font-black text-gray-900">{{ sub.score }}</div>
                <div class="text-xs text-gray-500 font-bold uppercase">{{ 'CHALLENGER.SUBMISSIONS.AI_SCORE' | translate }}</div>
              </div>
            </div>
          </div>

          <!-- Metrics -->
          <div class="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <div class="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>{{ 'CHALLENGER.SUBMISSIONS.TECHNICAL_QUALITY' | translate }}</span>
                <span>{{ sub.techScore }}%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500" [style.width.%]="sub.techScore"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>{{ 'CHALLENGER.SUBMISSIONS.COMMUNICATION' | translate }}</span>
                <span>{{ sub.commScore }}%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500" [style.width.%]="sub.commScore"></div>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              (click)="watchVideo(sub.videoUrl)"
              class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-bold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {{ 'CHALLENGER.SUBMISSIONS.WATCH_VIDEO' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ChallengeSubmissionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private challengerService = inject(ChallengerService);
  private toastr = inject(ToastrService);

  challengeId: string = '';
  challengeTitle: string = 'Loading...';
  submissions: any[] = [];
  isLoading = false;

  ngOnInit() {
    this.challengeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.challengeId) {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;

    this.challengerService.getChallengeById(this.challengeId).subscribe((res: any) => {
      if (res.data) this.challengeTitle = res.data.title;
    });

    this.challengerService.getSubmissionsByChallenge(this.challengeId).subscribe({
      next: (res: any) => {
        this.submissions = (res.data || []).map((sub: any) => ({
          id: sub._id,
          name: sub.candidateId?.name || 'Unknown Candidate',
          initials: (sub.candidateId?.name || 'U').substring(0, 2).toUpperCase(),
          role: sub.candidateId?.email || 'Candidate',
          score: sub.aiScore || 0,
          status: sub.status || 'NEW',
          videoUrl: sub.videoExplanationUrl,
          techScore: Math.round((sub.aiScore || 0) * 0.9),
          commScore: Math.round((sub.aiScore || 0) * 1.1 > 100 ? 100 : (sub.aiScore || 0) * 1.1),
        }));
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load submissions');
        this.isLoading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  watchVideo(url: string) {
    if (url) window.open(url, '_blank');
    else this.toastr.warning('No video URL provided');
  }
}
