import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, Play, Eye, MessageSquare, Star, ChevronDown } from 'lucide-angular';
import { environment } from 'src/environments/environment';

interface Challenge {
  _id: string;
  title: string;
}

interface Submission {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email: string; // Added email field
    profilePicture?: string;
  };
  challengeId: {
    _id: string;
    title: string;
    category: string;
    difficulty: string;
  };
  videoExplanationUrl?: string; // Made optional as it might not always exist
  aiScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  submissionType: 'link' | 'file' | 'text';
  linkUrl?: string;
  fileUrls?: string[];
  textContent?: string;
  createdAt: string;
}

type SubmissionFilter = 'all' | 'new' | 'shortlisted'; // Removed 'reviewed' filter

@Component({
  selector: 'app-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './submissions.html',
  styleUrls: ['./submissions.css'],
})
export class Submissions implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router); // Inject the Router

  icons = { Play, Eye, MessageSquare, Star, ChevronDown };

  challenges: Challenge[] = [];
  submissions: Submission[] = [];
  selectedChallengeId: string | null = null;

  isLoadingChallenges = false;
  isLoadingSubmissions = false;
  submitError = '';

  activeFilter: SubmissionFilter = 'all';
  filters: SubmissionFilter[] = ['all', 'new', 'shortlisted']; // Updated filters

  openChallengeDropdown = false;

  async ngOnInit() {
    await this.loadChallenges();
  }

  async loadChallenges() {
    try {
      this.isLoadingChallenges = true;
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/challenges/mine`)
      );

      const data = response.data || response;
      this.challenges = Array.isArray(data) ? data : Object.values(data || {});

      if (this.challenges.length > 0) {
        this.selectedChallengeId = this.challenges[0]._id;
        await this.loadSubmissions(this.selectedChallengeId);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      this.submitError = 'Failed to load challenges';
    } finally {
      this.isLoadingChallenges = false;
    }
  }

  async loadSubmissions(challengeId: string) {
    try {
      this.isLoadingSubmissions = true;
      this.submitError = '';

      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/submissions/challenge/${challengeId}`)
      );

      this.submissions = response.data || [];
      console.log('تم جلب البيانات بنجاح:', this.submissions);
    } catch (error: any) {
      console.error('Error:', error);
      this.submitError = error?.error?.message || 'فشل في جلب البيانات';
      this.submissions = [];
    } finally {
      this.isLoadingSubmissions = false;
    }
  }

  // Removed the unnecessary finalAttempt and tryPostBackup methods.

  selectChallenge(challenge: Challenge) {
    this.selectedChallengeId = challenge._id;
    this.openChallengeDropdown = false;
    this.loadSubmissions(challenge._id);
  }

  getSelectedChallenge(): Challenge | undefined {
    return this.challenges.find((c) => c._id === this.selectedChallengeId);
  }

  setFilter(filter: SubmissionFilter): void {
    this.activeFilter = filter;
  }

  get filteredSubmissions(): Submission[] {
    if (this.activeFilter === 'all') {
      return this.submissions;
    }

    const statusMap: Record<string, string> = {
      new: 'pending',
      shortlisted: 'accepted',
      // 'reviewed' (rejected) is no longer a filter option
    };

    const targetStatus = statusMap[this.activeFilter];
    return this.submissions.filter((s) => s.status === targetStatus);
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
      rejected: 'DASHBOARD.SUBMISSIONS.STATUS.REVIEWED', // Keep label for rejected status
    };
    return map[status] || status;
  }

  getCandidateInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getTechnicalQuality(submission: Submission): number {
    return Math.min(Math.floor(submission.aiScore * 0.95), 100);
  }

  getCommunication(submission: Submission): number {
    return Math.min(Math.floor(submission.aiScore * 1.05), 100);
  }

  // Opens the video URL in a new tab
  watchVideo(url: string) {
    window.open(url, '_blank');
  }

  // Navigates to the submission details page
  viewApplication(id: string) {
    this.router.navigate(['/dashboard/company/submission-details', id]);
  }

  // Removed contactCandidate as it's handled directly by the <a> tag in HTML

  async shortlistCandidate(id: string) {
    try {
      await firstValueFrom(
        this.http.put(`${environment.apiUrl}/submissions/${id}/status`, {
          status: 'accepted',
        })
      );

      // Reload submissions
      if (this.selectedChallengeId) {
        await this.loadSubmissions(this.selectedChallengeId);
      }
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
    }
  }
}
