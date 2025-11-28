import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit  {

  userName: string = 'User';

  private readonly authService = inject(AuthService);

  ngOnInit(): void {
   const token = this.authService.getToken();
  }

}
