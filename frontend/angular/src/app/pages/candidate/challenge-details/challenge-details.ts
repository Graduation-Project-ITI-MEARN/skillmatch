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
  ChevronRight
} from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CandidateService } from 'src/app/core/services/candidateService';

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

  challengeId: string = '';
  challenge: any = null;
  loading = true;
  isSubmitted = false;


  readonly icons = {
    BarChart,
    Award,
    Layout,
    Code,
    FileDown,
    Link,
    ChevronRight
  };

  ngOnInit() {
    this.challengeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.challengeId) {
      this.loadChallenge();
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
      }
    });
  }


  handleAction() {
    if (this.isSubmitted) {

      this.router.navigate(['/dashboard/candidate/portfolio']);
    } else {
      this.onStartChallenge();
    }
  }

  private onStartChallenge() {
    this.candidateservice.getChallengeById(this.challengeId).subscribe({
      next: () => {
        this.toast.success('Challenge Started! Good luck.');

        this.router.navigate(['/dashboard/candidate/portfolio']);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to start challenge');
      }
    });
  }

  downloadFile(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
