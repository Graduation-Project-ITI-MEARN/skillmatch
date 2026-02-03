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
import { AuthService } from '@/core/services/auth';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentIframe } from '@shared/components/payment-iframe/payment-iframe';
import {
  SubmissionType,
  IdealSolutionType,
  PricingTier,
  IAiModel,
  IPricingTierDetails,
} from '../../../shared/models/challenge.model';

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
    MatDialogModule,
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
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

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
  minDate!: Date;
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

  selectedCategory = '';
  selectedDifficulty = '';
  selectedSubmissionType: SubmissionType = 'link';
  selectedIdealSolutionType: IdealSolutionType = 'link';
  selectedPricingTier: PricingTier = 'free';
  selectedAiModel: IAiModel | null = null;
  selectedAiModelId = '';

  // Subscription Modal Properties
  showSubscriptionModal = false;
  subscriptionMessage = '';
  selectedPlanForModal: string | null = null;

  // Subscription plans for the modal
  subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 299,
      features: ['Create unlimited challenges', 'Basic AI evaluation', 'Standard support'],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 599,
      recommended: true,
      features: [
        'Everything in Basic',
        'Premium AI models',
        'Priority support',
        'Advanced analytics',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1299,
      features: [
        'Everything in Professional',
        'Custom AI models',
        'Dedicated support',
        'API access',
      ],
    },
  ];

  // Upgrade Modal Properties
  showUpgradeModal = false;
  upgradeMessage = '';
  requiredPlan: 'professional' | 'enterprise' = 'professional';

  ngOnInit() {
    this.fetchMetadata();

    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = today;

    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      category: [this.selectedCategory, Validators.required],
      difficulty: [this.selectedDifficulty, Validators.required],
      type: ['job'],
      submissionType: [this.selectedSubmissionType, Validators.required],
      deadline: [null as Date | null, [Validators.required, this.dateMinValidator(this.minDate)]],
      salary: [null as number | null, [Validators.required, Validators.min(1000)]],
      additionalInfo: [''],
      tags: [[], Validators.required],
      requirements: ['', [Validators.required, Validators.minLength(10)]],
      evaluationCriteria: ['', [Validators.required, Validators.minLength(10)]],
      deliverables: ['', [Validators.required, Validators.minLength(10)]],
      idealSolution: this.fb.group({
        type: [this.selectedIdealSolutionType, Validators.required],
        value: ['', Validators.required],
      }),
      aiConfig: this.fb.group({
        pricingTier: [this.selectedPricingTier, Validators.required],
        selectedModel: [this.selectedAiModelId, Validators.required],
        autoEvaluate: [true],
        requireVideoTranscript: [false],
      }),
    });

    this.selectedCategory = this.challengeForm.get('category')?.value;
    this.selectedDifficulty = this.challengeForm.get('difficulty')?.value;
    this.selectedSubmissionType = this.challengeForm.get('submissionType')?.value;
    this.selectedIdealSolutionType = this.challengeForm.get('idealSolution.type')?.value;
    this.selectedPricingTier = this.challengeForm.get('aiConfig.pricingTier')?.value;
    this.selectedAiModelId = this.challengeForm.get('aiConfig.selectedModel')?.value;

    this.challengeForm
      .get('idealSolution.type')
      ?.valueChanges.subscribe((type: IdealSolutionType) => {
        this.selectedIdealSolutionType = type;
        const idealSolutionValueControl = this.challengeForm.get('idealSolution.value');
        idealSolutionValueControl?.setValue('');

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
        idealSolutionValueControl?.markAsTouched();
      });

    this.challengeForm.get('aiConfig.pricingTier')?.valueChanges.subscribe((tier: PricingTier) => {
      this.selectedPricingTier = tier;
      const selectedModelControl = this.challengeForm.get('aiConfig.selectedModel');

      if (tier === 'custom') {
        selectedModelControl?.setValidators(Validators.required);
        this.selectedAiModel = null;
        this.selectedAiModelId = '';
        selectedModelControl?.setValue('');
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
      selectedModelControl?.markAsTouched();
    });

    this.challengeForm.get('aiConfig.selectedModel')?.valueChanges.subscribe((modelId) => {
      this.selectedAiModelId = modelId;
      this.selectedAiModel = this.aiModels.find((m) => m.id === modelId) || null;
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

  selectPricingTier(tier: PricingTier) {
    this.selectedPricingTier = tier;
    this.challengeForm.get('aiConfig.pricingTier')?.setValue(tier);
    this.challengeForm.get('aiConfig.pricingTier')?.markAsTouched();
    this.openPricingTier = false;

    if (tier === 'custom') {
      if (!this.canUseCustomAIModels()) {
        this.showUpgradeModal = true;
        this.upgradeMessage =
          'Premium AI models require a Professional or Enterprise subscription. Upgrade now to unlock advanced AI capabilities including GPT-4, Claude Sonnet, and custom model selection.';
        this.requiredPlan = 'professional';

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
    this.selectPricingTier('free');
  }

  selectAiModel(modelId: string) {
    this.selectedAiModel = this.aiModels.find((m) => m.id === modelId) || null;
    this.selectedAiModelId = modelId;
    this.challengeForm.get('aiConfig.selectedModel')?.setValue(modelId);
    this.challengeForm.get('aiConfig.selectedModel')?.markAsTouched();
    this.openAiModel = false;
  }

  toggleSkill(skill: string) {
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(skill);
    }
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
    this.challengeForm.get('tags')?.markAsTouched();
  }

  removeSkill(skill: string) {
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    }
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
    this.challengeForm.get('tags')?.markAsTouched();
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedTags.includes(skill);
  }

  clearSkillSearch() {
    this.skillSearchQuery = '';
  }

  dateMinValidator(minDateString: Date) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const selectedDate = new Date(control.value);
      const minValidDate = new Date(minDateString);
      minValidDate.setHours(0, 0, 0, 0);

      return selectedDate >= minValidDate
        ? null
        : { minDate: { valid: false, requiredMinDate: minDateString, actualDate: control.value } };
    };
  }

  handleIdealSolutionFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.challengeForm.get('idealSolution.value')?.setValue(file.name);
    } else {
      this.challengeForm.get('idealSolution.value')?.setValue('');
    }
    this.challengeForm.get('idealSolution.value')?.markAsTouched();
  }

  // Subscription Check
  get hasActiveSubscription(): boolean {
    const user = this.authService.isSubscribed;
    return user;
  }

  // Select plan in modal
  selectPlanInModal(planId: string) {
    this.selectedPlanForModal = planId;
  }

  // Proceed with payment
  async proceedWithPayment() {
    if (!this.selectedPlanForModal) {
      alert('Please select a plan');
      return;
    }

    const plan = this.subscriptionPlans.find((p) => p.id === this.selectedPlanForModal);
    if (!plan) return;

    this.showSubscriptionModal = false;
    this.isSubmitting = true;

    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/payment/create-intent`, {
          amount: plan.price,
          currency: 'EGP',
          payment_type: 'SUBSCRIPTION',
        })
      );

      if (response?.data?.iframeUrl) {
        const dialogRef = this.dialog.open(PaymentIframe, {
          data: {
            url: response.data.iframeUrl,
            planId: plan.id,
          },
          width: '550px',
          maxWidth: '95vw',
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe(async (result) => {
          if (result === 'CHECK_STATUS') {
            this.submitError = '';
            this.submitSuccess = false;

            setTimeout(async () => {
              await firstValueFrom(this.authService.refreshUserProfile());

              if (this.hasActiveSubscription) {
                this.onSubmit('published');
              } else {
                this.submitError = 'Subscription activation pending. Please try again in a moment.';
                this.isSubmitting = false;
              }
            }, 3000);
          } else if (result === 'FAILED') {
            this.submitError = 'Payment failed. Please try again.';
            this.isSubmitting = false;
          }
        });
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      this.submitError = error?.error?.message || 'Failed to initiate payment';
      this.isSubmitting = false;
    }
  }

  closeSubscriptionModal() {
    this.showSubscriptionModal = false;
    this.selectedPlanForModal = null;
  }

  async onSubmit(status: 'draft' | 'published') {
    // Check subscription BEFORE validation if publishing
    if (status === 'published' && !this.hasActiveSubscription) {
      this.showSubscriptionModal = true;
      this.subscriptionMessage =
        'An active subscription is required to publish challenges. Subscribe now to unlock unlimited challenge creation with premium AI evaluation.';
      return;
    }

    this.challengeForm.markAllAsTouched();

    if (this.selectedTags.length === 0) {
      this.challengeForm.get('tags')?.setErrors({ required: true });
      this.challengeForm.get('tags')?.markAsTouched();
    } else {
      this.challengeForm.get('tags')?.setErrors(null);
    }

    if (!this.challengeForm.valid) {
      this.submitError = this.translate.instant('CHALLENGE.FORM.GENERIC_ERROR_MESSAGE');
      console.error('Form is invalid. Details:', this.challengeForm.errors);
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
        this.subscriptionMessage = 'Your subscription has expired. Renew now to continue.';
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

  goBack() {
    this.router.navigate(['/dashboard/company/overview']);
  }
}
