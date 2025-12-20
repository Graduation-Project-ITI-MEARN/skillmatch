import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
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

// Custom validator for future dates only
export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  if (selectedDate < today) {
    return { pastDate: true };
  }
  return null;
}

@Component({
  selector: 'app-create-challenge',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, LucideAngularModule],
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

  categories = ['CODING', 'DESIGN', 'MARKETING', 'DATA_SCIENCE', 'PRODUCT_MANAGEMENT'];
  difficultyLevels = ['easy', 'medium', 'hard'];
  challengeTypes = ['job', 'prize'];

  // All available skills by category
  allSkills = {
    CODING: [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C#',
      'C++',
      'PHP',
      'Ruby',
      'Go',
      'Rust',
      'React',
      'Angular',
      'Vue.js',
      'Next.js',
      'Svelte',
      'Node.js',
      'Express',
      'NestJS',
      'Django',
      'Flask',
      'FastAPI',
      'Spring Boot',
      'Laravel',
      'Ruby on Rails',
      'HTML',
      'CSS',
      'Sass',
      'Tailwind CSS',
      'Bootstrap',
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'Firebase',
      'Supabase',
      'REST API',
      'GraphQL',
      'WebSocket',
      'gRPC',
      'Git',
      'Docker',
      'Kubernetes',
      'CI/CD',
      'AWS',
      'Azure',
      'GCP',
      'Jest',
      'Cypress',
      'Selenium',
      'Unit Testing',
      'Microservices',
      'System Design',
      'Data Structures',
      'Algorithms',
    ],
    DESIGN: [
      'Figma',
      'Adobe XD',
      'Sketch',
      'InVision',
      'Framer',
      'Photoshop',
      'Illustrator',
      'After Effects',
      'Premiere Pro',
      'UI Design',
      'UX Design',
      'User Research',
      'Wireframing',
      'Prototyping',
      'Design Systems',
      'Component Libraries',
      'Style Guides',
      'Motion Design',
      'Animation',
      '3D Design',
      'Blender',
      'Typography',
      'Color Theory',
      'Layout Design',
      'Grid Systems',
      'Responsive Design',
      'Mobile Design',
      'Web Design',
      'Branding',
      'Logo Design',
      'Visual Identity',
      'Usability Testing',
      'A/B Testing',
      'User Flows',
      'Accessibility Design',
      'Inclusive Design',
    ],
    MARKETING: [
      'SEO',
      'SEM',
      'Google Ads',
      'Facebook Ads',
      'LinkedIn Ads',
      'Twitter Ads',
      'Content Marketing',
      'Content Strategy',
      'Copywriting',
      'Storytelling',
      'Social Media Marketing',
      'Community Management',
      'Influencer Marketing',
      'Email Marketing',
      'Marketing Automation',
      'Mailchimp',
      'HubSpot',
      'Analytics',
      'Google Analytics',
      'Data Analysis',
      'Marketing Analytics',
      'Growth Hacking',
      'Growth Marketing',
      'Performance Marketing',
      'Brand Strategy',
      'Brand Management',
      'Brand Positioning',
      'Customer Research',
      'Market Research',
      'Competitive Analysis',
      'CRM',
      'Lead Generation',
      'Conversion Optimization',
      'Product Marketing',
      'Go-to-Market Strategy',
      'PR',
      'Public Relations',
      'Media Relations',
    ],
    DATA_SCIENCE: [
      'Python',
      'R',
      'SQL',
      'Scala',
      'Julia',
      'Pandas',
      'NumPy',
      'SciPy',
      'Matplotlib',
      'Seaborn',
      'Machine Learning',
      'Deep Learning',
      'Neural Networks',
      'TensorFlow',
      'PyTorch',
      'Keras',
      'Scikit-learn',
      'Natural Language Processing',
      'Computer Vision',
      'NLP',
      'Data Mining',
      'Data Cleaning',
      'Data Preprocessing',
      'Data Visualization',
      'Tableau',
      'Power BI',
      'Looker',
      'Big Data',
      'Hadoop',
      'Spark',
      'Kafka',
      'Statistics',
      'Probability',
      'Statistical Modeling',
      'A/B Testing',
      'Hypothesis Testing',
      'Experimentation',
      'Time Series Analysis',
      'Forecasting',
      'Predictive Modeling',
      'AWS SageMaker',
      'Azure ML',
      'Google Cloud AI',
      'Feature Engineering',
      'Model Deployment',
      'MLOps',
    ],
    PRODUCT_MANAGEMENT: [
      'Product Strategy',
      'Product Roadmap',
      'Product Vision',
      'User Stories',
      'Backlog Management',
      'Prioritization',
      'Agile',
      'Scrum',
      'Kanban',
      'Sprint Planning',
      'Jira',
      'Confluence',
      'Asana',
      'Trello',
      'Monday.com',
      'User Research',
      'User Interviews',
      'Customer Feedback',
      'Data Analysis',
      'Product Analytics',
      'Metrics',
      'KPIs',
      'A/B Testing',
      'Experimentation',
      'Feature Testing',
      'Wireframing',
      'Prototyping',
      'Product Design',
      'Go-to-Market Strategy',
      'Product Launch',
      'Product Marketing',
      'Stakeholder Management',
      'Communication',
      'Leadership',
      'Technical Understanding',
      'API Knowledge',
      'System Design',
      'Competitive Analysis',
      'Market Research',
      'Business Strategy',
      'OKRs',
      'North Star Metrics',
      'Product-Market Fit',
    ],
  };

  selectedTags: string[] = [];
  skillSearchQuery = '';
  openSkillsDropdown = false;

  benefits = [
    { title: 'CHALLENGE.CREATE.BENEFIT_1_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_1_DESC' },
    { title: 'CHALLENGE.CREATE.BENEFIT_2_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_2_DESC' },
    { title: 'CHALLENGE.CREATE.BENEFIT_3_TITLE', desc: 'CHALLENGE.CREATE.BENEFIT_3_DESC' },
  ];

  // Dropdown states
  selectedCategory: string | null = null;
  openCategory = false;

  selectedDifficulty: string | null = null;
  openDifficulty = false;

  selectedType: string | null = null;
  openType = false;
  minDate!: string;

  ngOnInit() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      type: ['', Validators.required],
      deadline: ['', [Validators.required, futureDateValidator]], // Validator موجود
      salary: [null],
      prizeAmount: [null],
      additionalInfo: [''],
      tags: [[], Validators.required],
    });

    // Watch type changes to show/hide salary/prize fields
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

  // Get available skills based on selected category
  get availableSkills(): string[] {
    if (!this.selectedCategory) {
      // If no category selected, show all skills
      return Object.values(this.allSkills).flat();
    }
    return this.allSkills[this.selectedCategory as keyof typeof this.allSkills] || [];
  }

  // Filter skills based on search query
  get filteredSkills(): string[] {
    const query = this.skillSearchQuery.toLowerCase().trim();
    if (!query) {
      return this.availableSkills;
    }
    return this.availableSkills.filter((skill) => skill.toLowerCase().includes(query));
  }

  toggleSkill(skill: string) {
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(skill);
    }
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
  }

  removeSkill(skill: string) {
    const index = this.selectedTags.indexOf(skill);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    }
    this.challengeForm.get('tags')?.setValue(this.selectedTags);
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedTags.includes(skill);
  }

  clearSkillSearch() {
    this.skillSearchQuery = '';
  }

  async onSubmit() {
  // 1️⃣ تحقق من صحة الفورم
  if (this.challengeForm.invalid || this.selectedTags.length === 0) {
    this.challengeForm.markAllAsTouched();
    this.submitError = 'Please fill all required fields';
    return;
  }

  // 2️⃣ تحقق من صحة القيم الأساسية قبل الإرسال
  const validCategories = [
    "Development",
    "Design",
    "Marketing",
    "Writing",
    "Translation",
    "Data Entry"
  ];
  const validDifficulties = ["easy", "medium", "hard"];
  const validTypes = ["job", "prize"];

  if (!validCategories.includes(this.selectedCategory!)) {
    this.submitError = 'Invalid category selected';
    return;
  }

  if (!validDifficulties.includes(this.selectedDifficulty!)) {
    this.submitError = 'Invalid difficulty selected';
    return;
  }

  if (!validTypes.includes(this.selectedType!)) {
    this.submitError = 'Invalid type selected';
    return;
  }

  // 3️⃣ تجهيز الـ payload
  const payload: any = {
    title: this.challengeForm.value.title,
    description: this.challengeForm.value.description,
    category: this.selectedCategory,
    difficulty: this.selectedDifficulty,
    type: this.selectedType,
    deadline: new Date(this.challengeForm.value.deadline).toISOString(),
    tags: this.selectedTags,
    additionalInfo: this.challengeForm.value.additionalInfo || undefined,
    status: 'draft',
  };

  // 4️⃣ ضبط الحقول الخاصة بالنوع
  if (payload.type === 'job') {
    payload.salary = Number(this.challengeForm.value.salary);
  } else if (payload.type === 'prize') {
    payload.prizeAmount = Number(this.challengeForm.value.prizeAmount);
  }

  console.log('FINAL PAYLOAD SENT 👉', payload);

  // 5️⃣ إرسال البيانات
  try {
    this.isSubmitting = true;
    this.submitError = '';
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/challenges`, payload)
    );

    this.submitSuccess = true;
    setTimeout(() => {
      this.router.navigate(['/dashboard/company/overview']);
    }, 2000);
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
