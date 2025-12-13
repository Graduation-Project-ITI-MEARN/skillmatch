import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule for RouterOutlet
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

export interface DashboardTab {
  labelKey: string;
  route: string; // The URL path
  icon?: any;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LucideAngularModule],
  template: `
    <div class="bg-stone-50 text-gray-900 font-sans pb-20">
      <div class="max-w-450 mx-auto px-6 pt-8">
        <!-- 1. HEADER (Persistent) -->
        <div class="flex items-start justify-between mb-12">
          <div class="flex items-center gap-4">
            <!-- Avatar with Gradient -->
            <div
              class="w-14 h-14 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-xl"
            >
              <ng-content select="[avatar]"></ng-content>
            </div>
            <div>
              <h1 class="text-4xl font-bold tracking-tight text-gray-900">
                {{ titleKey | translate : titleParams }}
              </h1>
              <p class="text-gray-500 mt-1">{{ subtitleKey | translate }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <ng-content select="[actions]"></ng-content>
          </div>
        </div>

        <!-- 2. STATS GRID (Persistent) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ng-content select="[stats]"></ng-content>
        </div>

        <!-- 3. TABS (Persistent & Router Aware) -->
        <div class="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          <a
            *ngFor="let tab of tabs"
            [routerLink]="tab.route"
            routerLinkActive="active-tab"
            class="group flex items-center gap-2 pb-4 relative transition-all whitespace-nowrap text-gray-500 hover:text-gray-900 outline-none"
          >
            <lucide-icon *ngIf="tab.icon" [img]="tab.icon" class="w-4 h-4"></lucide-icon>
            <span class="font-medium">{{ tab.labelKey | translate }}</span>

            <!-- Gradient Line for Active State -->
            <div
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-gradient opacity-0 transition-opacity group-[.active-tab]:opacity-100"
            ></div>

            <!-- Text Color for Active State (via class) -->
            <style>
              .active-tab {
                color: rgb(17 24 39);
                font-weight: 600;
              }
            </style>
          </a>
        </div>

        <!-- 4. DYNAMIC CONTENT (Changes per route) -->
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  @Input() titleKey: string = '';
  @Input() titleParams: any = {};
  @Input() subtitleKey: string = '';
  @Input() tabs: DashboardTab[] = [];
}
