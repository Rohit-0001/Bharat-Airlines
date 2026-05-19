import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

interface ChatbotResponse {
  keywords: string[];
  response: string;
}

export const chatbotResponses: ChatbotResponse[] = [
  {
    keywords: ['baggage', 'luggage', 'bag', 'weight', 'kg', 'carry'],
    response: 'Economy passengers may carry up to 15kg checked baggage and 7kg cabin baggage. Business Class passengers are allowed 30kg checked baggage and 10kg cabin baggage.'
  },
  {
    keywords: ['cancel', 'cancellation', 'refund cancel'],
    response: 'Tickets can be cancelled from the My Bookings section before departure. Cancellations made 24+ hours before departure are eligible for a partial refund.'
  },
  {
    keywords: ['refund', 'money back', 'reimbursement'],
    response: 'Refunds are processed within 7–10 business days after cancellation. The refunded amount will be credited back to your original payment method.'
  },
  {
    keywords: ['seat', 'seat selection', 'choose seat', 'window', 'aisle'],
    response: 'You can select your preferred seat from our interactive seat map during booking or from the My Bookings section. Window, middle, and aisle seats are available subject to availability.'
  },
  {
    keywords: ['check-in', 'checkin', 'web check', 'online check'],
    response: 'Web check-in opens 48 hours before departure and closes 2 hours before. Visit the My Bookings section and select "Web Check-in" for your flight.'
  },
  {
    keywords: ['contact', 'support', 'help', 'customer care', 'phone', 'email', 'toll'],
    response: 'You can reach Bharat Airlines Support at:\n📞 +91 1800-XXX-XXXX (Toll Free, 24/7)\n✉️ bharat.airline@gmail.com\n📍 Mumbai, India — 400001'
  },
  {
    keywords: ['flight', 'schedule', 'departure', 'arrival', 'time', 'route'],
    response: 'You can search for flights by route, date, and time using the Flight Search feature on your dashboard. Real-time availability is shown instantly.'
  },
  {
    keywords: ['book', 'booking', 'ticket', 'reserve', 'reservation'],
    response: 'To book a flight, go to your dashboard and click "Search Flights". Select your preferred flight, choose a seat, and confirm your booking. A PDF ticket will be generated.'
  },
  {
    keywords: ['pdf', 'download', 'boarding', 'pass', 'ticket download'],
    response: 'Your boarding pass can be downloaded as a PDF from the My Bookings section after booking. Simply click "Download PDF" next to your booking.'
  },
  {
    keywords: ['price', 'cost', 'fare', 'cheap', 'offer', 'deal', 'discount'],
    response: 'Current offers: Delhi to Dubai from ₹12,499 · Singapore from ₹9,499 · Bangkok from ₹8,999 · London from ₹42,999. Earn 2× BharatMiles on all international flights!'
  },
  {
    keywords: ['miles', 'points', 'reward', 'bharatmiles', 'loyalty'],
    response: 'BharatMiles is our loyalty program. Earn miles on every flight and redeem them for free tickets, upgrades, and more. Earn 2× miles on international routes currently!'
  },
  {
    keywords: ['meal', 'food', 'cuisine', 'vegetarian', 'vegan', 'diet'],
    response: 'We offer a variety of regional Indian cuisines as well as continental options. Special dietary meals (vegetarian, vegan, diabetic-friendly) can be pre-ordered during booking.'
  },
  {
    keywords: ['wifi', 'internet', 'connectivity', 'in-flight'],
    response: 'Bharat Airlines offers in-flight Wi-Fi on select international routes. Look for the Wi-Fi symbol when searching for flights. Business Class passengers get complimentary access.'
  },
  {
    keywords: ['delay', 'delayed', 'late', 'status', 'flight status'],
    response: 'You can check live flight status from your dashboard under My Bookings. In case of delays exceeding 3 hours, you will be notified via email and eligible for a meal voucher.'
  },
  {
    keywords: ['passport', 'visa', 'document', 'id', 'identification'],
    response: 'For domestic flights, a valid government-issued photo ID is required. For international flights, a valid passport and applicable visa are mandatory. Ensure documents are valid at the time of travel.'
  },
  {
    keywords: ['upgrade', 'business class', 'premium', 'first class'],
    response: 'Upgrades to Business Class can be requested at the time of booking or up to 24 hours before departure, subject to availability. Use your BharatMiles to upgrade at a discounted rate.'
  },
  {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'],
    response: 'Namaste! 🙏 Welcome to Bharat Airlines support. I\'m here to help you with flight bookings, baggage, cancellations, and more. How can I assist you today?'
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'dhanyavad'],
    response: 'You\'re most welcome! 😊 It was a pleasure assisting you. Wishing you a wonderful journey with Bharat Airlines. Is there anything else I can help you with?'
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'ok bye'],
    response: 'Thank you for reaching out to Bharat Airlines! Have a safe and pleasant journey. Come back anytime you need help. ✈️ Bon voyage!'
  }
];

const FALLBACK = "I'm sorry, I could not understand your request. Please contact Bharat Airlines support at +91 1800-XXX-XXXX or email bharat.airline@gmail.com. Is there anything else I can assist you with?";

const QUICK_CHIPS = [
  { label: ' Baggage Policy', query: 'baggage policy' },
  { label: ' Flight Cancellation', query: 'flight cancellation' },
  { label: ' Refund Status', query: 'refund status' },
  { label: ' Seat Booking', query: 'seat booking' },
  { label: ' Web Check-in', query: 'web check-in' },
  { label: ' Contact Support', query: 'contact support' }
];

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatBody') chatBody!: ElementRef;

  isOpen = false;
  isTyping = false;
  userInput = '';
  chips = QUICK_CHIPS;

  messages: ChatMessage[] = [
    {
      text: 'Namaste! 🙏 I\'m your Bharat Airlines virtual assistant. I can help you with baggage policies, flight bookings, cancellations, refunds, and more. How can I assist you today?',
      sender: 'bot',
      time: this.currentTime()
    }
  ];

  private shouldScroll = false;

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.shouldScroll = true;
    }
  }

  closeChat(): void {
    this.isOpen = false;
  }

  sendChip(query: string): void {
    this.userInput = query;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text) return;

    this.messages.push({ text, sender: 'user', time: this.currentTime() });
    this.userInput = '';
    this.shouldScroll = true;
    this.isTyping = true;

    setTimeout(() => {
      const response = this.getResponse(text);
      this.messages.push({ text: response, sender: 'bot', time: this.currentTime() });
      this.isTyping = false;
      this.shouldScroll = true;
    }, 1200 + Math.random() * 600);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  private getResponse(input: string): string {
    const lower = input.toLowerCase();
    for (const item of chatbotResponses) {
      if (item.keywords.some(kw => lower.includes(kw))) {
        return item.response;
      }
    }
    return FALLBACK;
  }

  private currentTime(): string {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }
}