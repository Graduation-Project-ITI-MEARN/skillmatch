import { Component } from '@angular/core';
import { UserDistributionComponent } from '../components/user-distribution/user-distribution';
import { TodaysStatsComponent } from '../components/today-stats/today-stats';
import { TopChallengesComponent } from '../components/top-challenges/top-challenges';
import { RecentActivityComponent } from '../components/recent-activity/recent-activity';

@Component({
  selector: 'app-overview',
  imports: [
    UserDistributionComponent,
    TodaysStatsComponent,
    TopChallengesComponent,
    RecentActivityComponent,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {}
