import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CandidateService } from 'src/app/core/services/candidateService';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './portfolio.html',
})
export class Portfolio implements OnInit {
  private candidateService = inject(CandidateService);
  private toast = inject(ToastrService);

  inProgressChallenges: any[] = [];
  completedChallenges: any[] = [];
  showModal = false;
  selectedSubmissionId: string = '';

  // فورم التسليم
  submitForm = new FormGroup({
    solutionUrl: new FormControl('', [Validators.required]),
    videoUrl: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.candidateService.getMySubmissions().subscribe({
      next: (res) => {
        console.log("daaaaa" ,res)
        this.inProgressChallenges = res.data.filter((s: any) => !s.aiScore);
        this.completedChallenges = res.data.filter((s: any) => s.aiScore);
      },
      error: () => this.toast.error('Failed to load submissions')
    });
  }

  openSubmitModal(submission: any) {
    this.selectedSubmissionId = submission._id;
    this.showModal = true;
  }

  onFinalSubmit() {
    if (this.submitForm.valid) {
      const data = {
        submissionId: this.selectedSubmissionId,
        ...this.submitForm.value
      };

      this.candidateService.submitFinalSolution(data).subscribe({
        next: () => {
          this.toast.success('Solution submitted successfully!');
          this.showModal = false;
          this.submitForm.reset();
          this.loadSubmissions();
        },
        error: () => {
          console.log("we have error")
        }
      });
    }
  }
}
