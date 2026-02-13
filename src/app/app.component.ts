import { Component, OnDestroy, TemplateRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AuthenticatedUser } from './common/auth-user';
import { CartService } from './services/cart.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'ang-ecommerce';
  isAuthenticated = false;
  userEmail?: string;
  userDisplayName?: string;
  isAuthView = false;
  readonly currentYear = new Date().getFullYear();
  term = '';
  cartTotal = 0;
  cartQty = 0;

  private readonly authSubscription: Subscription;
  private readonly routeSubscription: Subscription;
  private readonly cartTotalSubscription: Subscription;
  private readonly cartQtySubscription: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cartService: CartService,
    private readonly modalService: NgbModal
  ) {
    this.authSubscription = this.authService.currentUser$.subscribe((session) =>
      this.handleAuthChange(session)
    );

    this.routeSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isAuthView = this.checkAuthRoute(event.urlAfterRedirects);
      });

    // set initial view state
    this.isAuthView = this.checkAuthRoute(this.router.url);
    this.cartTotalSubscription = this.cartService.totalPrice.subscribe((value) => (this.cartTotal = value));
    this.cartQtySubscription = this.cartService.totalQuantity.subscribe((value) => (this.cartQty = value));
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.cartTotalSubscription.unsubscribe();
    this.cartQtySubscription.unsubscribe();
  }

  async logout(): Promise<void> {
    this.authService.logout();
    await this.router.navigate(['/login']);
  }

  onSearch(): void {
    const trimmedTerm = this.term.trim();

    if (trimmedTerm.length > 0) {
      this.router.navigate(['/search', trimmedTerm]);
      this.term = '';
    }
  }

  private handleAuthChange(session: AuthenticatedUser | null): void {
    this.isAuthenticated = !!session;
    this.userEmail = session?.email;
    this.userDisplayName = session?.fullName;
  }

  get isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  get userName(): string {
    return this.userDisplayName || this.userEmail || 'Account';
  }

  private checkAuthRoute(url: string): boolean {
    const cleanUrl = url.split('?')[0];
    return cleanUrl === '/login' || cleanUrl === '/register';
  }

  openSupportModal(modalContent: TemplateRef<any>): void {
    this.modalService.open(modalContent, {
      centered: true,
      size: 'lg',
      scrollable: true,
      windowClass: 'footer-support-modal'
    });
  }
}
