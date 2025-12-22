import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Search,
  X,
} from 'lucide-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './create-challenge.html',
  styleUrls: ['./create-challenge.css'],
})
export class CreateChallenge implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  icons = { ArrowLeft, CheckCircle, AlertCircle, ChevronDown, Search, X };
  challengeForm!: FormGroup;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  categories = ['Development', 'Design', 'Marketing', 'Writing', 'Translation', 'Data Entry'];

  difficultyLevels = ['easy', 'medium', 'hard'];
  challengeTypes = ['job', 'prize'];
  statusOptions = ['draft', 'published', 'closed'];

  allSkills: Record<string, string[]> = {
    Development: [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C#',
      'C++',
      'React',
      'Angular',
      'Vue.js',
      'Next.js',
      'Node.js',
      'Express',
      'NestJS',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'REST API',
      'GraphQL',
      'Docker',
      'Git',
    ],
    Design: [
      'Figma',
      'Adobe XD',
      'Photoshop',
      'Illustrator',
      'UI Design',
      'UX Design',
      'Wireframing',
      'Prototyping',
      'Design Systems',
      'Typography',
      'Responsive Design',
    ],
    Marketing: [
      'SEO',
      'SEM',
      'Google Ads',
      'Facebook Ads',
      'Content Marketing',
      'Copywriting',
      'Social Media Marketing',
      'Email Marketing',
      'Analytics',
      'Google Analytics',
      'Brand Strategy',
    ],
    Writing: [
      'Content Writing',
      'Technical Writing',
      'Copywriting',
      'Blog Writing',
      'SEO Writing',
      'Creative Writing',
    ],
    Translation: [
      'English Translation',
      'Arabic Translation',
      'Localization',
      'Proofreading',
      'Subtitling',
    ],
    'Data Entry': [
      'Data Entry',
      'Excel',
      'Google Sheets',
      'Data Cleaning',
      'Data Validation',
      'Typing',
      'CRM Data Entry',
    ],
  };

  selectedTags: string[] = [];
  minDate!: string; // <-- هنا عرفنا المتغير
  skillSearchQuery = '';
  openSkillsDropdown = false;

  benefits = [
    { title: 'CHALLENGE.CREATE.BENEFIT_1_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_1_DESC' },
    { title: 'CHALLENGE.CREATE.BENEFIT_2_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_2_DESC' },
    { title: 'CHALLENGE.CREATE.BENEFIT_3_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_3_DESC' },
  ];

  selectedCategory: string | null = null;
  openCategory = false;

  selectedDifficulty: string | null = null;
  openDifficulty = false;

  selectedType: string | null = null;
  openType = false;

  selectedStatus: string = 'draft';
  openStatus = false;

  ngOnInit() {
    // 1. تحديد الحد الأدنى لتاريخ deadline
    const today = new Date();
    today.setDate(today.getDate() + 1); // الحد الأدنى يبقى الغد
    this.minDate = today.toISOString().split('T')[0]; // yyyy-mm-dd

    // 2. تعريف الفورم
    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      type: ['', Validators.required],
      status: ['draft'],
      deadline: ['', Validators.required], // لازم يكون required
      salary: [null],
      prizeAmount: [null],
      tags: [[], Validators.required],
    });

    // 3. تعديل Validators بناءً على نوع التحدي
    this.challengeForm.get('type')?.valueChanges.subscribe((type) => {
      if (type === 'job') {
        this.challengeForm
          .get('salary')
          ?.setValidators([Validators.required, Validators.min(1000)]);
        this.challengeForm.get('prizeAmount')?.clearValidators();
        this.challengeForm.get('prizeAmount')?.setValue(null);
      } else if (type === 'prize') {
        this.challengeForm
          .get('prizeAmount')
          ?.setValidators([Validators.required, Validators.min(100)]);
        this.challengeForm.get('salary')?.clearValidators();
        this.challengeForm.get('salary')?.setValue(null);
      }
      this.challengeForm.get('salary')?.updateValueAndValidity();
      this.challengeForm.get('prizeAmount')?.updateValueAndValidity();
    });
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.openCategory = false;
    this.challengeForm.get('category')?.setValue(cat);
  }

  selectDifficulty(level: string) {
    this.selectedDifficulty = level;
    this.openDifficulty = false;
    this.challengeForm.get('difficulty')?.setValue(level);
  }

  selectType(type: string) {
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
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) this.selectedTags.splice(index, 1);
    else this.selectedTags.push(skill);
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
  }

  removeSkill(skill: string) {
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
    if (this.challengeForm.invalid || this.selectedTags.length === 0) {
      this.challengeForm.markAllAsTouched();

      if (this.selectedTags.length === 0) this.submitError = 'Please select at least one skill';
      else if (!this.selectedCategory) this.submitError = 'Please select a category';
      else if (!this.selectedDifficulty) this.submitError = 'Please select difficulty level';
      else if (!this.selectedType) this.submitError = 'Please select challenge type';
      else this.submitError = 'Please fill all required fields';
      return;
    }

    const deadlineValue = this.challengeForm.get('deadline')?.value;
    if (!deadlineValue) {
      this.submitError = 'Please select a deadline date';
      return;
    }

    const payload: any = {
      title: this.challengeForm.value.title,
      description: this.challengeForm.value.description,
      category: this.selectedCategory,
      difficulty: this.selectedDifficulty,
      type: this.selectedType,
      status: this.selectedStatus || 'draft',
      deadline: this.challengeForm.value.deadline,
      tags: this.selectedTags,
      // هنا التعديل المهم 👇
    };

    // توحيد الحقلين (salary و prizeAmount) في حقل واحد للباك إند
    if (this.selectedType === 'job') {
      payload.prizeAmount = Number(this.challengeForm.value.salary);
    } else if (this.selectedType === 'prize') {
      payload.prizeAmount = Number(this.challengeForm.value.prizeAmount);
    }
    try {
      this.isSubmitting = true;
      this.submitError = '';
      await firstValueFrom(this.http.post(`${environment.apiUrl}/challenges`, payload));
      this.submitSuccess = true;
      setTimeout(() => this.router.navigate(['/dashboard/company/overview']), 4000);
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      this.submitError = error?.error?.message || 'Failed to create challenge';
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/company/overview']);
  }
}
