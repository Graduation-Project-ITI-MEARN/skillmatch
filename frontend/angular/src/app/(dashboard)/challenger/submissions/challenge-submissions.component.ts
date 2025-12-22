import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChallengerService } from '../challenger.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-challenge-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './challenge-submissions.component.html',
  styles: [
    `
      /* Reused Styles */
      .bg-linear-to-br {
        background: linear-gradient(to bottom right, var(--tw-gradient-stops));
      }
      .from-blue-500 {
        --tw-gradient-from: #3b82f6;
      }
      .to-purple-500 {
        --tw-gradient-to: #a855f7;
      }
    `,
  ],
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

    // 1. Get Challenge Details (for Title)
    this.challengerService.getChallengeById(this.challengeId).subscribe((res: any) => {
      if (res.data) this.challengeTitle = res.data.title;
    });

    // 2. Get Submissions
    this.challengerService.getSubmissionsByChallenge(this.challengeId).subscribe({
      next: (res: any) => {
        // Map Backend Data to UI format
        this.submissions = (res.data || []).map((sub: any) => ({
          id: sub._id,
          name: sub.candidateId?.name || 'Unknown Candidate',
          initials: (sub.candidateId?.name || 'U').substring(0, 2).toUpperCase(),
          role: sub.candidateId?.email || 'Candidate',
          score: sub.aiScore || 0,
          status: sub.status || 'NEW',
          videoUrl: sub.videoExplanationUrl,
          // Mocking breakdown scores if backend doesn't provide them yet
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
        return 'bg-blue-100 text-blue-700'; // NEW/PENDING
    }
  }

  watchVideo(url: string) {
    if (url) window.open(url, '_blank');
    else this.toastr.warning('No video URL provided');
  }
}
