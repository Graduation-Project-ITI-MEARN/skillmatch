import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, Play, Eye, MessageSquare, Star, ChevronDown } from 'lucide-angular';
import { environment } from 'src/environments/environment';

type SubmissionFilter = 'ALL' | 'NEW' | 'REVIEWED' | 'SHORTLISTED';

interface Challenge {
  id: number;
  title: string;
}

interface Submission {
  id: number;
  candidateName: string;
  candidateInitials: string;
  role: string;
  videoUrl: string;
  overallScore: number;
  technicalQuality: number;
  communication: number;
  status: 'NEW' | 'REVIEWED' | 'SHORTLISTED';
}

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

  selectedChallengeId: number | null = null;
  selectedChallenge: Challenge | null = null;
  showDropdown = false;
  submissions: Submission[] = [];
  isLoading = false;
  isLoadingChallenges = false;

  activeFilter: SubmissionFilter = 'ALL';
  filters: SubmissionFilter[] = ['ALL', 'NEW', 'SHORTLISTED', 'REVIEWED'];
  challenges: Challenge[] = [];

  async ngOnInit() {
    await this.loadChallenges();
  }

  // Load challenges
  async loadChallenges() {
    try {
      this.isLoadingChallenges = true;
      const response = await firstValueFrom(
        this.http.get<Challenge[]>(`${environment.apiUrl}/challenges/mine`)
      );

      this.challenges = Array.isArray(response) ? response : Object.values(response || {});
      this.selectedChallengeId = null;
      this.selectedChallenge = null;
    } catch (error) {
      console.error('Error loading challenges', error);
      this.challenges = [];
      this.selectedChallengeId = null;
      this.selectedChallenge = null;
    } finally {
      this.isLoadingChallenges = false;
    }
  }

  async loadSubmissions(challengeId: number) {
    try {
      this.isLoading = true;
      const response = await firstValueFrom(
        this.http.get<Submission[]>(`${environment.apiUrl}/submissions/challenge/${challengeId}`)
      );
      this.submissions = response ?? [];
    } catch (error) {
      console.error('Error loading submissions', error);
      this.submissions = [];
    } finally {
      this.isLoading = false;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectChallenge(challenge: Challenge) {
    this.selectedChallengeId = challenge.id;
    this.selectedChallenge = challenge;
    this.showDropdown = false;
    this.loadSubmissions(challenge.id);
  }

  getSelectedChallenge(): Challenge | undefined {
    return this.challenges.find((c) => c.id === this.selectedChallengeId);
  }

  setFilter(filter: SubmissionFilter): void {
    this.activeFilter = filter;
  }

  get filteredSubmissions(): Submission[] {
    if (this.activeFilter === 'ALL') {
      return this.submissions;
    }
    return this.submissions.filter((s) => s.status?.toUpperCase() === this.activeFilter);
  }

  getStatusClass(status: Submission['status']): string {
    const map: Record<Submission['status'], string> = {
      NEW: 'bg-green-100 text-green-700',
      REVIEWED: 'bg-gray-100 text-gray-700',
      SHORTLISTED: 'bg-blue-100 text-blue-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  watchVideo(url: string) {
    window.open(url, '_blank');
  }

  viewApplication(id: number) {
    console.log('View application', id);
  }

  contactCandidate(id: number) {
    console.log('Contact candidate', id);
  }

  async shortlistCandidate(id: number) {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/submissions/${id}/shortlist`, {}));
      if (this.selectedChallengeId) {
        await this.loadSubmissions(this.selectedChallengeId);
      }
    } catch (error) {
      console.error('Shortlist error', error);
    }
  }
}
