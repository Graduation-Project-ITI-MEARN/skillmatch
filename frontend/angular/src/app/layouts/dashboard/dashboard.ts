import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  userName: string = 'User';

  private readonly authService = inject(AuthService);

  ngOnInit() {
    // instead, just rely on the service state if needed
    console.log('Dashboard loaded. User role:', this.authService.role);
  }
}
