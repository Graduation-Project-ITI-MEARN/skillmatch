import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  Search,
  Filter,
  Star,
  MessageSquare,
  X,
} from 'lucide-angular';
import { environment } from 'src/environments/environment';

interface TalentProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  totalScore: number;
  challengesCompleted: number;
  skills: string[];
  status: 'available' | 'engaged';
  role?: string;
}

type CategoryFilter = 'all' | 'coding' | 'design' | 'marketing';

@Component({
  selector: 'app-talent-pool',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './talent.html',
  styleUrls: ['./talent.css'],
})
export class Talent implements OnInit {
  private http = inject(HttpClient);

  icons = { Search, Filter, Star, MessageSquare, X };

  talentList: TalentProfile[] = [];
  filteredTalentList: TalentProfile[] = [];
  searchQuery = '';
  isLoading = false;
  showFilterDropdown = false;

  categoryFilter: CategoryFilter = 'all';
  categories: CategoryFilter[] = ['all', 'coding', 'design', 'marketing' ];

  async ngOnInit() {
    await this.loadTalent();
  }

  private async loadTalent() {
  try {
    this.isLoading = true;
    // جربي إضافة /talent مرة أخرى في نهاية الرابط
    const response: any = await firstValueFrom(
      this.http.get(`${environment.apiUrl}/talent/talent`)
    );

    this.talentList = response.data || [];
    this.applyFilters();
  } catch (error) {
    console.error('Error loading talent:', error);
  } finally {
    this.isLoading = false;
  }
}

  applyFilters() {
    let results = [...this.talentList];

    // Filter by category
    if (this.categoryFilter !== 'all') {
      results = results.filter(p =>
        p.skills?.some(skill =>
          skill.toLowerCase().includes(this.categoryFilter)
        )
      );
    }

    // Filter by search query
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      results = results.filter(
        (person) =>
          person.name.toLowerCase().includes(query) ||
          person.email.toLowerCase().includes(query) ||
          person.role?.toLowerCase().includes(query) ||
          person.skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    this.filteredTalentList = results;
  }

  onSearchChange() {
    this.applyFilters();
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  selectCategory(category: CategoryFilter) {
    this.categoryFilter = category;
    this.showFilterDropdown = false;
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.categoryFilter = 'all';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery !== '' || this.categoryFilter !== 'all';
  }

  getCandidateInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  viewProfile(id: string) {
    console.log('View profile:', id);
    // TODO: Navigate to profile page
  }

  contactPerson(id: string) {
    console.log('Contact person:', id);
    // TODO: Open contact modal
  }
}
