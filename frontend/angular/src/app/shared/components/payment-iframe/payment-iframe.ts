import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-payment-iframe',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './payment-iframe.html'
})
export class PaymentIframe {
  safeUrl: SafeResourceUrl;
  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<PaymentIframe>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string }
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.url);
  }
  close(status?: string) {
    this.dialogRef.close(status);
  }
}