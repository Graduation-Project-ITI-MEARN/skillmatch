import { Component, inject, OnInit, signal, computed, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Eye,
  CheckCircle,
  XCircle,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-angular';
import { UsersService, User } from '../services/users.service';
import { TranslateModule } from '@ngx-translate/core';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';
import { ZardDialogService } from 'src/app/shared/components/zard-ui/dialog/dialog.service'; // Adjust path, import ZardDialogRef
import {
  ZardDialogModule,
  ZardDialogOptions,
} from 'src/app/shared/components/zard-ui/dialog/dialog.component'; // Adjust path
import { ZardIcon } from 'src/app/shared/components/zard-ui/icon/icons'; // Adjust path to ZardIcon type
import { ToastrService } from 'ngx-toastr';
import {
  UserVerificationDetails,
  ViewVerificationDetailsComponent,
} from './modals/view-verification.component';
import { VerifyConfirmationComponent } from './modals/verify-confirmation.component';
import { ZardDialogRef } from '@shared/components/zard-ui/dialog/dialog-ref';
import { RejectConfirmationComponent } from './modals/reject-verification.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule, UiCard, ZardDialogModule],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private userService = inject(UsersService);
  private dialogService = inject(ZardDialogService);
  private vcr = inject(ViewContainerRef);
  private toastService = inject(ToastrService);

  // Data
  allUsers = signal<User[]>([]);
  loading = signal(false);

  // Pagination State
  currentPage = signal(1);
  itemsPerPage = 6;

  paginatedUsers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allUsers().slice(startIndex, endIndex);
  });

  totalPages = computed(() => Math.ceil(this.allUsers().length / this.itemsPerPage));

  // Tabs
  currentTab = signal<string>('All Users');
  tabs = ['All Users', 'Candidates', 'Companies', 'Challengers'];

  icons = {
    Eye,
    CheckCircle,
    XCircle,
    CreditCard,
    FileText,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    const params: any = { sort: '-createdAt', limit: 1000 };
    const tab = this.currentTab();

    if (tab === 'All Users') {
      params.role = 'user';
    } else if (tab === 'Candidates') {
      params.role = 'user';
      params.type = 'candidate';
    } else if (tab === 'Companies') {
      params.role = 'user';
      params.type = 'company';
    } else if (tab === 'Challengers') {
      params.role = 'user';
      params.type = 'challenger';
    }

    this.userService.getAllUsers(params).subscribe({
      next: (response) => {
        this.allUsers.set(response.data || []);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error('Error', err.message || 'Failed to load users.');
      },
    });

    console.log(this.allUsers());
  }

  setTab(tab: string) {
    this.currentTab.set(tab);
    this.loadUsers();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.scrollToTop();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p + -1); // Corrected from p-1 to p + -1 for type consistency
      this.scrollToTop();
    }
  }

  scrollToTop() {
    const list = document.getElementById('user-list-top');
    if (list) list.scrollIntoView({ behavior: 'smooth' });
  }

  onView(user: User) {
    const dialogData: UserVerificationDetails = {
      userName: user.name || user.email,
      userType: user.type,
      nationalId: user.nationalId,
      taxIdCard: user.taxIdCard,
      verificationDocument: user.verificationDocument || '',
    };

    console.log(dialogData);

    this.dialogService.create<ViewVerificationDetailsComponent, UserVerificationDetails>({
      zContent: ViewVerificationDetailsComponent,
      zTitle:
        user.type === 'company'
          ? 'DASHBOARD.ADMIN.USERS.VIEW_TAX_DETAILS'
          : 'DASHBOARD.ADMIN.USERS.VIEW_ID_DETAILS', // Pass translated key
      zData: dialogData,
      zHideFooter: true,
      zViewContainerRef: this.vcr,
    });
  }

  onVerify(user: User) {
    const dialogRef: ZardDialogRef<VerifyConfirmationComponent, any, { userName: string }> =
      this.dialogService.create<VerifyConfirmationComponent, { userName: string }>({
        zContent: VerifyConfirmationComponent,
        zTitle: 'DASHBOARD.ADMIN.USERS.VERIFY_USER_TITLE', // Pass translated key
        zData: { userName: user.name || user.email },
        zOkText: 'DASHBOARD.ADMIN.USERS.VERIFY_BUTTON',
        zOkIcon: 'checkCircle' as ZardIcon, // Cast as ZardIcon
        zOkDestructive: false,
        zViewContainerRef: this.vcr,
        zOnOk: () => {
          this.userService
            .updateUserVerificationStatus(user._id, { status: 'verified' })
            .subscribe({
              next: () => {
                this.toastService.success('Success', `${user.name} has been verified.`);
                this.loadUsers();
                dialogRef.close();
              },
              error: (err) => {
                this.toastService.error('Error', err.message || 'Failed to verify user.');
                dialogRef.close();
              },
            });
          return false;
        },
        zOnCancel: (): void => {
          dialogRef.close();
        },
      });
  }

  onReject(user: User) {
    const dialogRef: ZardDialogRef<RejectConfirmationComponent, string, { userName: string }> =
      this.dialogService.create<RejectConfirmationComponent, { userName: string }>({
        zContent: RejectConfirmationComponent,
        zTitle: 'DASHBOARD.ADMIN.USERS.REJECT_USER_TITLE', // Pass translated key
        zData: { userName: user.name || user.email },
        zOkText: 'DASHBOARD.ADMIN.USERS.REJECT_BUTTON',
        zOkIcon: 'xCircle' as ZardIcon, // Cast as ZardIcon
        zOkDestructive: true,
        zViewContainerRef: this.vcr,
        zOnOk: (componentInstance) => {
          const rejectionReason = componentInstance.rejectionResult;
          this.userService
            .updateUserVerificationStatus(user._id, { status: 'rejected', reason: rejectionReason })
            .subscribe({
              next: () => {
                this.toastService.success('Success', `${user.name}'s verification was rejected.`);
                this.loadUsers();
                dialogRef.close();
              },
              error: (err) => {
                this.toastService.error(
                  'Error',
                  err.message || 'Failed to reject user verification.'
                );
                dialogRef.close();
              },
            });
          return false;
        },
        zOnCancel: (): void => {
          dialogRef.close();
        },
      });
  }

  getInitials(name: string): string {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'U';
  }
}
