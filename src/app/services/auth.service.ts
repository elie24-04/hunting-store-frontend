import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthenticatedUser, AuthResponse, UserRole } from '../common/auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'ang-ecommerce::auth-token';
  private readonly authStateSubject = new BehaviorSubject<AuthenticatedUser | null>(null);
  readonly currentUser$: Observable<AuthenticatedUser | null> = this.authStateSubject.asObservable();
  private cachedToken: string | null = null;

  constructor(private readonly http: HttpClient) {
    this.bootstrapSession();
  }

  async login(email: string, password: string): Promise<AuthenticatedUser> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
    );
    this.persistSession(response);
    return response.user;
  }

  async register(fullName: string, email: string, password: string): Promise<AuthenticatedUser> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, { fullName, email, password })
    );
    this.persistSession(response);
    return response.user;
  }

  async refreshProfile(): Promise<AuthenticatedUser | null> {
    if (!this.cachedToken) {
      return null;
    }

    try {
      const profile = await firstValueFrom(
        this.http.get<AuthenticatedUser>(`${environment.apiBaseUrl}/auth/me`).pipe(
          tap((user) => this.authStateSubject.next(user))
        )
      );
      return profile;
    } catch {
      this.clearSession();
      return null;
    }
  }

  logout(): void {
    this.clearSession();
  }

  isAuthenticated(): boolean {
    return !!this.authStateSubject.value;
  }

  hasRole(role: UserRole): boolean {
    return this.authStateSubject.value?.role === role;
  }

  async ensureUser(): Promise<AuthenticatedUser | null> {
    if (this.authStateSubject.value) {
      return this.authStateSubject.value;
    }

    if (this.cachedToken) {
      return this.refreshProfile();
    }

    return null;
  }

  get token(): string | null {
    return this.cachedToken;
  }

  private bootstrapSession(): void {
    const storedToken = localStorage.getItem(this.tokenKey);
    if (!storedToken) {
      return;
    }

    this.cachedToken = storedToken;
    void this.refreshProfile();
  }

  private persistSession(response: AuthResponse): void {
    this.cachedToken = response.token;
    localStorage.setItem(this.tokenKey, response.token);
    this.authStateSubject.next(response.user);
  }

  private clearSession(): void {
    this.cachedToken = null;
    localStorage.removeItem(this.tokenKey);
    this.authStateSubject.next(null);
  }
}
