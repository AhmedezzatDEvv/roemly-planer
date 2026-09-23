import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isSubmitting = signal<boolean>(false);
  private returnUrl: string = '/';

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  fillAdminDemo(): void {
    this.loginForm.patchValue({
      email: 'admin@roamly.com',
      password: 'Admin123!'
    });
  }

  fillTravelerDemo(): void {
    this.loginForm.patchValue({
      email: 'traveler@roamly.com',
      password: 'Traveler123!'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { email, password } = this.loginForm.value;

    setTimeout(() => {
      const result = this.authService.login(email, password);
      this.isSubmitting.set(false);

      if (result.success) {
        if (this.authService.isAdmin() && this.returnUrl === '/') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      } else {
        this.toastService.error(result.message);
      }
    }, 400);
  }
}
