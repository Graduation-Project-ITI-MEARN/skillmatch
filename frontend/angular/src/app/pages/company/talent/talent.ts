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

type CategoryFilter = 'ALL' | 'CODING' | 'DESIGN' | 'MARKETING';

interface TalentProfile {
  id: number;
  name: string;
  initials: string;
  role: string;
  score: number;
  challengesCompleted: number;
  skills: string[];
  status: 'available' | 'engaged';
  category: 'CODING' | 'DESIGN' | 'MARKETING';
}

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

  categoryFilter: CategoryFilter = 'ALL';
  categories: CategoryFilter[] = ['ALL', 'CODING', 'DESIGN', 'MARKETING'];
isRtl: any;

  async ngOnInit() {
    await this.loadTalent();
  }

  private async loadTalent() {
    try {
      this.isLoading = true;
      const response = await firstValueFrom(
        this.http.get<TalentProfile[]>(`${environment.apiUrl}/talent`)
      );
      this.talentList = response ?? [];
      this.applyFilters();
    } catch (error) {
      console.error('Error loading talent:', error);
      this.talentList = [];
      this.filteredTalentList = [];
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    let results = [...this.talentList];

    // Filter by category
    if (this.categoryFilter !== 'ALL') {
      results = results.filter(p => p.category === this.categoryFilter);
    }

    // Filter by search query
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      results = results.filter(
        (person) =>
          person.name.toLowerCase().includes(query) ||
          person.role.toLowerCase().includes(query) ||
          person.skills.some((skill) => skill.toLowerCase().includes(query))
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
    this.categoryFilter = 'ALL';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery !== '' || this.categoryFilter !== 'ALL';
  }

  viewProfile(id: number) {
    console.log('View profile:', id);
  }

  contactPerson(id: number) {
    console.log('Contact person:', id);
  }
}
