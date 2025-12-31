import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { ChallengeService } from '../../../core/services/challenge.service';
import {
  SubmissionType,
  IdealSolutionType,
  PricingTier,
  IAiModel,
  IPricingTierDetails,
} from '../../../shared/models/challenge.model';
import { ZardSelectImports } from '@shared/components/zard-ui/select/select.imports';
import { ZardDatePickerComponent } from '@shared/components/zard-ui/date-picker/date-picker.component';
import { ZardInputDirective } from '@shared/components/zard-ui/input/input.directive';
import { ZardCalendarComponent } from '@shared/components/zard-ui/calendar/calendar.component';

@Component({
  selector: 'app-create-challenge',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    LucideAngularModule,
    ...ZardSelectImports,
    ZardInputDirective,
    ZardCalendarComponent,
  ],
  templateUrl: './create-challenge.html',
  styleUrls: ['./create-challenge.css'],
})
export class CreateChallenge implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private challengeService = inject(ChallengeService);
  private translate = inject(TranslateService);

  icons = { ArrowLeft, CheckCircle, AlertCircle, ChevronDown, Search, X };
  challengeForm!: FormGroup;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  categories: string[] = [];
  allSkills: string[] = [];
  aiModels: IAiModel[] = [];
  aiPricingTiers: IPricingTierDetails[] = [];

  difficultyLevels = ['easy', 'medium', 'hard'];
  submissionTypes: SubmissionType[] = ['link', 'file', 'text'];
  idealSolutionTypes: IdealSolutionType[] = ['link', 'file', 'text'];

  selectedTags: string[] = [];
  minDate!: string;
  skillSearchQuery = '';
  openSkillsDropdown = false;

  showDatePicker = false;

  benefits = [
    { title: 'CHALLENGE.CREATE.BENEFIT_1_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_1_DESC' },
    { title: 'CHALLENGE.CREATE.BENEFIT_2_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_2_DESC' },
    { title: 'CHALLENGE.CREATE.BENEFIT_3_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_3_DESC' },
  ];

  // Changed from string | null to string to match Zard Select expectations
  selectedCategory = '';
  selectedDifficulty = '';
  selectedSubmissionType: SubmissionType = 'link';
  selectedIdealSolutionType: IdealSolutionType = 'link';
  selectedPricingTier: PricingTier = 'free';
  selectedAiModel: IAiModel | null = null;
  selectedAiModelId = '';
  selectedDeadlineDate: Date | null = null;

  ngOnInit() {
    this.fetchMetadata();

    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = today.toISOString().split('T')[0];

    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      type: ['job'],
      submissionType: ['', Validators.required],
      deadline: [null, [Validators.required, this.dateMinValidator(this.minDate)]],
      salary: [null as number | null, [Validators.required, Validators.min(1000)]],
      additionalInfo: [''],
      tags: [[], Validators.required],
      requirements: ['', Validators.required],
      evaluationCriteria: ['', Validators.required],
      deliverables: ['', Validators.required],
      idealSolution: this.fb.group({
        type: ['link', Validators.required],
        value: [''],
      }),
      aiConfig: this.fb.group({
        pricingTier: ['free', Validators.required],
        selectedModel: ['', Validators.required],
        autoEvaluate: [true],
        requireVideoTranscript: [false],
      }),
    });

    this.selectedIdealSolutionType = this.challengeForm.get('idealSolution.type')?.value;
    this.selectedPricingTier = this.challengeForm.get('aiConfig.pricingTier')?.value;

    this.challengeForm
      .get('idealSolution.type')
      ?.valueChanges.subscribe((type: IdealSolutionType) => {
        this.selectedIdealSolutionType = type;
        const idealSolutionValueControl = this.challengeForm.get('idealSolution.value');
        if (type === 'link') {
          idealSolutionValueControl?.setValidators([
            Validators.required,
            Validators.pattern('https?://.+'),
          ]);
        } else if (type === 'text') {
          idealSolutionValueControl?.setValidators([Validators.required, Validators.minLength(10)]);
        } else if (type === 'file') {
          idealSolutionValueControl?.setValidators(Validators.required);
        } else {
          idealSolutionValueControl?.clearValidators();
        }
        idealSolutionValueControl?.updateValueAndValidity();
      });

    this.challengeForm.get('aiConfig.pricingTier')?.valueChanges.subscribe((tier: PricingTier) => {
      this.selectedPricingTier = tier;
      const selectedModelControl = this.challengeForm.get('aiConfig.selectedModel');
      let defaultModelId: string | undefined;

      if (tier === 'custom') {
        selectedModelControl?.setValidators(Validators.required);
        this.selectedAiModel = null;
        this.selectedAiModelId = '';
        selectedModelControl?.setValue('');
      } else {
        const tierDetails = this.aiPricingTiers.find((t) => t.tier === tier);
        if (tierDetails) {
          defaultModelId = tierDetails.defaultModel;
          this.selectedAiModel = this.aiModels.find((m) => m.id === defaultModelId) || null;
          this.selectedAiModelId = defaultModelId;
          selectedModelControl?.setValue(defaultModelId);
          selectedModelControl?.clearValidators();
        } else {
          this.selectedAiModel = null;
          this.selectedAiModelId = '';
          selectedModelControl?.setValue('');
          selectedModelControl?.clearValidators();
        }
      }
      selectedModelControl?.updateValueAndValidity();
    });

    this.challengeForm.get('idealSolution.type')?.updateValueAndValidity();
    this.challengeForm.get('aiConfig.pricingTier')?.updateValueAndValidity();
  }

  async fetchMetadata() {
    try {
      const [categoriesRes, skillsRes, aiModelsRes] = await Promise.all([
        firstValueFrom(this.challengeService.getCategories()),
        firstValueFrom(this.challengeService.getSkills()),
        firstValueFrom(this.challengeService.getAiModels()),
      ]);

      if (categoriesRes.success) {
        this.categories = categoriesRes.data;
      }
      if (skillsRes.success) {
        this.allSkills = skillsRes.data;
      }
      if (aiModelsRes.success) {
        this.aiModels = aiModelsRes.data.models;
        this.aiPricingTiers = aiModelsRes.data.pricingTiers;

        const freeTier = this.aiPricingTiers.find((t) => t.tier === 'free');
        if (freeTier) {
          this.selectedAiModel = this.aiModels.find((m) => m.id === freeTier.defaultModel) || null;
          this.selectedAiModelId = freeTier.defaultModel;
          this.challengeForm.get('aiConfig.selectedModel')?.valueChanges.subscribe((modelId) => {
            this.selectedAiModelId = modelId;
            this.selectedAiModel = this.aiModels.find((m) => m.id === modelId) || null;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      this.submitError = 'Failed to load challenge metadata. Please try again.';
    }
  }

  get skillsForSelectedCategory(): string[] {
    return this.allSkills;
  }

  get filteredSkills(): string[] {
    const query = this.skillSearchQuery.toLowerCase().trim();
    if (!query) return this.skillsForSelectedCategory;
    return this.skillsForSelectedCategory.filter((skill) => skill.toLowerCase().includes(query));
  }

  onCategorySelected(category: string | string[]) {
    const value = Array.isArray(category) ? category[0] : category;
    this.selectedCategory = value;
    this.challengeForm.get('category')?.setValue(value);
  }

  onDifficultySelected(difficulty: string | string[]) {
    const value = Array.isArray(difficulty) ? difficulty[0] : difficulty;
    this.selectedDifficulty = value;
    this.challengeForm.get('difficulty')?.setValue(value);
  }

  onSubmissionTypeSelected(type: string | string[]) {
    const value = (Array.isArray(type) ? type[0] : type) as SubmissionType;
    this.selectedSubmissionType = value;
    this.challengeForm.get('submissionType')?.setValue(value);
  }

  onIdealSolutionTypeSelected(type: string | string[]) {
    const value = (Array.isArray(type) ? type[0] : type) as IdealSolutionType;
    this.selectedIdealSolutionType = value;
    this.challengeForm.get('idealSolution.type')?.setValue(value);
  }

  onPricingTierSelected(tier: string | string[]) {
    const value = (Array.isArray(tier) ? tier[0] : tier) as PricingTier;
    this.selectedPricingTier = value;
    this.challengeForm.get('aiConfig.pricingTier')?.setValue(value);
  }

  onAiModelSelected(modelId: string | string[]) {
    const value = Array.isArray(modelId) ? modelId[0] : modelId;
    this.selectedAiModel = this.aiModels.find((m) => m.id === value) || null;
    this.selectedAiModelId = value;
    this.challengeForm.get('aiConfig.selectedModel')?.setValue(value);
  }

  onDeadlineDateChange(date: Date | Date[] | null) {
    const singleDate = Array.isArray(date) ? date[0] ?? null : date;
    this.selectedDeadlineDate = singleDate;
    // Ensure the date is set as a string for the form control
    this.challengeForm.get('deadline')?.setValue(singleDate ? singleDate.toISOString() : null);
    // Manually trigger validation if needed, or it will on blur/submit
    this.challengeForm.get('deadline')?.markAsDirty();
    this.challengeForm.get('deadline')?.updateValueAndValidity();
  }

  handleIdealSolutionFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.challengeForm.get('idealSolution.value')?.setValue(file.name);
    } else {
      this.challengeForm.get('idealSolution.value')?.setValue('');
    }
  }

  dateMinValidator(minDate: string): Validators {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Don't validate if no date is selected, handled by Validators.required
      }
      const selectedDate = new Date(control.value);
      const minValidDate = new Date(minDate);
      minValidDate.setHours(0, 0, 0, 0); // Normalize to start of day

      return selectedDate >= minValidDate ? null : { minDate: { valid: false } };
    };
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

  getControlStatus(
    controlName: string,
    parentGroup?: FormGroup
  ): 'error' | 'warning' | 'success' | undefined {
    const control = parentGroup
      ? parentGroup.get(controlName)
      : this.challengeForm.get(controlName);
    if (control?.invalid && control?.touched) {
      return 'error';
    }
    return undefined;
  }

  // Helper method for nested form groups
  getNestedControlStatus(path: string): 'error' | 'warning' | 'success' | undefined {
    const control = this.challengeForm.get(path);
    if (control?.invalid && control?.touched) {
      return 'error';
    }
    return undefined;
  }

  async onSubmit(status: 'draft' | 'published') {
    this.challengeForm.markAllAsTouched();
    this.challengeForm.get('aiConfig')?.markAllAsTouched();
    this.challengeForm.get('idealSolution')?.markAllAsTouched();

    if (this.selectedTags.length === 0) {
      this.submitError = 'Please select at least one tag/skill.';
      return;
    }
    if (!this.selectedCategory) {
      this.submitError = 'Please select a category.';
      return;
    }
    if (!this.selectedDifficulty) {
      this.submitError = 'Please select a difficulty level.';
      return;
    }
    if (!this.selectedSubmissionType) {
      this.submitError = 'Please select a submission type.';
      return;
    }

    if (!this.challengeForm.valid) {
      this.submitError = 'Please fill all required fields correctly.';
      console.error('Form is invalid:', this.challengeForm.errors);
      Object.keys(this.challengeForm.controls).forEach((key) => {
        const control = this.challengeForm.get(key);
        if (control?.invalid) {
          console.log('Control: ' + key + ', Errors: ' + JSON.stringify(control.errors));
        }
      });
      const aiConfigGroup = this.challengeForm.get('aiConfig') as FormGroup;
      if (aiConfigGroup && aiConfigGroup.invalid) {
        console.error('AI Config is invalid:', aiConfigGroup.errors);
        Object.keys(aiConfigGroup.controls).forEach((key) => {
          const control = aiConfigGroup.get(key);
          if (control?.invalid) {
            console.log(
              'AI Config Control: ' + key + ', Errors: ' + JSON.stringify(control.errors)
            );
          }
        });
      }
      const idealSolutionGroup = this.challengeForm.get('idealSolution') as FormGroup;
      if (idealSolutionGroup && idealSolutionGroup.invalid) {
        console.error('Ideal Solution is invalid:', idealSolutionGroup.errors);
        Object.keys(idealSolutionGroup.controls).forEach((key) => {
          const control = idealSolutionGroup.get(key);
          if (control?.invalid) {
            console.log(
              'Ideal Solution Control: ' + key + ', Errors: ' + JSON.stringify(control.errors)
            );
          }
        });
      }

      return;
    }

    console.log('Frontend validation passed. Constructing payload...');

    const formValue = this.challengeForm.value;

    const payload: any = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      difficulty: formValue.difficulty,
      type: 'job',
      submissionType: formValue.submissionType,
      deadline: formValue.deadline,
      salary: formValue.salary,
      additionalInfo: formValue.additionalInfo,
      tags: formValue.tags,
      requirements: formValue.requirements,
      evaluationCriteria: formValue.evaluationCriteria,
      deliverables: formValue.deliverables,
      idealSolution: {
        type: formValue.idealSolution.type,
        value: formValue.idealSolution.value,
      },
      aiConfig: {
        pricingTier: formValue.aiConfig.pricingTier,
        autoEvaluate: formValue.aiConfig.autoEvaluate,
        requireVideoTranscript: formValue.aiConfig.requireVideoTranscript,
      },
      status: status,
    };

    if (formValue.aiConfig.pricingTier === 'custom' && formValue.aiConfig.selectedModel) {
      payload.aiConfig.selectedModel = formValue.aiConfig.selectedModel;
    } else if (this.selectedAiModel) {
      payload.aiConfig.selectedModel = this.selectedAiModel.id;
    }

    console.log('Final payload being sent to backend:', payload);

    try {
      this.isSubmitting = true;
      this.submitError = '';
      await firstValueFrom(this.http.post(`${environment.apiUrl}/challenges`, payload));
      this.submitSuccess = true;
      setTimeout(() => this.router.navigate(['/dashboard/company/overview']), 4000);
    } catch (error: any) {
      console.error('Error creating challenge (from backend):', error);
      this.submitError = error?.error?.message || 'Failed to create challenge';
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/company/overview']);
  }
}
