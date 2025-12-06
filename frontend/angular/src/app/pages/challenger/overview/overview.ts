// pages/challenger/overview/overview.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <!-- Tabs Navigation -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex items-center border-b border-gray-200 px-2 py-1">
          <button
            (click)="activeTab = 'active'"
            [class.bg-gray-100]="activeTab === 'active'"
            [class.text-gray-900]="activeTab === 'active'"
            [class.font-semibold]="activeTab === 'active'"
            class="flex items-center px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Active Challenges
          </button>
          <button
            (click)="activeTab = 'completed'"
            [class.bg-gray-100]="activeTab === 'completed'"
            [class.text-gray-900]="activeTab === 'completed'"
            [class.font-semibold]="activeTab === 'completed'"
            class="flex items-center px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Completed
          </button>
          <button
            (click)="activeTab = 'create'"
            [class.bg-gray-100]="activeTab === 'create'"
            [class.text-gray-900]="activeTab === 'create'"
            [class.font-semibold]="activeTab === 'create'"
            class="flex items-center px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Create New
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div *ngIf="activeTab === 'active'">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Active Challenges</h2>
          <p class="text-gray-600">Your active bounty challenges will appear here.</p>
        </div>

        <div *ngIf="activeTab === 'completed'">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Completed Challenges</h2>
          <p class="text-gray-600">Your completed bounties will appear here.</p>
        </div>

        <div *ngIf="activeTab === 'create'">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Create New Challenge</h2>
          <p class="text-gray-600">Create a new bounty challenge here.</p>
        </div>
      </div>
    </div>
  `
})
export class Overview {
  activeTab: string = 'active';
}
