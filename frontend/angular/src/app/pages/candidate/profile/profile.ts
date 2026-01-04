import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileUpdateComponent } from '@shared/components/profile-form/profile-form';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule, ProfileUpdateComponent],
  templateUrl: './profile.html',
})
export class CandidateProfile {}
