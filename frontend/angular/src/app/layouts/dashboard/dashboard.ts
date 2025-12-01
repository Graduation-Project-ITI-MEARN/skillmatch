import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
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
