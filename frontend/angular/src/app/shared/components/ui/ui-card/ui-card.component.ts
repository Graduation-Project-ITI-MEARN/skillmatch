import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ui-card">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ui-card {
        background: var(--color-bg);
        border-radius: var(--radius-md);
        border: 1px solid rgba(57, 89, 77, 0.08);
        box-shadow: var(--shadow-soft);
        transition: box-shadow var(--transition-medium);
      }

      .ui-card:hover {
        box-shadow: var(--shadow-medium);
      }
    `,
  ],
})
export class UiCard {}
