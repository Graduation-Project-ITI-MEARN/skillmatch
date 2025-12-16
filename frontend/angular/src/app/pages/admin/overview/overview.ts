import { Component } from '@angular/core';
import { UserDistributionComponent } from '../components/user-distribution/user-distribution';
import { TodaysStatsComponent } from '../components/today-stats/today-stats';
import { TopChallengesComponent } from '../components/top-challenges/top-challenges';

@Component({
  selector: 'app-overview',
  imports: [UserDistributionComponent, TodaysStatsComponent, TopChallengesComponent],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {}
