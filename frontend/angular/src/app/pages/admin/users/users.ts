import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Eye,
  CheckCircle,
  XCircle,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';
import { UsersService, User } from '../services/users.service';
import { TranslateModule } from '@ngx-translate/core';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule, UiCard],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private userService = inject(UsersService);

  // Data
  allUsers = signal<User[]>([]); // Stores ALL fetched users
  loading = signal(false);

  // Pagination State
  currentPage = signal(1);
  itemsPerPage = 6; // Number of cards per page

  // Computed: Get only the users for the current page
  paginatedUsers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allUsers().slice(startIndex, endIndex);
  });

  // Computed: Total pages
  totalPages = computed(() => Math.ceil(this.allUsers().length / this.itemsPerPage));

  // Tabs
  currentTab = signal<string>('All Users');
  tabs = ['All Users', 'Candidates', 'Companies', 'Challengers'];

  icons = { Eye, CheckCircle, XCircle, CreditCard, FileText, ChevronLeft, ChevronRight };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);

    // 1. Fetch a large number to handle pagination on the frontend
    const params: any = { sort: '-createdAt', limit: 1000 };

    // 2. Filter Logic
    const tab = this.currentTab();

    if (tab === 'All Users') {
      // EXCLUDE ADMINS: Only fetch role='user'
      params.role = 'user';
    } else if (tab === 'Candidates') {
      params.role = 'user';
      params.type = 'candidate';
    } else if (tab === 'Companies') {
      params.role = 'user';
      params.type = 'company';
    } else if (tab === 'Challengers') {
      params.role = 'user';
      params.type = 'challenger';
    }

    this.userService.getAllUsers(params).subscribe({
      next: (response) => {
        // Store all data in the signal
        this.allUsers.set(response.data || []);
        this.currentPage.set(1); // Reset to page 1 on new fetch
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: string) {
    this.currentTab.set(tab);
    this.loadUsers();
  }

  // --- Pagination Actions ---

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.scrollToTop();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.scrollToTop();
    }
  }

  scrollToTop() {
    // Optional: smooth scroll to top of list when changing pages
    const list = document.getElementById('user-list-top');
    if (list) list.scrollIntoView({ behavior: 'smooth' });
  }

  // --- User Actions ---

  onVerify(user: User) {
    console.log('Verifying:', user._id);
  }

  onReject(user: User) {
    console.log('Rejecting:', user._id);
  }

  onView(user: User) {
    console.log('View User:', user._id);
  }

  getInitials(name: string): string {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'U';
  }
}
