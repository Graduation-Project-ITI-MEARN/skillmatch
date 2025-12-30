import { Component, OnInit, OnDestroy, inject } from '@angular/core'; // Added OnDestroy
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormControl,
  FormsModule,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  LucideAngularModule,
  icons,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  X,
  Search,
  ChevronDown,
} from 'lucide-angular';
import { Router } from '@angular/router';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '@/core/services/auth';
import { IUser, UserService } from '@/core/services/user.service';
import { toObservable } from '@angular/core/rxjs-interop'; // Import toObservable
import { Observable } from 'rxjs';
import { UiCard } from '../ui/ui-card/ui-card.component'; // Import Observable

// Define a placeholder for categories if you don't have a global constant
const ALL_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps',
  'UI/UX Design',
  'Blockchain',
  'Game Development',
  'Artificial Intelligence',
  'Networking',
  'Database Management',
  'Software Testing',
  'Technical Writing',
];

@Component({
  selector: 'app-profile-update',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    LucideAngularModule,
    UiCard,
  ],
  templateUrl: './profile-form.html',
})
export class ProfileUpdateComponent implements OnInit, OnDestroy {
  // Implement OnDestroy
  icons = {
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Trash2,
    Plus,
    X,
    Search,
    ChevronDown,
  };

  profileForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;
  userType: 'candidate' | 'company' | 'challenger' | null = null;

  allSkills = [
    'JavaScript',
    'TypeScript',
    'Angular',
    'React',
    'Vue',
    'Node.js',
    'Python',
    'Java',
    'C#',
    'SQL',
    'MongoDB',
    'AWS',
    'Docker',
    'Kubernetes',
    'Figma',
    'Sketch',
  ];
  filteredSkills: string[] = [];
  skillSearchQuery = '';
  openSkillsDropdown = false;
  allCategories = ALL_CATEGORIES;
  openCategoriesDropdown = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  private destroy$ = new Subject<void>(); // For RxJS cleanup

  // Declare an Observable for the current user
  currentUserObservable: Observable<IUser | null>;

  constructor() {
    // Type assertion here to tell TypeScript that AuthUserResponse is effectively IUser for this context
    this.currentUserObservable = toObservable(
      this.authService.currentUser
    ) as Observable<IUser | null>;
  }

  ngOnInit(): void {
    this.initForm(); // Initialize form structure first

    this.currentUserObservable // This is already `toObservable(this.authService.currentUser)` from constructor
      .pipe(
        // Ensure that the 'user' object is not null AND has a 'type' property.
        // This will prevent reacting to initial 'null' states or temporary incomplete states.
        filter(
          (user): user is IUser => user !== null && user.type !== undefined && user.type !== null
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((user: IUser) => {
        // Now 'user' is guaranteed to be IUser (not null)
        console.log('ProfileUpdateComponent: currentUserObservable emitted (filtered):', user);
        this.userType = user.type as 'candidate' | 'company' | 'challenger'; // user.type is guaranteed to exist and be valid here
        console.log('ProfileUpdateComponent: userType derived (filtered):', this.userType);

        console.log('ProfileUpdateComponent: User type determined:', this.userType);
        this.loadUserProfile(); // Load profile once userType is known
        this.filteredSkills = this.allSkills; // Initialize filtered skills
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ... rest of your component code remains the same ...
  initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      bio: [''],
      city: [''],
    });

    this.profileForm.addControl(
      'github',
      new FormControl('', Validators.pattern('^(http|https)://[^ "]+$'))
    );
    this.profileForm.addControl(
      'linkedin',
      new FormControl('', Validators.pattern('^(http|https)://[^ "]+$'))
    );
    this.profileForm.addControl('otherLinks', this.fb.array([]));
    this.profileForm.addControl('skills', this.fb.array([]));
    this.profileForm.addControl('categoriesOfInterest', this.fb.array([]));
    this.profileForm.addControl(
      'website',
      new FormControl('', Validators.pattern('^(http|https)://[^ "]+$'))
    );
  }

  loadUserProfile(): void {
    this.userService.getMeProfile().subscribe({
      next: (response) => {
        const userProfile = response.data;
        console.log('ProfileUpdateComponent: User profile loaded:', userProfile);

        this.profileForm.patchValue({
          name: userProfile.name,
          email: userProfile.email,
          bio: userProfile.bio,
          city: userProfile.city,
        });

        if (this.userType === 'candidate') {
          this.profileForm.patchValue({
            github: userProfile.github,
            linkedin: userProfile.linkedin,
          });
          userProfile.otherLinks?.forEach((link) => this.addOtherLink(link.name, link.url));
          userProfile.skills?.forEach((skill) => this.toggleSkill(skill, true));
          userProfile.categoriesOfInterest?.forEach((cat) => this.toggleCategory(cat, true));
        } else if (this.userType === 'company') {
          this.profileForm.patchValue({
            website: userProfile.website,
          });
        }
        this.cleanUpIrrelevantFields();
      },
      error: (err) => {
        console.error('ProfileUpdateComponent: Failed to load user profile:', err);
        this.submitError = this.translate.instant('PROFILE.LOAD_ERROR');
        if (err.status === 401 || err.status === 403) {
          this.submitError = this.translate.instant('PROFILE.LOAD_ERROR_NOT_AUTHENTICATED');
          this.router.navigate(['/unauthorized']);
        } else {
          this.submitError = this.translate.instant('PROFILE.LOAD_ERROR_API');
        }
      },
    });
  }

  cleanUpIrrelevantFields(): void {
    if (this.userType === 'candidate') {
      if (this.profileForm.get('website')) {
        this.profileForm.removeControl('website');
      }
    } else if (this.userType === 'company') {
      if (this.profileForm.get('github')) {
        this.profileForm.removeControl('github');
      }
      if (this.profileForm.get('linkedin')) {
        this.profileForm.removeControl('linkedin');
      }
      if (this.profileForm.get('otherLinks')) {
        this.profileForm.removeControl('otherLinks');
      }
      if (this.profileForm.get('skills')) {
        this.profileForm.removeControl('skills');
      }
      if (this.profileForm.get('categoriesOfInterest')) {
        this.profileForm.removeControl('categoriesOfInterest');
      }
    }
  }

  get otherLinks(): FormArray {
    return this.profileForm.get('otherLinks') as FormArray;
  }

  addOtherLink(name: string = '', url: string = ''): void {
    this.otherLinks.push(
      this.fb.group({
        name: [name, Validators.required],
        url: [url, [Validators.required, Validators.pattern('^(http|https)://[^ "]+$')]],
      })
    );
  }

  removeOtherLink(index: number): void {
    this.otherLinks.removeAt(index);
  }

  get skillsArray(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  isSkillSelected(skill: string): boolean {
    return this.skillsArray.value.includes(skill);
  }

  toggleSkill(skill: string, initialLoad: boolean = false): void {
    const skills = this.skillsArray;
    if (this.isSkillSelected(skill)) {
      if (!initialLoad) {
        const index = skills.value.indexOf(skill);
        if (index > -1) {
          skills.removeAt(index);
        }
      }
    } else {
      skills.push(new FormControl(skill));
    }
    if (!initialLoad) {
      this.openSkillsDropdown = true;
    }
  }

  onSkillSearch(query: string): void {
    this.skillSearchQuery = query;
    this.filteredSkills = this.allSkills.filter((skill) =>
      skill.toLowerCase().includes(this.skillSearchQuery.toLowerCase())
    );
  }

  clearSkillSearch(): void {
    this.skillSearchQuery = '';
    this.filteredSkills = this.allSkills;
  }

  get categoriesOfInterestArray(): FormArray {
    return this.profileForm.get('categoriesOfInterest') as FormArray;
  }

  isCategorySelected(category: string): boolean {
    return this.categoriesOfInterestArray.value.includes(category);
  }

  toggleCategory(category: string, initialLoad: boolean = false): void {
    const categories = this.categoriesOfInterestArray;
    if (this.isCategorySelected(category)) {
      if (!initialLoad) {
        const index = categories.value.indexOf(category);
        if (index > -1) {
          categories.removeAt(index);
        }
      }
    } else {
      categories.push(new FormControl(category));
    }
    if (!initialLoad) {
      this.openCategoriesDropdown = true;
    }
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = null;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.isSubmitting = false;
      this.submitError = this.translate.instant('PROFILE.FORM_INVALID_ERROR');
      return;
    }

    const formData = this.profileForm.getRawValue();
    const dataToSend: Partial<IUser> = {};
    Object.keys(formData).forEach((key) => {
      if (this.profileForm.get(key)) {
        (dataToSend as any)[key] = formData[key];
      }
    });

    if (dataToSend.otherLinks && dataToSend.otherLinks.length > 0) {
      dataToSend.otherLinks = dataToSend.otherLinks.filter(
        (link: { name: string; url: string }) => link.name && link.url
      );
    } else if (dataToSend.otherLinks) {
      delete dataToSend.otherLinks;
    }

    if (dataToSend.skills && dataToSend.skills.length === 0) {
      delete dataToSend.skills;
    }
    if (dataToSend.categoriesOfInterest && dataToSend.categoriesOfInterest.length === 0) {
      delete dataToSend.categoriesOfInterest;
    }

    this.userService
      .updateProfile(dataToSend)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.submitSuccess = true;
          console.log('Profile updated successfully!', response.data);
          this.translate.get('PROFILE.UPDATE.SUCCESS_MESSAGE').subscribe((msg) => {
            setTimeout(() => {
              this.submitSuccess = false;
              // this.router.navigate([`/dashboard/${this.userType}/profile`]);
            }, 3000);
          });
          this.authService.refreshUserProfile().subscribe();
        },
        error: (err) => {
          this.submitError = this.translate.instant('PROFILE.UPDATE.ERROR_MESSAGE');
          console.error('Error updating profile:', err);
        },
      });
  }
}
