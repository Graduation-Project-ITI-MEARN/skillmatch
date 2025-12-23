import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, LucideAngularModule],
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

  // Safety Mode
  isRestrictedMode = false;
  restrictedReason = '';
  challengeData: any = null;

  categories = ['Development', 'Design', 'Marketing', 'Writing', 'Translation', 'Data Entry'];
  difficultyLevels = ['easy', 'medium', 'hard'];
  challengeTypes = ['job', 'prize'];
  statusOptions = ['draft', 'published', 'closed'];

  allSkills: Record<string, string[]> = {
    Development: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'React', 'Angular',
      'Vue.js', 'Next.js', 'Node.js', 'Express', 'NestJS', 'HTML', 'CSS', 'Tailwind CSS',
      'MongoDB', 'PostgreSQL', 'MySQL', 'REST API', 'GraphQL', 'Docker', 'Git',
    ],
    Design: [
      'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI Design', 'UX Design',
      'Wireframing', 'Prototyping', 'Design Systems', 'Typography', 'Responsive Design',
    ],
    Marketing: [
      'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Copywriting',
      'Social Media Marketing', 'Email Marketing', 'Analytics', 'Google Analytics', 'Brand Strategy',
    ],
    Writing: [
      'Content Writing', 'Technical Writing', 'Copywriting', 'Blog Writing',
      'SEO Writing', 'Creative Writing',
    ],
    Translation: [
      'English Translation', 'Arabic Translation', 'Localization', 'Proofreading', 'Subtitling',
    ],
    'Data Entry': [
      'Data Entry', 'Excel', 'Google Sheets', 'Data Cleaning', 'Data Validation',
      'Typing', 'CRM Data Entry',
    ],
  };

  selectedTags: string[] = [];
  minDate!: string;
  skillSearchQuery = '';
  openSkillsDropdown = false;

  selectedCategory: string | null = null;
  openCategory = false;
  selectedDifficulty: string | null = null;
  openDifficulty = false;
  selectedType: string | null = null;
  openType = false;
  selectedStatus: string = 'draft';
  openStatus = false;

  async ngOnInit() {
    // Set minimum date
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = today.toISOString().split('T')[0];

    // Get challenge ID from route
    this.challengeId = this.route.snapshot.params['id'];

    // Initialize form
    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      type: ['', Validators.required],
      status: ['draft'],
      deadline: ['', Validators.required],
      salary: [null],
      prizeAmount: [null],
      tags: [[], Validators.required],
    });

    // Load challenge data
    await this.loadChallengeData();

    // Dynamic validators based on type
    this.challengeForm.get('type')?.valueChanges.subscribe((type) => {
      if (type === 'job') {
        this.challengeForm.get('salary')?.setValidators([Validators.required, Validators.min(1000)]);
        this.challengeForm.get('prizeAmount')?.clearValidators();
        this.challengeForm.get('prizeAmount')?.setValue(null);
      } else if (type === 'prize') {
        this.challengeForm.get('prizeAmount')?.setValidators([Validators.required, Validators.min(100)]);
        this.challengeForm.get('salary')?.clearValidators();
        this.challengeForm.get('salary')?.setValue(null);
      }
      this.challengeForm.get('salary')?.updateValueAndValidity();
      this.challengeForm.get('prizeAmount')?.updateValueAndValidity();
    });
  }

  async loadChallengeData() {
    try {
      this.isLoading = true;
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/challenges/${this.challengeId}`)
      );

      this.challengeData = response;

      // Check for Restricted Mode
      this.checkRestrictedMode();

      // Populate form
      this.selectedCategory = response.category;
      this.selectedDifficulty = response.difficulty;
      this.selectedType = response.type;
      this.selectedStatus = response.status || 'draft';
      this.selectedTags = response.tags || [];

      // Format deadline date
      const deadline = response.deadline ? new Date(response.deadline).toISOString().split('T')[0] : '';

      this.challengeForm.patchValue({
        title: response.title,
        description: response.description,
        category: response.category,
        difficulty: response.difficulty,
        type: response.type,
        status: response.status || 'draft',
        deadline: deadline,
        tags: response.tags || [],
      });

      // Set salary or prizeAmount based on type
      if (response.type === 'job') {
        this.challengeForm.patchValue({ salary: response.prizeAmount });
      } else if (response.type === 'prize') {
        this.challengeForm.patchValue({ prizeAmount: response.prizeAmount });
      }

      // Apply restrictions if needed
      if (this.isRestrictedMode) {
        this.applyRestrictions();
      }

    } catch (error: any) {
      console.error('Error loading challenge:', error);
      this.submitError = error?.error?.message || 'Failed to load challenge data';
    } finally {
      this.isLoading = false;
    }
  }

  checkRestrictedMode() {
    const status = this.challengeData?.status;
    const submissionsCount = this.challengeData?.submissionsCount || 0;

    if (status === 'published' && submissionsCount > 0) {
      this.isRestrictedMode = true;
      this.restrictedReason = `⚠️ Restricted Mode: ${submissionsCount} active submission${submissionsCount > 1 ? 's' : ''} detected. Core fields are locked to protect applicants.`;
    }
  }

  applyRestrictions() {
    // Disable critical fields
    this.challengeForm.get('title')?.disable();
    this.challengeForm.get('category')?.disable();
    this.challengeForm.get('difficulty')?.disable();
    this.challengeForm.get('type')?.disable();
    this.challengeForm.get('salary')?.disable();
    this.challengeForm.get('prizeAmount')?.disable();
    this.challengeForm.get('tags')?.disable();

    // Description can still be edited for typo fixes
    this.challengeForm.get('description')?.enable();
    this.challengeForm.get('deadline')?.enable();
    this.challengeForm.get('status')?.enable();
  }

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

  selectType(type: string) {
    if (this.isRestrictedMode) return;
    this.selectedType = type;
    this.openType = false;
    this.challengeForm.get('type')?.setValue(type);
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.openStatus = false;
    this.challengeForm.get('status')?.setValue(status);
  }

  get availableSkills(): string[] {
    if (!this.selectedCategory) return Object.values(this.allSkills).flat();
    return this.allSkills[this.selectedCategory as keyof typeof this.allSkills] || [];
  }

  get filteredSkills(): string[] {
    const query = this.skillSearchQuery.toLowerCase().trim();
    if (!query) return this.availableSkills;
    return this.availableSkills.filter((skill) => skill.toLowerCase().includes(query));
  }

  toggleSkill(skill: string) {
    if (this.isRestrictedMode) return;
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) this.selectedTags.splice(index, 1);
    else this.selectedTags.push(skill);
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
  }

  removeSkill(skill: string) {
    if (this.isRestrictedMode) return;
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) this.selectedTags.splice(index, 1);
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedTags.includes(skill);
  }

  clearSkillSearch() {
    this.skillSearchQuery = '';
  }

  async onSubmit() {
    // Get raw values (including disabled fields)
    const formValue = this.challengeForm.getRawValue();

    if (!formValue.title || !formValue.category || !formValue.difficulty ||
        !formValue.type || !formValue.deadline || this.selectedTags.length === 0) {
      this.submitError = 'Please fill all required fields';
      return;
    }

    const payload: any = {
      title: formValue.title,
      description: formValue.description,
      category: this.selectedCategory,
      difficulty: this.selectedDifficulty,
      type: this.selectedType,
      status: this.selectedStatus,
      deadline: formValue.deadline,
      tags: this.selectedTags,
    };

    // Add prizeAmount based on type
    if (this.selectedType === 'job') {
      payload.prizeAmount = Number(formValue.salary);
    } else if (this.selectedType === 'prize') {
      payload.prizeAmount = Number(formValue.prizeAmount);
    }

    try {
      this.isSubmitting = true;
      this.submitError = '';

      await firstValueFrom(
        this.http.put(`${environment.apiUrl}/challenges/${this.challengeId}`, payload)
      );

      this.submitSuccess = true;
      setTimeout(() => this.router.navigate(['/dashboard/company/overview']), 2000);
    } catch (error: any) {
      console.error('Error updating challenge:', error);
      this.submitError = error?.error?.message || 'Failed to update challenge';
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/company/overview']);
  }
}
