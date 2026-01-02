// src/app/pages/candidate/challenge-details/challenge-details.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  LucideAngularModule,
  BarChart,
  Award,
  Layout,
  Code,
  FileDown,
  Link,
  ChevronRight,
} from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CandidateService } from 'src/app/core/services/candidateService';
import { AuthService } from 'src/app/core/services/auth';
import { ZardDialogService } from '@shared/components/zard-ui/dialog/dialog.service';
import { checkVerification } from '@/core/guards/verification.guard';
// Removed: import { forkJoin } from 'rxjs'; as it's no longer needed

@Component({
  selector: 'app-challenge-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule, RouterModule],
  templateUrl: './challenge-details.html',
})
export class ChallengeDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidateservice = inject(CandidateService);
  private toast = inject(ToastrService);
  private authService = inject(AuthService);
  private dialog = inject(ZardDialogService);

  challengeId: string = '';
  challenge: any = null;
  loading = true;
  isSubmitted = false; // Initialize to false, as we assume the user hasn't started it yet

  readonly icons = {
    BarChart,
    Award,
    Layout,
    Code,
    FileDown,
    Link,
    ChevronRight,
  };

  ngOnInit() {
    this.challengeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.challengeId) {
      this.loadChallenge(); // Only load challenge details
    }
  }

  loadChallenge() {
    this.loading = true;
    this.candidateservice.getChallengeById(this.challengeId).subscribe({
      next: (res) => {
        this.challenge = res.data;
        this.loading = false;
        // isSubmitted remains false as per the assumption that this challenge hasn't been started
      },
      error: (err) => {
        console.error('Error loading challenge details:', err);
        this.toast.error(err.error?.message || 'Failed to load challenge details.');
        this.loading = false;
        // Optionally navigate away if challenge doesn't exist or is inaccessible
        this.router.navigate(['/dashboard/candidate/challenges']);
      },
    });
  }

  handleAction() {
    if (this.isSubmitted) {
      // This path should only be taken *after* a successful startChallenge call
      this.router.navigate(['/dashboard/candidate/mysubmissions']);
    } else {
      this.onStartChallenge();
    }
  }

  private onStartChallenge() {
    const currentUser = this.authService.currentUser();

    if (!checkVerification(currentUser, this.dialog)) {
      console.log('Candidate not verified. Preventing challenge start.');
      return;
    }

    this.candidateservice.startChallenge(this.challengeId).subscribe({
      next: () => {
        this.toast.success('Challenge Started! Good luck.');
        this.isSubmitted = true; // Set to true upon successful start
        this.router.navigate(['/dashboard/candidate/mysubmissions']);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to start challenge');
      },
    });
  }

  downloadFile(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
