// src/app/components/ui/ui-badge/ui-badge.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeStatus = 'success' | 'warning' | 'error';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'ui-badge ui-badge-' + status">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .ui-badge {
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      font-family: var(--font-sans);
      display: inline-flex;
      align-items: center;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .ui-badge-success {
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .ui-badge-warning {
      background: rgba(251, 191, 36, 0.1);
      color: #d97706;
      border: 1px solid rgba(251, 191, 36, 0.2);
    }

    .ui-badge-error {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
  `]
})
export class UiBadge {
  @Input() status: BadgeStatus = 'success';
}
