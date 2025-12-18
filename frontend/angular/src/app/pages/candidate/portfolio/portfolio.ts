import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from 'src/app/core/services/candidateService';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.html',
})
export class Portfolio implements OnInit {
  private candidateService = inject(CandidateService);
  submissions: any[] = [];

  // TODO: Replace with GET /users/profile/skills when backend is ready
  skills: string[] = ['React', 'Next.js', 'Tailwind'];

  ngOnInit(): void {
    this.fetchSubmissions();
  }

  fetchSubmissions() {
    this.candidateService.getMySubmissions().subscribe({
      next: (res) => {
        this.submissions = res.data;
      },
      error: (err) => console.error('Error fetching submissions', err),
    });
  }
}
