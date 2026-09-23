import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  public contactService = inject(ContactService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  public isSubmitting = signal<boolean>(false);
  public submittedSuccess = signal<boolean>(false);
  public submittedName = signal<string>('');
  public submittedEmail = signal<string>('');
  public submittedSubject = signal<string>('');
  public activeFaqId = signal<string>('faq-1');

  public contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  isFieldInvalid(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  toggleAccordion(faqId: string): void {
    if (this.activeFaqId() === faqId) {
      this.activeFaqId.set('');
    } else {
      this.activeFaqId.set(faqId);
    }
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.toast.error('Please fill out all required fields properly.');
      return;
    }

    this.isSubmitting.set(true);
    const formVals = this.contactForm.value;

    setTimeout(() => {
      this.contactService.submitInquiry(
        formVals.name,
        formVals.email,
        formVals.subject,
        formVals.message
      );

      this.isSubmitting.set(false);
      this.submittedName.set(formVals.name.split(' ')[0]);
      this.submittedEmail.set(formVals.email);
      this.submittedSubject.set(formVals.subject);
      this.submittedSuccess.set(true);

      this.toast.success('Inquiry sent successfully!');
      this.contactForm.reset({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 700);
  }
}
