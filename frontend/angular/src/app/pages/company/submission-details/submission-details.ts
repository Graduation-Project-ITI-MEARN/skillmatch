import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  Play,
  ExternalLink,
  Mail,
  Check,
  X,
  Star,
  ArrowLeft,
} from 'lucide-angular';
import { environment } from 'src/environments/environment';

// Define the interfaces for the data structure
interface AiEvaluation {
  technicalScore?: number;
  clarityScore?: number;
  communicationScore?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  modelUsed?: string;
  evaluatedAt?: string;
  videoTranscribed?: boolean;
}

interface Candidate {
  _id: string;
  email: string;
  name: string;
  profilePicture?: string;
}

interface Challenge {
  _id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface Submission {
  _id: string;
  aiEvaluation?: AiEvaluation; // Made optional as it might not always exist
  challengeId: Challenge;
  candidateId: Candidate;
  fileUrls: string[];
  aiScore: number;
  isWinner: boolean;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  linkUrl?: string;
  submissionType: 'link' | 'file' | 'text';
  textContent?: string;
  videoExplanationUrl?: string;
  challengeCreator: string;
}

@Component({
  selector: 'app-submission-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule, RouterLink],
  templateUrl: './submission-details.html',
})
export class SubmissionDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  icons = { Play, ExternalLink, Mail, Check, X, Star, ArrowLeft };

  submission: Submission | null = null;
  isLoading = true;
  error: string | null = null;
  submissionId: string | null = null;

  ngOnInit() {
    this.submissionId = this.route.snapshot.paramMap.get('id');
    if (this.submissionId) {
      this.loadSubmissionDetails(this.submissionId);
    } else {
      this.error = 'Submission ID not found in URL.';
      this.isLoading = false;
    }
  }

  async loadSubmissionDetails(id: string) {
    try {
      this.isLoading = true;
      this.error = null;
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/submissions/${id}`) // Assuming API endpoint for single submission
      );

      console.log('Submission details:', response);

      // The backend returns an array of one item, so we take the first one
      if (response.success && response.data) {
        this.submission = response.data;
        console.log('Submission deeds:', this.submission);
      } else {
        this.error = 'Submission not found.';
      }
    } catch (err: any) {
      console.error('Error loading submission details:', err);
      this.error = err?.error?.message || 'Failed to load submission details.';
    } finally {
      this.isLoading = false;
    }
  }

  getCandidateInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Helper to get formatted date
  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Calculate scores based on aiEvaluation (or fallback to aiScore if aiEvaluation is not fully present)
  getTechnicalQuality(submission: Submission): number {
    return (
      submission.aiEvaluation?.technicalScore ||
      Math.min(Math.floor(submission.aiScore * 0.95), 100)
    );
  }

  getClarityScore(submission: Submission): number {
    return submission.aiEvaluation?.clarityScore || 0; // Assuming clarityScore comes directly from aiEvaluation
  }

  getCommunicationScore(submission: Submission): number {
    return (
      submission.aiEvaluation?.communicationScore ||
      Math.min(Math.floor(submission.aiScore * 1.05), 100)
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-green-100 text-green-700 border-green-200',
      accepted: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'DASHBOARD.SUBMISSIONS.STATUS.NEW',
      accepted: 'DASHBOARD.SUBMISSIONS.STATUS.SHORTLISTED',
      rejected: 'DASHBOARD.SUBMISSIONS.STATUS.REVIEWED',
    };
    return map[status] || status;
  }

  watchVideo(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  openLink(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  async shortlistSubmission(id: string) {
    if (!this.submission || this.submission.status === 'accepted') return;
    try {
      await firstValueFrom(
        this.http.put(`${environment.apiUrl}/submissions/${id}/status`, {
          status: 'accepted',
        })
      );
      this.submission.status = 'accepted'; // Update local state
      // Optionally show a success message
    } catch (err) {
      console.error('Error shortlisting submission:', err);
      // Optionally show an error message
    }
  }

  async rejectSubmission(id: string) {
    if (!this.submission || this.submission.status === 'rejected') return;
    try {
      await firstValueFrom(
        this.http.put(`${environment.apiUrl}/submissions/${id}/status`, {
          status: 'rejected',
        })
      );
      this.submission.status = 'rejected'; // Update local state
      // Optionally show a success message
    } catch (err) {
      console.error('Error rejecting submission:', err);
      // Optionally show an error message
    }
  }
}
