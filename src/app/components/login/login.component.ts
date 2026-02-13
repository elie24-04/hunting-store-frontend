import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AuthenticatedUser } from '../../common/auth-user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  readonly form: FormGroup;
  serverError?: string;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
      void this.router.navigateByUrl(returnUrl);
    }
  }

  get email(): AbstractControl | null {
    return this.form.get('email');
  }

  get password(): AbstractControl | null {
    return this.form.get('password');
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.serverError = undefined;

    const { email, password } = this.form.value as { email: string; password: string };
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const user = await this.authService.login(normalizedEmail, password);
      const destination = this.getPostLoginRedirect(user);
      await this.router.navigateByUrl(destination);
    } catch (error) {
      this.serverError = this.resolveErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getPostLoginRedirect(user: AuthenticatedUser): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      return returnUrl;
    }

    return '/products';
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? 'Incorrect email or password.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unable to sign in right now.';
  }
}
