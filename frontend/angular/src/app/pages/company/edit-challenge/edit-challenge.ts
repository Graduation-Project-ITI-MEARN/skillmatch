import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCalendarComponent } from '@/shared/components/zard-ui/calendar/calendar.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Lock,
  ChevronDown,
  Search,
  X,
} from 'lucide-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, LucideAngularModule , ZardCalendarComponent ],
templateUrl: './edit-challenge.html',
  styleUrls: ['./edit-challenge.css'],
})
export class EditChallenge implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  icons = { ArrowLeft, CheckCircle, AlertCircle, AlertTriangle, Lock, ChevronDown, Search, X };

  challengeForm!: FormGroup;
  challengeId!: string;
  isLoading = true;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;
  isRestrictedMode = false;
  restrictedReason = '';
  challengeData: any = null;

  categories = ['Development', 'Design', 'Marketing', 'Writing', 'Translation', 'Data Entry'];
  difficultyLevels = ['easy', 'medium', 'hard'];
  statusOptions = ['draft', 'published', 'closed'];
  selectedTags: string[] = [];
  minDate!: Date;
  skillSearchQuery = '';
  openSkillsDropdown = false;
  selectedCategory: string | null = null;
  openCategory = false;
  selectedDifficulty: string | null = null;
  openDifficulty = false;
  selectedStatus: string = 'draft';
  openStatus = false;

  async ngOnInit() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = today;

    this.challengeId = this.route.snapshot.params['id'];

    // Initialize form with all fields to match Create form
   this.challengeForm = this.fb.group({
  title: ['', [Validators.required, Validators.minLength(5)]],
  description: ['', [Validators.required]],
  category: ['', Validators.required],
  difficulty: ['', Validators.required],
  status: ['draft'],
  deadline: [null, Validators.required], // بدل ''، نخليها Date
  salary: [null, [Validators.required, Validators.min(1000)]],
  tags: [[], Validators.required],
  requirements: ['', [Validators.required]],
  evaluationCriteria: ['', [Validators.required]],
  deliverables: ['', [Validators.required]],
});

    await this.loadChallengeData();
  }

  async loadChallengeData() {
    try {
      this.isLoading = true;
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/challenges/${this.challengeId}`)
      );
      this.challengeData = response;
      this.checkRestrictedMode();

      // Pre-fill form with existing data
      this.challengeForm.patchValue({
        title: response.title,
        description: response.description,
        category: response.category,
        difficulty: response.difficulty,
        status: response.status || 'draft',
        deadline: response.deadline,
        salary: response.salary || response.prizeAmount,
        tags: response.tags || [],
        requirements: response.requirements,
        evaluationCriteria: response.evaluationCriteria,
        deliverables: response.deliverables
      });

      this.selectedCategory = response.category;
      this.selectedDifficulty = response.difficulty;
      this.selectedStatus = response.status || 'draft';
      this.selectedTags = response.tags || [];

      if (this.isRestrictedMode) this.applyRestrictions();
    } catch (error: any) {
      this.submitError = 'Failed to load challenge data';
    } finally {
      this.isLoading = false;
    }
  }

  checkRestrictedMode() {
    const status = this.challengeData?.status;
    const submissionsCount = this.challengeData?.submissionsCount || 0;
    if (status === 'published' && submissionsCount > 0) {
      this.isRestrictedMode = true;
      this.restrictedReason = `⚠️ Restricted Mode: ${submissionsCount} active submissions detected. Core fields are locked.`;
    }
  }

  applyRestrictions() {
    ['title', 'category', 'difficulty', 'salary', 'tags'].forEach(field => {
      this.challengeForm.get(field)?.disable();
    });
  }

  // Dropdown Selectors
  selectCategory(cat: string) {
    if (this.isRestrictedMode) return;
    this.selectedCategory = cat;
    this.openCategory = false;
    this.challengeForm.get('category')?.setValue(cat);
  }

  selectDifficulty(level: string) {
    if (this.isRestrictedMode) return;
    this.selectedDifficulty = level;
    this.openDifficulty = false;
    this.challengeForm.get('difficulty')?.setValue(level);
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.openStatus = false;
    this.challengeForm.get('status')?.setValue(status);
  }

  // Skill Management
  toggleSkill(skill: string) {
    if (this.isRestrictedMode) return;
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) this.selectedTags.splice(index, 1);
    else this.selectedTags.push(skill);
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
  }

  async onSubmit() {
    if (this.challengeForm.invalid) {
      this.submitError = 'Please fill all required fields correctly';
      return;
    }

    try {
      this.isSubmitting = true;
      const payload = this.challengeForm.getRawValue();
      await firstValueFrom(this.http.put(`${environment.apiUrl}/challenges/${this.challengeId}`, payload));
      this.submitSuccess = true;
      setTimeout(() => this.router.navigate(['/dashboard/company/overview']), 2000);
    } catch (error: any) {
      this.submitError = error?.error?.message || 'Update failed';
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack() { this.router.navigate(['/dashboard/company/overview']); }
}
