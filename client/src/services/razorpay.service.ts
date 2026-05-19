import { Injectable } from '@angular/core';

declare var Razorpay: any;

export interface RazorpayOptions {
  amount: number;          // in paise (rupees × 100)
  flightNumber: string;
  source: string;
  destination: string;
  userName: string;
  userEmail: string;
  userContact: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (error: any) => void;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

@Injectable({ providedIn: 'root' })
export class RazorpayService {

  private readonly KEY_ID = 'rzp_test_Sr6GCjb9ULsLgi';

  openCheckout(opts: RazorpayOptions): void {
    const options = {
      key: this.KEY_ID,
      amount: Math.round(opts.amount * 100),   // convert ₹ → paise
      currency: 'INR',
      name: 'Bharat Airlines',
      description: `Flight ${opts.flightNumber} · ${opts.source} → ${opts.destination}`,
      image: 'https://i.imgur.com/n5tjHFD.png',  // airline logo placeholder
      theme: { color: '#1a3c6e' },
      prefill: {
        name: opts.userName,
        email: opts.userEmail,
        contact: opts.userContact
      },
      notes: {
        flight: opts.flightNumber,
        route: `${opts.source} → ${opts.destination}`
      },
      handler: (response: RazorpaySuccessResponse) => {
        opts.onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          opts.onFailure({ description: 'Payment popup closed by user' });
        }
      }
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      opts.onFailure(response.error);
    });

    rzp.open();
  }
}