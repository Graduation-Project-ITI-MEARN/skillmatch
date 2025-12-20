// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-edit-challenge',
//   imports: [],
//   templateUrl: './edit-challenge.html',
//   styleUrl: './edit-challenge.css',
// })
// export class EditChallenge {

// }

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lock,
  AlertTriangle,
} from 'lucide-angular';
import { environment } from 'src/environments/environment';

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  requirements?: string;
  status: 'draft' | 'published';
  submissionsCount: number;
}

@Component({
  selector: 'app-edit-challenge',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './edit-challenge.html',
  styleUrls: ['./edit-challenge.css'],
})
export class EditChallenge implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  icons = { ArrowLeft, CheckCircle, AlertCircle, Lock, AlertTriangle };

  challengeForm!: FormGroup;
  challengeId!: number;
  challenge: Challenge | null = null;
  isLoading = true;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  // Safety Logic
  isRestricted = false;
  restrictedMessage = '';

  categories = ['CODING', 'DESIGN', 'MARKETING'];
  difficultyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  availableSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
    'Node.js', 'Python', 'Java', 'C#', 'PHP',
    'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
    'SEO', 'Content Marketing', 'Social Media', 'Email Marketing'
  ];
  selectedSkills: string[] = [];

  async ngOnInit() {
    this.challengeId = Number(this.route.snapshot.paramMap.get('id'));
    await this.loadChallenge();
    this.initForm();
  }

  async loadChallenge() {
    try {
      this.isLoading = true;
      const response = await firstValueFrom(
        this.http.get<Challenge>(`${environment.apiUrl}/challenges/${this.challengeId}`)
      );
      this.challenge = response;
      this.selectedSkills = response.skills || [];

      // CRITICAL SAFETY LOGIC
      if (response.status === 'published' && response.submissionsCount > 0) {
        this.isRestricted = true;
        this.restrictedMessage = `${response.submissionsCount}`;
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
      this.router.navigate(['/dashboard/company/overview']);
    } finally {
      this.isLoading = false;
    }
  }

  initForm() {
    if (!this.challenge) return;

    this.challengeForm = this.fb.group({
      title: [
        { value: this.challenge.title, disabled: this.isRestricted },
        [Validators.required, Validators.minLength(5)]
      ],
      description: [this.challenge.description, Validators.required],
      category: [
        { value: this.challenge.category, disabled: this.isRestricted },
        Validators.required
      ],
      difficulty: [this.challenge.difficulty, Validators.required],
      salaryMin: [
        { value: this.challenge.salaryMin, disabled: this.isRestricted },
        [Validators.required, Validators.min(1)]
      ],
      salaryMax: [
        { value: this.challenge.salaryMax, disabled: this.isRestricted },
        [Validators.required, Validators.min(1)]
      ],
      requirements: [this.challenge.requirements || ''],
    });
  }

  toggleSkill(skill: string) {
    if (this.isRestricted) return;
    const index = this.selectedSkills.indexOf(skill);
    if (index > -1) {
      this.selectedSkills.splice(index, 1);
    } else {
      this.selectedSkills.push(skill);
    }
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedSkills.includes(skill);
  }

  async onSubmit() {
    if (this.challengeForm.invalid || this.selectedSkills.length === 0) {
      Object.keys(this.challengeForm.controls).forEach(key => {
        this.challengeForm.get(key)?.markAsTouched();
      });
      return;
    }

    try {
      this.isSubmitting = true;
      this.submitError = '';

      const payload = {
        ...this.challengeForm.getRawValue(),
        skills: this.selectedSkills,
      };

      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/challenges/${this.challengeId}`, payload)
      );

      this.submitSuccess = true;
      setTimeout(() => {
        this.router.navigate(['/dashboard/company/overview']);
      }, 2000);
    } catch (error: any) {
      this.submitError = error?.error?.message || 'Failed to update challenge';
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/company/overview']);
  }
}
