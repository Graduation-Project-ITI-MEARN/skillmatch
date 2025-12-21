import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChallengerService } from '../challenger.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-winner-solution',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 lg:p-12">
      <!-- Back Button -->
      <a
        routerLink="/dashboard/challenger"
        class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Dashboard
      </a>

      <div *ngIf="isLoading" class="text-center py-20">
        <div
          class="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
        ></div>
        <p class="text-gray-500">Loading winning solution...</p>
      </div>

      <div *ngIf="!isLoading && winner" class="max-w-5xl mx-auto animate-fade-in">
        <!-- HERO SECTION -->
        <div
          class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative mb-10"
        >
          <!-- Confetti/Decorations -->
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl -mr-16 -mt-16"
          ></div>

          <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <!-- Avatar -->
            <div
              class="w-32 h-32 rounded-full border-4 border-white/20 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl font-bold shadow-xl"
            >
              {{ winner.initials }}
            </div>

            <div class="text-center md:text-left flex-1">
              <div
                class="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-yellow-500/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
                Challenge Winner
              </div>
              <h1 class="text-4xl md:text-5xl font-black mb-2">{{ winner.name }}</h1>
              <p class="text-gray-300 text-lg">
                Achieved a perfect score of
                <span class="text-white font-bold">{{ winner.score }}%</span>
              </p>
            </div>

            <!-- Stats -->
            <div
              class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-w-[200px] text-center"
            >
              <p class="text-gray-400 text-sm font-medium uppercase mb-1">Prize Earned</p>
              <p class="text-3xl font-black text-green-400">
                {{ prizeAmount | currency : 'EGP ' }}
              </p>
            </div>
          </div>
        </div>

        <!-- TWO COLUMN LAYOUT -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- VIDEO EMBED (Main Content) -->
          <div class="lg:col-span-2">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              Video Submission
            </h2>
            <div class="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video relative group">
              <iframe
                *ngIf="safeVideoUrl"
                [src]="safeVideoUrl"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              >
              </iframe>
              <div
                *ngIf="!safeVideoUrl"
                class="absolute inset-0 flex items-center justify-center text-gray-500"
              >
                <p>Video URL is invalid or missing.</p>
              </div>
            </div>

            <div class="mt-6 bg-white rounded-2xl p-6 border border-gray-200">
              <h3 class="font-bold text-gray-900 mb-2">About this Solution</h3>
              <p class="text-gray-600 leading-relaxed">
                {{ winner.description || 'No text description provided.' }}
              </p>
            </div>
          </div>

          <!-- JUDGE'S COMMENTS (Hardcoded per Task) -->
          <div class="lg:col-span-1">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              AI Judge Feedback
            </h2>

            <div
              class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden"
            >
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-10 -mt-10"
              ></div>

              <div class="space-y-6 relative z-10">
                <div>
                  <p class="text-xs font-bold text-gray-400 uppercase mb-1">Technical Execution</p>
                  <p class="text-gray-700 italic">
                    "The solution demonstrates exceptional understanding of the requirements. The
                    code structure is modular and follows best practices."
                  </p>
                </div>

                <div>
                  <p class="text-xs font-bold text-gray-400 uppercase mb-1">Creativity</p>
                  <p class="text-gray-700 italic">
                    "Innovative approach to the UI/UX problem. The animation transitions were smooth
                    and added significant value."
                  </p>
                </div>

                <div class="pt-4 border-t border-gray-100">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                    >
                      AI
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900">SkillMatch AI</p>
                      <p class="text-xs text-gray-500">Automated Evaluation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class WinnerSolutionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private challengerService = inject(ChallengerService);
  private sanitizer = inject(DomSanitizer);

  isLoading = true;
  winner: any = null;
  prizeAmount = 0;
  safeVideoUrl: SafeResourceUrl | null = null;

  ngOnInit() {
    const challengeId = this.route.snapshot.paramMap.get('id');
    if (challengeId) this.loadData(challengeId);
  }

  loadData(challengeId: string) {
    // 1. Get Challenge to find Winner ID & Prize
    this.challengerService.getChallengeById(challengeId).subscribe((res: any) => {
      const challenge = res.data;
      if (!challenge || !challenge.winner) {
        this.isLoading = false;
        return;
      }

      this.prizeAmount = challenge.prizeAmount || 0;

      // 2. Fetch the specific submission of the winner to get the video
      // Since we don't have the submission ID directly in the challenge model (only winner ID),
      // we fetch all submissions and find the one by this user.
      this.challengerService.getSubmissionsByChallenge(challengeId).subscribe((subRes: any) => {
        const submissions = subRes.data || [];
        // Find submission where candidateId._id matches challenge.winner
        const winningSub = submissions.find(
          (s: any) =>
            (s.candidateId?._id || s.candidateId) === (challenge.winner._id || challenge.winner)
        );

        if (winningSub) {
          this.winner = {
            name: winningSub.candidateId?.name || 'Winner',
            initials: (winningSub.candidateId?.name || 'W').substring(0, 2).toUpperCase(),
            score: winningSub.aiScore || 0,
            description: winningSub.textContent,
          };

          // Sanitize YouTube/Vimeo URL for iframe
          if (winningSub.videoExplanationUrl) {
            // Convert standard youtube watch URL to embed if needed (basic check)
            let videoUrl = winningSub.videoExplanationUrl;
            if (videoUrl.includes('youtube.com/watch?v=')) {
              videoUrl = videoUrl.replace('watch?v=', 'embed/');
            }
            this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
          }
        }
        this.isLoading = false;
      });
    });
  }
}
