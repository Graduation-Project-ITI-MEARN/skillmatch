import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChallengerService } from '../challenger.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-challenge',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
          <a
            routerLink="/dashboard/challenger"
            class="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
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
          </a>
          <h1 class="text-2xl font-bold text-gray-900">{{ 'CHALLENGER.EDIT.TITLE' | translate }}</h1>
        </div>

        <!-- Warning if Locked -->
        <div
          *ngIf="isLocked"
          class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 text-yellow-800 animate-fade-in"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p class="font-bold">{{ 'CHALLENGER.EDIT.RESTRICTED_MODE' | translate }}</p>
            <p class="text-sm mt-1">
              {{ 'CHALLENGER.EDIT.RESTRICTED_DESC' | translate }}
            </p>
          </div>
        </div>

        <!-- EDIT FORM -->
        <div class="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-slate-200/50">
          <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-8">
            <!-- Section 1: Basic Info -->
            <div>
              <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span
                  class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs"
                  >1</span
                >
                {{ 'CHALLENGER.EDIT.BASIC_DETAILS' | translate }}
              </h3>

              <div class="space-y-4 pl-8">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2"
                    >{{ 'CHALLENGER.EDIT.CHALLENGE_TITLE' | translate }}</label
                  >
                  <input
                    formControlName="title"
                    type="text"
                    [class.opacity-50]="isLocked"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">{{ 'CHALLENGER.EDIT.DESCRIPTION' | translate }}</label>
                  <textarea
                    formControlName="description"
                    rows="4"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <hr class="border-slate-100" />

            <!-- Section 2: Category & Settings -->
            <div>
              <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span
                  class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs"
                  >2</span
                >
                {{ 'CHALLENGER.EDIT.CATEGORY_SETTINGS' | translate }}
              </h3>

              <div class="pl-8">
                <label class="text-sm font-bold text-slate-700 block mb-3">{{ 'CHALLENGER.EDIT.SELECT_CATEGORY' | translate }}</label>

                <!-- Category Tiles -->
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <label
                    *ngFor="let cat of categories; trackBy: trackByName"
                    class="cursor-pointer group relative"
                  >
                    <input
                      type="radio"
                      formControlName="category"
                      [value]="cat.name"
                      class="peer sr-only"
                    />

                    <div
                      [class.opacity-50]="isLocked"
                      class="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 bg-white transition-all duration-200 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:ring-1 peer-checked:ring-blue-600 hover:bg-slate-50"
                    >
                      <!-- Icons -->
                      <div class="mb-2 text-slate-400 peer-checked:text-blue-600 transition-colors">
                        <svg
                          *ngIf="cat.icon === 'code'"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                        <svg
                          *ngIf="cat.icon === 'pen-tool'"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M12 19l7-7 3 3-7 7-3-3z" />
                          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                          <path d="M2 2l7.586 7.586" />
                          <circle cx="11" cy="11" r="2" />
                        </svg>
                        <svg
                          *ngIf="cat.icon === 'trending-up'"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <svg
                          *ngIf="cat.icon === 'file-text'"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>

                      <span
                        class="text-xs font-bold text-slate-600 peer-checked:text-blue-700 tracking-wide"
                        >{{ cat.name }}</span
                      >
                    </div>
                  </label>
                </div>

                <!-- Settings Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2"
                      >{{ 'CHALLENGER.EDIT.DIFFICULTY' | translate }}</label
                    >
                    <select
                      formControlName="difficulty"
                      [class.opacity-50]="isLocked"
                      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">{{ 'CHALLENGER.CREATE.DIFFICULTY_EASY' | translate }}</option>
                      <option value="medium">{{ 'CHALLENGER.CREATE.DIFFICULTY_MEDIUM' | translate }}</option>
                      <option value="hard">{{ 'CHALLENGER.CREATE.DIFFICULTY_HARD' | translate }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2"
                      >{{ 'CHALLENGER.EDIT.DURATION_DAYS' | translate }}</label
                    >
                    <input
                      formControlName="duration"
                      type="number"
                      min="1"
                      max="60"
                      [class.opacity-50]="isLocked"
                      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2"
                      >{{ 'CHALLENGER.EDIT.REQUIRED_SKILLS' | translate }}</label
                    >
                    <input
                      formControlName="skills"
                      type="text"
                      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr class="border-slate-100" />

            <!-- Section 3: Rewards -->
            <div>
              <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span
                  class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs"
                  >3</span
                >
                {{ 'CHALLENGER.EDIT.REWARDS' | translate }}
              </h3>

              <div class="pl-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2"
                      >{{ 'CHALLENGER.EDIT.PRIZE_AMOUNT' | translate }}</label
                    >
                    <div class="relative group">
                      <span
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold"
                        >EGP</span
                      >
                      <input
                        formControlName="prizeAmount"
                        type="number"
                        [class.opacity-50]="isLocked"
                        class="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900 text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2"
                      >{{ 'CHALLENGER.EDIT.OPPORTUNITY_TYPE' | translate }}</label
                    >
                    <div class="flex gap-4">
                      <label class="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          formControlName="type"
                          value="prize"
                          class="peer sr-only"
                        />
                        <div
                          [class.opacity-50]="isLocked"
                          class="px-4 py-3 rounded-xl border-2 border-slate-100 bg-white hover:border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-50 transition-all text-center"
                        >
                          <span class="text-sm font-bold text-slate-700 peer-checked:text-blue-700"
                            >{{ 'CHALLENGER.EDIT.ONE_TIME_PRIZE' | translate }}</span
                          >
                        </div>
                      </label>
                      <label class="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          formControlName="type"
                          value="job"
                          class="peer sr-only"
                        />
                        <div
                          [class.opacity-50]="isLocked"
                          class="px-4 py-3 rounded-xl border-2 border-slate-100 bg-white hover:border-slate-300 peer-checked:border-purple-600 peer-checked:bg-purple-50 transition-all text-center"
                        >
                          <span
                            class="text-sm font-bold text-slate-700 peer-checked:text-purple-700"
                            >{{ 'CHALLENGER.EDIT.HIRING_JOB' | translate }}</span
                          >
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-4 pt-6 border-t border-slate-100 mt-8">
              <button
                type="button"
                routerLink="/dashboard/challenger"
                class="px-8 py-3.5 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold border border-slate-200"
              >
                {{ 'CHALLENGER.EDIT.CANCEL' | translate }}
              </button>
              <button
                type="submit"
                [disabled]="form.invalid || isLoading"
                class="flex-1 px-6 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  *ngIf="isLoading"
                  class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isLoading ? ('CHALLENGER.EDIT.SAVING' | translate) : ('CHALLENGER.EDIT.SAVE_CHANGES' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class EditChallengeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengerService = inject(ChallengerService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  challengeId: string = '';
  isLocked = false;
  isLoading = false;
  currentStatus = 'published';

  categories = [
    { name: 'Development', icon: 'code' },
    { name: 'Design', icon: 'pen-tool' },
    { name: 'Marketing', icon: 'trending-up' },
    { name: 'Writing', icon: 'file-text' },
    { name: 'Translation', icon: 'file-text' },
    { name: 'Data Entry', icon: 'file-text' },
  ];

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    difficulty: ['medium', Validators.required],
    type: ['prize', Validators.required],
    prizeAmount: [0, Validators.required],
    duration: [7, Validators.required],
    skills: ['', Validators.required],
  });

  ngOnInit() {
    this.challengeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.challengeId) this.loadChallenge();
  }

  trackByName(index: number, item: any): string {
    return item.name;
  }

  loadChallenge() {
    this.challengerService.getChallengeById(this.challengeId).subscribe((res: any) => {
      if (!res.data) {
        this.toastr.error('Challenge not found');
        this.router.navigate(['/dashboard/challenger']);
        return;
      }

      const c = res.data;
      this.currentStatus = c.status;

      let duration = 7;
      if (c.deadline) {
        const diff = new Date(c.deadline).getTime() - new Date().getTime();
        duration = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (duration < 1) duration = 1;
      }

      const skillsString = Array.isArray(c.skills) ? c.skills.join(', ') : c.skills || '';

      this.form.patchValue({
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        type: c.type,
        prizeAmount: c.prizeAmount,
        duration: duration,
        skills: skillsString,
      });

      const hasSubmissions = (c.submissionCount || 0) > 0;
      if (c.status === 'closed' || (c.status === 'published' && hasSubmissions)) {
        this.isLocked = true;
        this.form.get('title')?.disable();
        this.form.get('prizeAmount')?.disable();
        this.form.get('category')?.disable();
        this.form.get('type')?.disable();
        this.form.get('difficulty')?.disable();
      }
    });
  }

  onSave() {
    if (this.form.invalid) return;
    this.isLoading = true;

    const durationDays = Number(this.form.get('duration')?.value) || 7;
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + durationDays);

    const formData = this.form.getRawValue();
    const skillsArray =
      typeof formData.skills === 'string'
        ? formData.skills.split(',').map((s: string) => s.trim())
        : formData.skills;

    const payload = {
      ...formData,
      skills: skillsArray,
      tags: skillsArray,
      status: this.currentStatus,
      deadline: deadlineDate.toISOString(),
    };

    this.challengerService.updateChallenge(this.challengeId, payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('CHALLENGER.EDIT.SUCCESS'));
        this.router.navigate(['/dashboard/challenger']);
      },
      error: () => {
        this.toastr.error(this.translate.instant('CHALLENGER.EDIT.ERROR'));
        this.isLoading = false;
      },
    });
  }
}
