// src/app/components/ui/ui-card/ui-card.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Unauthorized <a routerLink="/login">Login</a></div>`,
})
export class UnauthorizedComponent {}
