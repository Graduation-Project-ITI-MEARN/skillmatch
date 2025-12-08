// src/app/components/ui/ui-button/ui-button.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="'ui-button ui-button-' + variant"
      [disabled]="disabled"
      [attr.aria-disabled]="disabled">
      {{ label }}
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .ui-button {
      padding: var(--space-sm) var(--space-lg);
      border-radius: var(--radius-sm);
      font-weight: 500;
      font-size: 0.875rem;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ui-button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(57, 89, 77, 0.2);
    }

    .ui-button-primary {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      color: white;
      box-shadow: var(--shadow-soft);
    }

    .ui-button-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--color-hover), var(--color-primary));
      box-shadow: var(--shadow-medium);
    }

    .ui-button-secondary {
      background: var(--color-bg);
      color: var(--color-text);
      border-color: rgba(57, 89, 77, 0.2);
    }

    .ui-button-secondary:hover:not(:disabled) {
      background: var(--color-bg-soft);
      border-color: var(--color-primary);
    }

    .ui-button-danger {
      background: #dc2626;
      color: white;
      box-shadow: var(--shadow-soft);
    }

    .ui-button-danger:hover:not(:disabled) {
      background: #b91c1c;
      box-shadow: var(--shadow-medium);
    }

    .ui-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class UiButton {
  @Input() label: string = 'Button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() disabled: boolean = false;
}
