import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CandidateService } from 'src/app/core/services/candidateService';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Clock, CheckCircle, FileUp, X } from 'lucide-angular';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './my-submissions.html',
})
export class MySubmissions implements OnInit {
  private candidateService = inject(CandidateService);
  private toast = inject(ToastrService);

  readonly icons = { Clock, CheckCircle, FileUp, X };

  inProgressChallenges: any[] = [];
  completedChallenges: any[] = [];
  showModal = false;
  activeTab: 'file' | 'link' = 'file';
  selectedFile: File | null = null;
  selectedSubmissionId: string = '';

  submitForm = new FormGroup({
    solutionUrl: new FormControl(''),
    videoUrl: new FormControl('', [Validators.required, Validators.pattern('https?://.+')]),
  });

  ngOnInit() {
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.candidateService.getMySubmissions().subscribe({
      next: (res) => {
        const data = res.data || [];
        this.inProgressChallenges = data.startedChallenges;
        this.completedChallenges = data.activeSubmissions;
        console.log(this.completedChallenges);
      },
      error: () => this.toast.error('Failed to load submissions'),
    });
  }

  openSubmitModal(submission: any) {
    this.selectedSubmissionId = submission._id;
    this.showModal = true;
    this.submitForm.reset();
    this.selectedFile = null;
    this.activeTab = 'file';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onFinalSubmit() {
    const formData = new FormData();
    formData.append('submissionId', this.selectedSubmissionId);
    formData.append('submissionType', this.activeTab);
    formData.append('videoExplanationUrl', this.submitForm.value.videoUrl || '');

    if (this.activeTab === 'file') {
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }
    } else {
      formData.append('solutionUrl', this.submitForm.value.solutionUrl || '');
    }

    this.candidateService.submitFinalSolution(formData).subscribe({
      next: () => {
        this.toast.success('Solution submitted successfully!');
        this.showModal = false;
        this.loadSubmissions();
      },
      error: (err) => this.toast.error(err.error?.message || 'Submission failed'),
    });
  }
}
