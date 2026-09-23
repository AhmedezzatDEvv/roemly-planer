import { Injectable, signal, computed } from '@angular/core';
import { ContactInquiry, FaqItem } from '../models/inquiry.model';
import { ToastService } from './toast.service';

const INQUIRIES_KEY = 'roamly_inquiries';
const NEWSLETTER_KEY = 'roamly_newsletter';

const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Planning & Estimates',
    question: 'How accurate are the daily trip budget estimates?',
    answer: 'Our cost estimator uses aggregated seasonal pricing data covering typical lodging, daily dining, local transit, and top activities. While real-world prices fluctuate with currency shifts and peak flight seasons, travelers consistently report our estimates to be within 5-10% of their actual trip expenditures.'
  },
  {
    id: 'faq-2',
    category: 'Bookings & Reservations',
    question: 'Does Roamly make direct flight and hotel bookings for me?',
    answer: 'Roamly is designed as a smart itinerary planner and cost calculator. We provide direct exportable blueprints, cost forecasts, and curated recommendations so you can book directly with airlines and boutique hotels without middleman markup fees.'
  },
  {
    id: 'faq-3',
    category: 'Customization',
    question: 'Can I customize the day-by-day activities in my generated itinerary?',
    answer: 'Yes! When planning your trip, you can select customized activity tags (sightseeing, dining, nature, wellness, nightlife). The day-by-day generator automatically rotates highlights and customizes activities based on your travel style pace.'
  },
  {
    id: 'faq-4',
    category: 'Account & Privacy',
    question: 'Are my saved itineraries stored privately in my account?',
    answer: 'All your planned vacations and favorited destinations are securely associated with your user account and preserved locally on your device for instant offline access and printing.'
  }
];

const INITIAL_INQUIRIES: ContactInquiry[] = [
  {
    id: 'inq_1',
    name: 'Marcus Davies',
    email: 'marcus.davies@example.com',
    subject: 'Family Trip to Banff',
    message: 'We are planning an 8-day trip to Banff with two kids. Do you recommend booking Lake Louise shuttles in advance for July?',
    createdAt: '2026-03-02',
    status: 'In Review'
  },
  {
    id: 'inq_2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    subject: 'Amalfi Coast Itinerary',
    message: 'Can the ferry schedules between Positano and Capri be integrated into the printable day plan?',
    createdAt: '2026-03-04',
    status: 'New'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private inquiriesSignal = signal<ContactInquiry[]>(this.loadInquiries());
  private newsletterSignal = signal<string[]>(this.loadNewsletters());
  public faqs = signal<FaqItem[]>(INITIAL_FAQS).asReadonly();

  public inquiries = this.inquiriesSignal.asReadonly();
  public inquiriesCount = computed(() => this.inquiriesSignal().length);
  public subscribersCount = computed(() => this.newsletterSignal().length);

  constructor(private toastService: ToastService) {}
// TRY,catch بتحمي التطبيق من الانهيار مبتعملش بلوك للتطبيق كلو بس بتعمل بلوك للداله ابلي فيها مشكله
  private loadInquiries(): ContactInquiry[] {
    try {
      const stored = localStorage.getItem(INQUIRIES_KEY);
      if (stored) {
        return JSON.parse(stored); 
      }
    } catch (e) {
      console.error('Error loading inquiries:', e);
    }
    return INITIAL_INQUIRIES;
  }

  private saveInquiries(list: ContactInquiry[]): void {
    try {
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving inquiries:', e);
    }
  }

  private loadNewsletters(): string[] {
    try {
      const stored = localStorage.getItem(NEWSLETTER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading newsletter subscribers:', e);
    }
    return ['traveler@roamly.com', 'marcus.davies@example.com', 'sarah.j@example.com'];
  }

  private saveNewsletters(list: string[]): void {
    try {
      localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving newsletter subscribers:', e);
    }
  }

  submitInquiry(name: string, email: string, subject: string, message: string): ContactInquiry {
    const newInquiry: ContactInquiry = {
      id: 'inq_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'New'
    };

    const updated = [newInquiry, ...this.inquiriesSignal()];
    this.inquiriesSignal.set(updated);
    this.saveInquiries(updated);
    return newInquiry;
  }

  subscribeNewsletter(email: string): boolean {
    const clean = email.trim().toLowerCase();
    const current = this.newsletterSignal();

    if (current.includes(clean)) {
      this.toastService.info('You are already subscribed with this email.');
      return false;
    }

    const updated = [clean, ...current];
    this.newsletterSignal.set(updated);
    this.saveNewsletters(updated);
    this.toastService.success('Thank you for subscribing! Travel inspiration is on the way. ✈️');
    return true;
  }

  // Admin Actions
  updateInquiryStatus(id: string, status: ContactInquiry['status']): boolean {
    const current = this.inquiriesSignal();
    const index = current.findIndex(i => i.id === id);
    if (index === -1) return false;

    const updated = [...current];
    updated[index] = { ...updated[index], status };
    this.inquiriesSignal.set(updated);
    this.saveInquiries(updated);
    this.toastService.success(`Inquiry status updated to "${status}".`);
    return true;
  }

  deleteInquiry(id: string): boolean {
    const current = this.inquiriesSignal();
    const updated = current.filter(i => i.id !== id);
    if (updated.length === current.length) return false;

    this.inquiriesSignal.set(updated);
    this.saveInquiries(updated);
    this.toastService.info('Inquiry deleted.');
    return true;
  }
}
