// payment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '../../../environments/environment'; // تأكد من المسار

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  initiatePayment(amount: number, type: 'SUBSCRIPTION' | 'TOPUP') {

    const payload = {
      amount: amount,
      currency: 'EGP',
      payment_type: type 
    };

    console.log('Sending Payload to Backend:', payload); 

    return this.http.post<{data: {iframeUrl: string}}>(
      `${env.apiUrl}/payment/create-intent`,
      payload
    );
  }
}