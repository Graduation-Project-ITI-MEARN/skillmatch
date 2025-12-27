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

type CategoryFilter = 'all' | 'coding' | 'design' | 'marketing' ;

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

    // 1. تجهيز الـ Params لإرسالها للسيرفر
    let params: any = {};

    if (this.categoryFilter !== 'all') {
      // بنبعت التصنيف للباك-إند (تأكد أن الباك-إند بيفهم كلمة skills)
      params.skills = this.categoryFilter;
    }

    if (this.searchQuery) {
      params.name = this.searchQuery; // أو حسب ما الباك-إند بيستقبل البحث
    }

    const response: any = await firstValueFrom(
      this.http.get(`${environment.apiUrl}/talent/talent`, { params })
    );

    // 2. تحديث القائمة بالبيانات اللي جات من السيرفر مفلترة جاهزة
    this.talentList = response.data || [];
    this.filteredTalentList = this.talentList;

  } catch (error) {
    console.error('Error loading talent:', error);
  } finally {
    this.isLoading = false;
  }
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
