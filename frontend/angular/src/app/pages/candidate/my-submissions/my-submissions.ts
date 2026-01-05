import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CandidateService } from 'src/app/core/services/candidateService';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Clock, CheckCircle, FileUp, X } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { IChallenge } from '@shared/models/challenge.model';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './my-submissions.html',
})
export class MySubmissions implements OnInit {
  private candidateService = inject(CandidateService);
  private toast = inject(ToastrService);
  private router = inject(Router); // Inject Router

  readonly icons = { Clock, CheckCircle, FileUp, X };

  inProgressChallenges: any[] = [];
  completedChallenges: any[] = [];
  showModal = false;
  activeTab: 'file' | 'link' = 'file';
  selectedProjectFile: File | null = null; // Stores the main project file
  selectedVideoFile: File | null = null; // Stores the video explanation file
  selectedSubmissionId: string = '';
  selectedChallenge: Partial<IChallenge> | null = null; // Stores the challenge details for modal logic

  submitForm = new FormGroup({
    solutionUrl: new FormControl(''), // Validators will be set conditionally
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
      },
      error: () => this.toast.error('Failed to load submissions'),
    });
  }

  openSubmitModal(submission: any) {
    this.selectedSubmissionId = submission._id;
    // Ensure selectedChallenge has the full challenge object, including aiConfig
    this.selectedChallenge = submission.challengeId;

    this.showModal = true;
    this.submitForm.reset();
    this.selectedProjectFile = null;
    this.selectedVideoFile = null; // Reset video file selection on modal open

    // Clear existing validators for solutionUrl
    this.submitForm.get('solutionUrl')?.clearValidators();
    this.submitForm.get('solutionUrl')?.updateValueAndValidity();

    console.log('this.selectedChallenge', this.selectedChallenge);
    console.log(
      'Requires Video Transcript:',
      this.selectedChallenge?.aiConfig?.requireVideoTranscript
    );

    // Set active tab and validators based on submissionType
    if (this.selectedChallenge?.submissionType === 'file') {
      this.activeTab = 'file';
    } else if (this.selectedChallenge?.submissionType === 'link') {
      this.activeTab = 'link';
      // Add required validator for solutionUrl if submissionType is link
      this.submitForm
        .get('solutionUrl')
        ?.setValidators([Validators.required, Validators.pattern('https?://.+')]);
      this.submitForm.get('solutionUrl')?.updateValueAndValidity();
    } else {
      // Default to file tab, and allow both if submissionType is 'text' or not specified
      this.activeTab = 'file';
      // No specific validators on solutionUrl needed if both types are allowed and starting on file tab
    }
  }

  // Handles file selection for both project file and video file
  onFileSelected(event: any, type: 'project' | 'video') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'project') {
        this.selectedProjectFile = file;
      } else if (type === 'video') {
        this.selectedVideoFile = file;
      }
    }
  }

  onFinalSubmit() {
    // Basic validation before forming FormData
    if (this.activeTab === 'file' && !this.selectedProjectFile) {
      this.toast.error('Please upload your project file.');
      return;
    }
    if (this.activeTab === 'link' && this.submitForm.get('solutionUrl')?.invalid) {
      this.toast.error('Please provide a valid solution URL.');
      return;
    }

    // CONDITIONAL VALIDATION FOR VIDEO EXPLANATION
    if (this.selectedChallenge?.aiConfig?.requireVideoTranscript && !this.selectedVideoFile) {
      this.toast.error('Please upload your video explanation file.');
      return;
    }

    const formData = new FormData();
    formData.append('submissionId', this.selectedSubmissionId); // Send submissionId here
    formData.append('submissionType', this.activeTab); // This refers to the main challenge submission type

    if (this.activeTab === 'file') {
      if (this.selectedProjectFile) {
        formData.append('file', this.selectedProjectFile); // Append project file under 'file' key (matches Multer field name)
      }
    } else if (this.activeTab === 'link') {
      formData.append('linkUrl', this.submitForm.value.solutionUrl || ''); // Send as linkUrl
    }
    // No 'textContent' handled in this specific form, but if it were, you'd add it here.

    // Append the video explanation file ONLY IF IT WAS REQUIRED AND SELECTED
    if (this.selectedChallenge?.aiConfig?.requireVideoTranscript && this.selectedVideoFile) {
      formData.append('videoExplanationFile', this.selectedVideoFile); // Append video file under 'videoExplanationFile' key
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

  // NEW METHOD: Navigate to submission details page
  viewSubmissionDetails(submissionId: string) {
    this.router.navigate(['/dashboard/candidate/submission-details', submissionId]);
  }
}
