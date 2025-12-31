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
  private dialog = inject(ZardDialogService); // Inject the dialog service

  challengeId: string = '';
  challenge: any = null; // Consider typing this with an interface for better safety
  loading = true;
  isSubmitted = false; // This needs to be set based on if the current user has submissions for this challenge

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
      this.loadChallenge();
      // You would typically also check here if the user has already submitted
      // this challenge to set `isSubmitted` correctly.
      // Example: this.candidateservice.checkSubmissionStatus(this.challengeId).subscribe(status => this.isSubmitted = status);
    }
  }

  loadChallenge() {
    this.loading = true;
    this.candidateservice.getChallengeById(this.challengeId).subscribe({
      next: (res) => {
        this.challenge = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.toast.error('Failed to load challenge details');
        this.loading = false;
        // Optionally navigate away if challenge doesn't exist or is inaccessible
        // this.router.navigate(['/dashboard/candidate/challenges']);
      },
    });
  }

  handleAction() {
    if (this.isSubmitted) {
      this.router.navigate(['/dashboard/candidate/mysubmissions']);
    } else {
      this.onStartChallenge(); // Call the private method
    }
  }

  private onStartChallenge() {
    const currentUser = this.authService.currentUser();

    // --- IMPORTANT CHANGE HERE ---
    // Check verification status before allowing to start the challenge
    if (!checkVerification(currentUser, this.dialog)) {
      console.log('Candidate not verified. Preventing challenge start.');
      // The `checkVerification` function already shows the dialog.
      return; // Stop execution if not verified
    }

    // If verified, proceed to start the challenge
    // Assuming you have a `startChallenge` method in your CandidateService
    this.candidateservice.startChallenge(this.challengeId).subscribe({
      next: () => {
        this.toast.success('Challenge Started! Good luck.');
        // After starting, you might want to mark it as submitted or navigate
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
