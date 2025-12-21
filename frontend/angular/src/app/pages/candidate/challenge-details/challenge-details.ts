import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, FileDown, Link, Layout, Award, BarChart, Code, Clock } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CandidateService } from 'src/app/core/services/candidateService';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-challenge-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule, RouterModule],
  templateUrl: './challenge-details.html',
})
export class ChallengeDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private candidateService = inject(CandidateService);

  challenge: any = null;
  loading = true;
  isSubmitted = false; // دي اللي هتحدد شكل الزرار

  readonly icons = { FileDown, Link, Layout, Award, BarChart, Code, Clock };

  ngOnInit() {
    const challengeId = this.route.snapshot.paramMap.get('id');
    if (challengeId) {
      this.loadData(challengeId);
    }
  }

  loadData(id: string) {
    // بنطلب بيانات التحدي وقائمة التسليمات الخاصة باليوزر في نفس الوقت
    forkJoin({
      challengeDetail: this.candidateService.getChallengeById(id),
      mySubmissions: this.candidateService.getMySubmissions()
    }).subscribe({
      next: (res) => {
        this.challenge = res.challengeDetail.data;

        // التأكد لو الـ ID بتاع التحدي ده موجود في أي Submission قديم لليوزر
        const submissions = res.mySubmissions?.data || [];
        this.isSubmitted = submissions.some((s: any) =>
            (s.challengeId === id) || (s.challenge?._id === id)
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading challenge details:', err);
        this.loading = false;
      }
    });
  }

  handleAction() {
    if (this.isSubmitted) {
      // توجيه لصفحة الحل (Portfolio) أو عرض رسالة
      console.log('User already submitted. Redirecting to portfolio...');
    } else {
      // منطق بدء التحدي (Start Challenge)
      console.log('Starting challenge interaction...');
    }
  }

  downloadFile(url: string) {
    window.open(url, '_blank');
  }
}
