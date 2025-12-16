import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, UserDistribution } from '../../services/users.service';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-distribution',
  standalone: true,
  imports: [CommonModule, UiCard, TranslateModule],
  templateUrl: './user-distribution.html',
})
export class UserDistributionComponent implements OnInit {
  private userService = inject(UsersService);
  data = signal<UserDistribution[]>([]);

  ngOnInit() {
    this.userService.getUserDistribution().subscribe((d) => this.data.set(d));
  }
}
