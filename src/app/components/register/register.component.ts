import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthenticatedUser } from '../../common/auth-user';
import { ECommValidator } from '../../validators/e-comm-validator';
import { HttpErrorResponse } from '@angular/common/http';

const PASSWORD_POLICY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{10,}$/;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  readonly form: FormGroup;
  isSubmitting = false;
  serverError?: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), ECommValidator.notOnlyWhitespace]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(PASSWORD_POLICY)]],
        confirmPassword: ['', [Validators.required]],
        acceptPolicy: [false, [Validators.requiredTrue]]
      },
      { validators: this.matchPasswords('password', 'confirmPassword') }
    );
  }

  get fullName(): AbstractControl | null {
    return this.form.get('fullName');
  }

  get email(): AbstractControl | null {
    return this.form.get('email');
  }

  get password(): AbstractControl | null {
    return this.form.get('password');
  }

  get confirmPassword(): AbstractControl | null {
    return this.form.get('confirmPassword');
  }

  get acceptPolicy(): AbstractControl | null {
    return this.form.get('acceptPolicy');
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
      void this.router.navigateByUrl(returnUrl);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.serverError = undefined;

    const { email, password, fullName } = this.form.value as {
      email: string;
      password: string;
      fullName: string;
    };

    try {
      const sanitizedName = fullName.trim();
      const normalizedEmail = email.trim().toLowerCase();
      const user = await this.authService.register(sanitizedName, normalizedEmail, password);
      const destination = this.getPostRegistrationRedirect(user);
      await this.router.navigateByUrl(destination);
    } catch (error) {
      this.serverError = this.resolveErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getPostRegistrationRedirect(user: AuthenticatedUser): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      return returnUrl;
    }

    return '/products';
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? 'Unable to create the account right now.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unable to create the account right now.';
  }

  private matchPasswords(passwordKey: string, confirmKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const passwordControl = group.get(passwordKey);
      const confirmControl = group.get(confirmKey);
      if (!passwordControl || !confirmControl) {
        return null;
      }

      const password = passwordControl.value;
      const confirm = confirmControl.value;

      if (password !== confirm) {
        confirmControl.setErrors({
          ...(confirmControl.errors ?? {}),
          mismatch: true
        });
        return { mismatch: true };
      }

      if (confirmControl.errors) {
        const { mismatch, ...rest } = confirmControl.errors;
        if (Object.keys(rest).length === 0) {
          confirmControl.setErrors(null);
        } else if (mismatch) {
          confirmControl.setErrors(rest);
        }
      }

      return null;
    };
  }
}
