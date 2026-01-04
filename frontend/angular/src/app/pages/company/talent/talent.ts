import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, Search, Filter, Star, MessageSquare, X } from 'lucide-angular';
import { environment } from 'src/environments/environment';
import { Router, RouterModule } from '@angular/router';

interface TalentProfile {
  _id?: string; // This needs to be provided by the backend
  rank?: number;
  name: string;
  score: number;
  challengesCompleted: number;
  type?: string;
  email?: string; // This needs to be provided by the backend
  profilePicture?: string;
  skills?: string[];
  status?: 'available' | 'engaged';
  role?: string;
}

@Component({
  selector: 'app-talent-pool',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LucideAngularModule, RouterModule],
  templateUrl: './talent.html',
})
export class Talent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  icons = { Search, Filter, Star, MessageSquare, X };

  talentList: TalentProfile[] = [];
  filteredTalentList: TalentProfile[] = [];
  searchQuery = '';
  isLoading = false;
  showFilterDropdown = false;

  categoryFilter: string = 'all';
  categories: string[] = ['all'];

  async ngOnInit() {
    await this.loadCategories();
    await this.loadTalent();
  }

  private async loadCategories() {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/metadata/categories`)
      );
      if (response.success && Array.isArray(response.data)) {
        this.categories = ['all', ...response.data];
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = ['all', 'Development', 'Design', 'Marketing', 'Writing'];
    }
  }

  private async loadTalent() {
    try {
      this.isLoading = true;

      let params: any = {};

      if (this.categoryFilter !== 'all') {
        params.category = this.categoryFilter;
      }

      if (this.searchQuery) {
        params.name = this.searchQuery;
      }

      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/leaderboard`, { params })
      );

      if (response.success && Array.isArray(response.data)) {
        this.talentList = response.data.map((item: any) => ({
          ...item,
          _id: item._id || item.id || undefined,
          email: item.email || undefined,
          profilePicture: item.profilePicture || '',
          skills: item.skills || [],
          status: item.status || 'available',
          role: item.role || '',
        }));
        console.log('Fetched leaderboard data:', this.talentList);
      } else {
        this.talentList = [];
      }
      this.filteredTalentList = this.talentList;
    } catch (error) {
      console.error('Error loading talent:', error);
      this.talentList = [];
      this.filteredTalentList = [];
    } finally {
      this.isLoading = false;
    }
  }

  // New method to construct the external portfolio link
  getPortfolioLink(id: string): string {
    return `${environment.nextJsUrl}/leaderboard/${id}`;
  }

  applyFilters() {
    this.loadTalent();
  }

  onSearchChange() {
    this.applyFilters();
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  selectCategory(category: string) {
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
}
