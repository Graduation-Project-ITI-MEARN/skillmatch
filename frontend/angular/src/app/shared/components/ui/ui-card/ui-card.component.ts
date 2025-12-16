// src/app/components/ui/ui-card/ui-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="class" class="ui-card p-6 px-8 rounded-lg bg-white border border-gray-200">
      <ng-content></ng-content>
    </div>
  `,
})
export class UiCard {
  @Input() class: string = '';
}
