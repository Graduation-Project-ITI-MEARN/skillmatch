import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCalendarComponent } from '@/shared/components/zard-ui/calendar/calendar.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
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
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@/core/services/auth';

@Component({
  selector: 'app-create-challenge',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    LucideAngularModule,
    ZardCalendarComponent,
    // Removed Zard UI imports like ZardSelectImports, ZardInputDirective, ZardCalendarComponent
  ],
  templateUrl: './create-challenge.html',
  styleUrls: ['./create-challenge.css'], // You might need to add custom dropdown CSS here
})
export class CreateChallenge implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private challengeService = inject(ChallengeService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  // Add these properties
  showSubscriptionModal = false;
  subscriptionMessage = '';

  icons = { ArrowLeft, CheckCircle, AlertCircle, ChevronDown, Search, X };
  challengeForm!: FormGroup;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  categories: string[] = [];
  allSkills: string[] = []; // Assuming a flat list from service
  aiModels: IAiModel[] = [];
  aiPricingTiers: IPricingTierDetails[] = [];

  difficultyLevels = ['easy', 'medium', 'hard'];
  submissionTypes: SubmissionType[] = ['link', 'file', 'text'];
  idealSolutionTypes: IdealSolutionType[] = ['link', 'file', 'text'];

  selectedTags: string[] = [];
  minDate!: Date; // For native HTML date input 'min' attribute
  skillSearchQuery = '';

  // Dropdown open/close flags
  openCategory = false;
  openDifficulty = false;
  openSubmissionType = false;
  openIdealSolutionType = false;
  openSkillsDropdown = false;
  openPricingTier = false;
  openAiModel = false;

  benefits = [
    { title: 'CHALLENGE.CREATE.BENEFIT_1_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_1_DESC' },
    { title: 'CHALLENGE.CREATE.BENEFIT_2_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_2_DESC' },
    { title: 'CHALLENGE.CREATE.BENEFIT_3_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_3_DESC' },
  ];

  selectedCategory = ''; // Must be initialized to a string
  selectedDifficulty = ''; // Must be initialized to a string
  selectedSubmissionType: SubmissionType = 'link';
  selectedIdealSolutionType: IdealSolutionType = 'link';
  selectedPricingTier: PricingTier = 'free';
  selectedAiModel: IAiModel | null = null;
  selectedAiModelId = '';

  ngOnInit() {
    this.fetchMetadata();

    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum date is tomorrow
    this.minDate = today; // Format as YYYY-MM-DD for native input

    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      category: [this.selectedCategory, Validators.required],
      difficulty: [this.selectedDifficulty, Validators.required],
      type: ['job'], // Fixed to 'job'
      submissionType: [this.selectedSubmissionType, Validators.required],
      deadline: [null as Date | null, [Validators.required, this.dateMinValidator(this.minDate)]], // Custom validator for min date with native input
      salary: [null as number | null, [Validators.required, Validators.min(1000)]],
      additionalInfo: [''],
      tags: [[], Validators.required],
      requirements: ['', [Validators.required, Validators.minLength(10)]],
      evaluationCriteria: ['', [Validators.required, Validators.minLength(10)]],
      deliverables: ['', [Validators.required, Validators.minLength(10)]],
      idealSolution: this.fb.group({
        type: [this.selectedIdealSolutionType, Validators.required],
        value: ['', Validators.required], // Add initial required for "value"
      }),
      aiConfig: this.fb.group({
        pricingTier: [this.selectedPricingTier, Validators.required],
        selectedModel: [this.selectedAiModelId, Validators.required],
        autoEvaluate: [true],
        requireVideoTranscript: [false],
      }),
    });

    // Initialize selected values from form controls (if any default values are set)
    this.selectedCategory = this.challengeForm.get('category')?.value;
    this.selectedDifficulty = this.challengeForm.get('difficulty')?.value;
    this.selectedSubmissionType = this.challengeForm.get('submissionType')?.value;
    this.selectedIdealSolutionType = this.challengeForm.get('idealSolution.type')?.value;
    this.selectedPricingTier = this.challengeForm.get('aiConfig.pricingTier')?.value;
    this.selectedAiModelId = this.challengeForm.get('aiConfig.selectedModel')?.value;

    // --- Ideal Solution Type Logic ---
    this.challengeForm
      .get('idealSolution.type')
      ?.valueChanges.subscribe((type: IdealSolutionType) => {
        this.selectedIdealSolutionType = type;
        const idealSolutionValueControl = this.challengeForm.get('idealSolution.value');
        idealSolutionValueControl?.setValue(''); // Clear value when type changes

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
          idealSolutionValueControl?.clearValidators(); // Should not happen with defined types
        }
        idealSolutionValueControl?.updateValueAndValidity();
        idealSolutionValueControl?.markAsTouched(); // Trigger validation UI feedback
      });

    // --- AI Config Pricing Tier Logic ---
    this.challengeForm.get('aiConfig.pricingTier')?.valueChanges.subscribe((tier: PricingTier) => {
      this.selectedPricingTier = tier;
      const selectedModelControl = this.challengeForm.get('aiConfig.selectedModel');

      if (tier === 'custom') {
        selectedModelControl?.setValidators(Validators.required);
        this.selectedAiModel = null;
        this.selectedAiModelId = '';
        selectedModelControl?.setValue(''); // Clear selected model
      } else {
        const tierDetails = this.aiPricingTiers.find((t) => t.tier === tier);
        if (tierDetails) {
          const defaultModel = this.aiModels.find((m) => m.id === tierDetails.defaultModel);
          this.selectedAiModel = defaultModel || null;
          this.selectedAiModelId = defaultModel?.id || '';
          selectedModelControl?.setValue(defaultModel?.id || '');
          selectedModelControl?.clearValidators();
        } else {
          this.selectedAiModel = null;
          this.selectedAiModelId = '';
          selectedModelControl?.setValue('');
          selectedModelControl?.clearValidators();
        }
      }
      selectedModelControl?.updateValueAndValidity();
      selectedModelControl?.markAsTouched(); // Trigger validation UI feedback
    });

    // Update selectedAiModel when selectedAiModelId changes
    this.challengeForm.get('aiConfig.selectedModel')?.valueChanges.subscribe((modelId) => {
      this.selectedAiModelId = modelId;
      this.selectedAiModel = this.aiModels.find((m) => m.id === modelId) || null;
    });

    // Trigger initial validation for idealSolution and aiConfig
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
        // Set initial category if not already set, e.g., to the first one
        if (!this.selectedCategory && this.categories.length > 0) {
          this.selectCategory(this.categories[0]);
        }
      }
      if (skillsRes.success) {
        this.allSkills = skillsRes.data;
      }
      if (aiModelsRes.success) {
        this.aiModels = aiModelsRes.data.models;
        this.aiPricingTiers = aiModelsRes.data.pricingTiers;

        // Set default AI model for 'free' tier on load
        const freeTier = this.aiPricingTiers.find((t) => t.tier === 'free');
        if (freeTier) {
          const defaultModel = this.aiModels.find((m) => m.id === freeTier.defaultModel);
          this.selectedAiModel = defaultModel || null;
          this.selectedAiModelId = defaultModel?.id || '';
          this.challengeForm.get('aiConfig.selectedModel')?.setValue(defaultModel?.id || '');
        }
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      this.submitError = 'Failed to load challenge metadata. Please try again.';
    }
  }

  get filteredSkills(): string[] {
    const query = this.skillSearchQuery.toLowerCase().trim();
    if (!query) return this.allSkills;
    return this.allSkills.filter((skill) => skill.toLowerCase().includes(query));
  }

  // --- Dropdown Selectors ---
  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.challengeForm.get('category')?.setValue(cat);
    this.challengeForm.get('category')?.markAsTouched();
    this.openCategory = false;
  }

  selectDifficulty(level: string) {
    this.selectedDifficulty = level;
    this.challengeForm.get('difficulty')?.setValue(level);
    this.challengeForm.get('difficulty')?.markAsTouched();
    this.openDifficulty = false;
  }

  selectSubmissionType(type: SubmissionType) {
    this.selectedSubmissionType = type;
    this.challengeForm.get('submissionType')?.setValue(type);
    this.challengeForm.get('submissionType')?.markAsTouched();
    this.openSubmissionType = false;
  }

  selectIdealSolutionType(type: IdealSolutionType) {
    this.selectedIdealSolutionType = type;
    this.challengeForm.get('idealSolution.type')?.setValue(type);
    this.challengeForm.get('idealSolution.type')?.markAsTouched();
    this.openIdealSolutionType = false;
  }

  showUpgradeModal = false;
  upgradeMessage = '';
  requiredPlan: 'professional' | 'enterprise' = 'professional';

  selectPricingTier(tier: PricingTier) {
    this.selectedPricingTier = tier;
    this.challengeForm.get('aiConfig.pricingTier')?.setValue(tier);
    this.challengeForm.get('aiConfig.pricingTier')?.markAsTouched();
    this.openPricingTier = false;

    // Check if user can use this tier
    if (tier === 'custom') {
      if (!this.canUseCustomAIModels()) {
        this.showUpgradeModal = true;
        this.upgradeMessage =
          'Premium AI models require a Professional or Enterprise subscription. Upgrade now to unlock advanced AI capabilities including GPT-4, Claude Sonnet, and custom model selection.';
        this.requiredPlan = 'professional';

        // Revert to free tier
        setTimeout(() => {
          if (this.showUpgradeModal) {
            this.selectPricingTier('free');
          }
        }, 100);
      }
    }
  }

  canUseCustomAIModels(): boolean {
    return this.challengeService.canUseCustomAIModels();
  }

  navigateToUpgrade() {
    this.showUpgradeModal = false;
    this.router.navigate(['/dashboard/company/subscription'], {
      queryParams: { upgrade: this.requiredPlan },
    });
  }

  closeUpgradeModal() {
    this.showUpgradeModal = false;
    this.selectPricingTier('free'); // Reset to free tier
  }

  selectAiModel(modelId: string) {
    this.selectedAiModel = this.aiModels.find((m) => m.id === modelId) || null;
    this.selectedAiModelId = modelId;
    this.challengeForm.get('aiConfig.selectedModel')?.setValue(modelId);
    this.challengeForm.get('aiConfig.selectedModel')?.markAsTouched();
    this.openAiModel = false;
  }

  // --- Skill Management ---
  toggleSkill(skill: string) {
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(skill);
    }
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
    this.challengeForm.get('tags')?.markAsTouched(); // Ensure validation state updates
  }

  removeSkill(skill: string) {
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    }
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
    this.challengeForm.get('tags')?.markAsTouched(); // Ensure validation state updates
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedTags.includes(skill);
  }

  clearSkillSearch() {
    this.skillSearchQuery = '';
  }

  // --- Native Date Input Validator ---
  dateMinValidator(minDateString: Date) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Don't validate if no date is selected, handled by Validators.required
      }
      const selectedDate = new Date(control.value);
      const minValidDate = new Date(minDateString);
      minValidDate.setHours(0, 0, 0, 0); // Normalize to start of day

      return selectedDate >= minValidDate
        ? null
        : { minDate: { valid: false, requiredMinDate: minDateString, actualDate: control.value } };
    };
  }

  // --- File Handling ---
  handleIdealSolutionFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // In a real application, you'd upload the file and store a URL/ID.
      // For form validation, we're just checking if a file was selected.
      this.challengeForm.get('idealSolution.value')?.setValue(file.name);
    } else {
      this.challengeForm.get('idealSolution.value')?.setValue('');
    }
    this.challengeForm.get('idealSolution.value')?.markAsTouched(); // Trigger validation
  }

  get hasActiveSubscription(): boolean {
    const isSubscribed = this.authService.isSubscribed; // Or however you get current user
    return isSubscribed;
  }

  async onSubmit(status: 'draft' | 'published') {
    // NEW: Check subscription BEFORE validation if publishing
    if (status === 'published' && !this.hasActiveSubscription) {
      this.showSubscriptionModal = true;
      this.subscriptionMessage =
        'An active subscription is required to publish challenges. Subscribe now to unlock unlimited challenge creation with premium AI evaluation.';
      return; // Stop here, don't submit
    }

    this.challengeForm.markAllAsTouched();

    // Explicit check for tags
    if (this.selectedTags.length === 0) {
      this.challengeForm.get('tags')?.setErrors({ required: true });
      this.challengeForm.get('tags')?.markAsTouched();
    } else {
      this.challengeForm.get('tags')?.setErrors(null);
    }

    if (!this.challengeForm.valid) {
      this.submitError = this.translate.instant('CHALLENGE.FORM.GENERIC_ERROR_MESSAGE');
      console.error('Form is invalid. Details:', this.challengeForm.errors);
      // Detailed logging
      Object.keys(this.challengeForm.controls).forEach((key) => {
        const control = this.challengeForm.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach((subKey) => {
            const subControl = control.get(subKey);
            if (subControl?.invalid) {
              console.log(`Nested Control: ${key}.${subKey}, Errors:`, subControl.errors);
            }
          });
        } else if (control?.invalid) {
          console.log(`Control: ${key}, Errors:`, control.errors);
        }
      });
      return;
    }

    console.log('Frontend validation passed. Constructing payload...');

    const formValue = this.challengeForm.getRawValue();

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

    if (formValue.aiConfig.pricingTier === 'custom') {
      payload.aiConfig.selectedModel = formValue.aiConfig.selectedModel;
    } else if (this.selectedAiModel) {
      payload.aiConfig.selectedModel = this.selectedAiModel.id;
    } else {
      console.warn('No AI model selected for non-custom pricing tier or default not found.');
    }

    console.log('Final payload being sent to backend:', payload);

    try {
      this.isSubmitting = true;
      this.submitError = '';

      await firstValueFrom(this.http.post(`${environment.apiUrl}/challenges`, payload));

      this.submitSuccess = true;
      setTimeout(() => this.router.navigate(['/dashboard/company/overview']), 4000);
    } catch (error: any) {
      console.error('Error creating challenge:', error);

      if (error?.error?.code === 'SUBSCRIPTION_REQUIRED') {
        this.showSubscriptionModal = true;
        this.subscriptionMessage =
          'Active subscription required to publish challenges. Subscribe now to start hiring top talent.';
      } else if (error?.error?.code === 'SUBSCRIPTION_EXPIRED') {
        this.showSubscriptionModal = true;
        this.subscriptionMessage =
          'Your subscription has expired. Renew now to continue publishing challenges.';
      } else if (error?.error?.code === 'PREMIUM_AI_REQUIRES_SUBSCRIPTION') {
        this.submitError = 'Premium AI models require subscription upgrade.';
        this.showUpgradeModal = true;
      } else {
        this.submitError = error?.error?.message || 'Failed to create challenge';
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  // Add method to navigate to subscription
  navigateToSubscription() {
    this.showSubscriptionModal = false;
    this.router.navigate(['/dashboard/company/subscription']);
  }

  closeSubscriptionModal() {
    this.showSubscriptionModal = false;
  }

  goBack() {
    this.router.navigate(['/dashboard/company/overview']);
  }
}
