import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ContactInquiry } from '../../../core/models/inquiry.model';

@Component({
  selector: 'app-inquiries-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inquiries-admin.component.html',
  styleUrl: './inquiries-admin.component.css'
})
export class InquiriesAdminComponent {
  public contactService = inject(ContactService);
  public selectedInquiry = signal<ContactInquiry | null>(null);

  onStatusChange(id: string, newStatus: ContactInquiry['status']): void {
    this.contactService.updateInquiryStatus(id, newStatus);
  }

  viewInquiry(inq: ContactInquiry): void {
    this.selectedInquiry.set(inq);
  }

  deleteInquiry(id: string): void {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      this.contactService.deleteInquiry(id);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.selectedInquiry.set(null);
    }
  }
}
