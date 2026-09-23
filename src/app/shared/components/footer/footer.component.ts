import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private contactService = inject(ContactService);
  private toast = inject(ToastService);

  public email: string = '';

  onSubscribe(): void {
    if (!this.email || !this.email.includes('@')) {
      this.toast.error('Please enter a valid email address.');
      return;
    }
    this.contactService.subscribeNewsletter(this.email);
    this.email = '';
  }
}
