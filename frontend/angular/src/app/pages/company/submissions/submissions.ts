import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  Play,
  Eye,
  MessageSquare,
  Star,
  ChevronDown,
} from 'lucide-angular';
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
    profilePicture?: string;
  };
  challengeId: {
    _id: string;
    title: string;
    category: string;
    difficulty: string;
  };
  videoExplanationUrl: string;
  aiScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  submissionType: 'link' | 'file' | 'text';
  linkUrl?: string;
  fileUrls?: string[];
  textContent?: string;
  createdAt: string;
}

type SubmissionFilter = 'all' | 'new' | 'reviewed' | 'shortlisted';

@Component({
  selector: 'app-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './submissions.html',
  styleUrls: ['./submissions.css'],
})
export class Submissions implements OnInit {
  private http = inject(HttpClient);

  icons = { Play, Eye, MessageSquare, Star, ChevronDown };

  challenges: Challenge[] = [];
  submissions: Submission[] = [];
  selectedChallengeId: string | null = null;

  isLoadingChallenges = false;
  isLoadingSubmissions = false;
  submitError = '';

  activeFilter: SubmissionFilter = 'all';
  filters: SubmissionFilter[] = ['all', 'new', 'reviewed', 'shortlisted'];

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

    // الرابط المباشر بدون أي params وهمية
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

// محاولة أخيرة للمسار البديل بـ Params
async finalAttempt(challengeId: string) {
    try {
        const response: any = await firstValueFrom(
            this.http.get(`${environment.apiUrl}/submissions/challenge/${challengeId}`, {
                params: {
                  challengeId,
                  candidateId: challengeId,
                  submissionType: 'text',
                  videoExplanationUrl: 'https://placeholder.com'
                }
            })
        );
        this.submissions = response.data || [];
        this.submitError = '';
    } catch (e) {
        this.submitError = 'Backend Error: Please check if the Route is GET /api/challenges/:id/submissions';
    }
}
// دالة احتياطية في حال فشل الـ GET بسبب قيود الـ Validation في الباك إند
async tryPostBackup(challengeId: string) {
    try {
        const response: any = await firstValueFrom(
            this.http.post(`${environment.apiUrl}/submissions/challenge/${challengeId}`, {})
        );
        this.submissions = response.data || [];
        this.submitError = '';
    } catch (e) {
        this.submitError = 'Validation Error: Backend requires a body or specific structure.';
    }
}

  selectChallenge(challenge: Challenge) {
    this.selectedChallengeId = challenge._id;
    this.openChallengeDropdown = false;
    this.loadSubmissions(challenge._id);
  }

  getSelectedChallenge(): Challenge | undefined {
    return this.challenges.find(c => c._id === this.selectedChallengeId);
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
      reviewed: 'rejected',
      shortlisted: 'accepted',
    };

    const targetStatus = statusMap[this.activeFilter];
    return this.submissions.filter(s => s.status === targetStatus);
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

  getCandidateInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Calculate scores (mock - in real app this would come from AI)
  getTechnicalQuality(submission: Submission): number {
    return Math.min(Math.floor(submission.aiScore * 0.95), 100);
  }

  getCommunication(submission: Submission): number {
    return Math.min(Math.floor(submission.aiScore * 1.05), 100);
  }

  watchVideo(url: string) {
    window.open(url, '_blank');
  }

  viewApplication(id: string) {
    console.log('View application:', id);
    // TODO: Navigate to detail page
  }

  contactCandidate(id: string) {
    console.log('Contact candidate:', id);
    // TODO: Open contact modal
  }

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
