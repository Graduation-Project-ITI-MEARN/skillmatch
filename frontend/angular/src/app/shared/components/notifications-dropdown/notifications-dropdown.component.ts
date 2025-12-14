import {
  Component,
  inject,
  OnInit,
  signal,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Bell,
  CheckCircle,
  AlertCircle,
  Trophy,
  Users,
  X,
  Check,
} from 'lucide-angular';
import { NotificationService, Notification } from 'src/app/core/services/notification';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule], // No need for Zard here, we built custom as per design
  template: `
    <div class="relative">
      <!-- Trigger Button -->
      <button
        (click)="toggle()"
        class="relative p-2 hover:bg-gray-100 rounded-lg transition-all border border-transparent focus:border-gray-200 outline-none"
      >
        <lucide-icon [img]="icons.Bell" class="w-5 h-5 text-gray-600"></lucide-icon>

        @if (unreadCount() > 0) {
        <span
          class="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border border-white"
        ></span>
        }
      </button>

      <!-- Dropdown Panel -->
      @if (isOpen()) {
      <div
        class="absolute end-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 origin-top-right rtl:origin-top-left animate-in fade-in zoom-in-95 duration-100"
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900">
            {{ 'DASHBOARD.NOTIFICATIONS.TITLE' | translate }}
          </h3>
          <button
            (click)="close()"
            class="p-1 hover:bg-gray-100 rounded transition-all text-gray-500 hover:text-gray-700"
          >
            <lucide-icon [img]="icons.X" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <!-- List -->
        <div class="max-h-96 overflow-y-auto">
          @if (notifications().length > 0) {
          <div class="divide-y divide-gray-100">
            @for (item of notifications(); track item._id) {
            <div
              class="p-4 hover:bg-gray-50 transition-all cursor-default group"
              [class.bg-orange-50_30]="!item.isRead"
            >
              <div class="flex items-start gap-3 text-start">
                <!-- Dynamic Icon based on type -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  [ngClass]="getIconStyles(item.type).bg"
                >
                  <lucide-icon
                    [img]="getIconStyles(item.type).icon"
                    class="w-4 h-4"
                    [ngClass]="getIconStyles(item.type).text"
                  ></lucide-icon>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm mb-1 font-medium text-gray-900">{{ item.title }}</p>
                  <p class="text-xs text-gray-600 leading-snug">{{ item.message }}</p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ item.createdAt | date : 'shortTime' }}
                  </p>
                </div>

                <!-- Mark as Read Action -->
                @if (!item.isRead) {
                <button
                  (click)="markAsRead(item._id, $event)"
                  class="p-1 hover:bg-gray-200 rounded transition-all group-hover:opacity-100"
                  title="Mark as read"
                >
                  <lucide-icon
                    [img]="icons.Check"
                    class="w-4 h-4 text-gray-400 group-hover:text-orange-600"
                  ></lucide-icon>
                </button>
                } @else {
                <div class="w-6"></div>
                }
              </div>
            </div>
            }
          </div>
          } @else {
          <div class="p-8 text-center text-gray-500 text-sm">
            {{ 'DASHBOARD.NOTIFICATIONS.EMPTY' | translate }}
          </div>
          }
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200 bg-gray-50/50 rounded-b-xl">
          <button
            class="w-full text-center text-xs text-gray-600 hover:text-gray-900 font-medium transition-all"
            (click)="markAllAsRead()"
          >
            {{ 'DASHBOARD.NOTIFICATIONS.MARK_ALL_AS_READ' | translate }}
          </button>
        </div>
      </div>
      }
    </div>
  `,
})
export class NotificationsDropdownComponent implements OnInit {
  private notifService = inject(NotificationService);
  private eRef = inject(ElementRef);

  // State
  isOpen = signal(false);
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  // Icons registry
  icons = { Bell, X, Check };

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.notifService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.updateCount();
      },
      error: () => console.error('Failed to load notifications'),
    });
  }

  updateCount() {
    const count = this.notifications().filter((n) => !n.isRead).length;
    this.unreadCount.set(count);
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  // --- Actions ---

  markAsRead(id: string, event: Event) {
    event.stopPropagation(); // Stop dropdown from closing

    // 1. Optimistic UI update
    this.notifications.update((list) =>
      list.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    this.updateCount();

    // 2. API Call
    this.notifService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    // 1. Optimistic UI update
    this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
    this.updateCount();

    // 2. API Call
    this.notifService.markAllAsRead().subscribe();
  }

  // --- Helpers ---

  // Click Outside Listener
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  // Style Helper based on type
  getIconStyles(type: string = 'info') {
    switch (type) {
      case 'success':
        return { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle };
      case 'warning':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: AlertCircle };
      case 'error':
        return { bg: 'bg-red-100', text: 'text-red-600', icon: AlertCircle };
      case 'info':
      default:
        return { bg: 'bg-orange-100', text: 'text-orange-600', icon: Trophy }; // Using Trophy/Users as default or specific logic
    }
  }
}
