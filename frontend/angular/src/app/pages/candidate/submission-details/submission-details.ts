import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from 'src/app/core/services/candidateService';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import {
  LucideAngularModule,
  Trophy,
  MessageSquareText,
  Lightbulb,
  Zap,
  XCircle,
} from 'lucide-angular'; // Import icons

@Component({
  selector: 'app-candidate-submission-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule],
  templateUrl: './submission-details.html',
})
export class CandidateSubmissionDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private candidateService = inject(CandidateService);
  private toast = inject(ToastrService);

  submissionId: string | null = null;
  submissionDetails: any = null; // Type this more strictly if you have an interface
  isLoading = true;
  hasError = false;

  readonly icons = { Trophy, MessageSquareText, Lightbulb, Zap, XCircle };

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.submissionId = params.get('id');
      if (this.submissionId) {
        this.loadSubmissionDetails(this.submissionId);
      } else {
        this.toast.error('Submission ID not found.');
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  loadSubmissionDetails(id: string) {
    this.isLoading = true;
    this.hasError = false;
    this.candidateService.getSubmissionById(id).subscribe({
      next: (res) => {
        this.submissionDetails = res.data; // Assuming `res.data` contains the submission object
        this.isLoading = false;
        if (!this.submissionDetails || !this.submissionDetails.aiEvaluation) {
          this.toast.info('No AI evaluation available for this submission yet.');
        }
      },
      error: (err) => {
        console.error('Failed to load submission details', err);
        this.toast.error('Failed to load submission details.');
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }
}
