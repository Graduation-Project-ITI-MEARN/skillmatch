import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from 'src/app/core/services/candidateService';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators'; // Import map operator

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './portfolio.html',
})
export class PortfolioComponent implements OnInit {
  private candidateService = inject(CandidateService);
  submissions: any[] = [];
  skillsAnalysis: any;
  totalCompletedChallenges: number = 0;
  overallAverageScore: number = 0;
  topSkills: string[] = [];

  ngOnInit(): void {
    this.fetchSkillsAnalysis();
    this.fetchSubmissions();
  }

  fetchSkillsAnalysis() {
    this.candidateService.getSkillsAnalysis().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skillsAnalysis = res.data;
          this.totalCompletedChallenges = res.data.totalSubmissions || 0;
          this.overallAverageScore = res.data.averageScore || 0;
          this.topSkills = res.data.strongestSkills?.map((s: any) => s.skill) || [];
        }
      },
      error: (err) => console.error('Error fetching skills analysis', err),
    });
  }

  fetchSubmissions() {
    this.candidateService.getMySubmissions().subscribe({
      next: (res) => {
        // Filter submissions to only include those with aiScore >= 80
        console.log('All Submissions:', res.data);
        this.submissions = res.data.activeSubmissions.filter((sub: any) => sub.aiScore >= 80);
        console.log('Filtered Submissions:', this.submissions);
      },
      error: (err) => console.error('Error fetching submissions', err),
    });
  }
}
