import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';

const CATEGORIES = ['Development', 'Design', 'Marketing', 'Writing', 'Translation', 'Data Entry'];

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: 'user' | 'admin';
  type?: 'candidate' | 'company' | 'challenger';
  skills?: string[]; // Assuming skills are related to categories
  totalScore?: number;
  badges?: string[];
  isVerified?: boolean;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  nationalId?: string;
  verificationDocument?: string;

  // --- NEW FIELDS FOR CANDIDATE PROFILE ---
  city?: string; // For both candidate and company
  bio?: string; // For both candidate and company
  github?: string;
  linkedin?: string;
  // Add an array for other social links, allowing flexibility
  otherLinks?: { name: string; url: string }[];
  categoriesOfInterest?: (typeof CATEGORIES)[number][]; // Array of categories

  // --- NEW FIELDS FOR COMPANY PROFILE ---
  website?: string;
  // bio and city are already covered above
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // Inject AuthService
  private apiUrl = `${environment.apiUrl}/users`;

  /**
   * @description Fetches the profile of the currently authenticated user.
   *              This correctly maps to GET /api/users/profile on the backend, which uses req.user.id.
   * @returns An Observable of the IUser object.
   */
  getMeProfile(): Observable<{ success: boolean; data: IUser }> {
    // NO NEED to wait for userLoaded$ or check userId here.
    // The backend /users/profile endpoint is responsible for checking authentication
    // via `auth` middleware and using `req.user.id`.
    // If the user is not authenticated, the backend will return a 401,
    // which HttpClient handles.
    return this.http.get<{ success: boolean; data: IUser }>(`${this.apiUrl}/profile`);
  }

  /**
   * @description Updates the profile of the currently authenticated user.
   * @param profileData A partial IUser object containing the fields to update.
   * @returns An Observable of the updated IUser object.
   */
  updateProfile(profileData: Partial<IUser>): Observable<{ success: boolean; data: IUser }> {
    return this.http.patch<{ success: boolean; data: IUser }>(
      `${this.apiUrl}/profile`,
      profileData
    );
  }

  requestVerification(data: { nationalId: string; documentUrl: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, data);
  }

  // --- Admin-specific functions ---
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }
  getAllCandidates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates`);
  }
  getAllCompanies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/companies`);
  }
  getAllChallengers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/challengers`);
  }
  getAISkills(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/ai-skills`);
  }
  updateVerificationStatus(
    id: string,
    status: 'pending' | 'verified' | 'rejected'
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/verify`, { verificationStatus: status });
  }
  getAdminUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
