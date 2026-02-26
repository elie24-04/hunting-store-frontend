import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EcomFormServiceService } from '../../services/ecom-form-service.service';
import { ECommValidator } from '../../validators/e-comm-validator';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Router } from '@angular/router';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from 'src/app/common/payment-info';
import { COUNTRIES, Country } from 'src/app/data/countries';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {

  checkoutFormGroup!: FormGroup;

  totalPrice = 0;
  totalQuantity = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = COUNTRIES;


  //initialize stripe

  stripe: any = null;
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement : any;
  displayError : any= "";
  private isCardMounted = false;
  private paymentPanelShownHandler = () => this.mountCardElement(true);
  private mountRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private mountAttempts = 0;
  storage: Storage = sessionStorage;

  isDisabled: boolean = false;
  showOrderSuccess = false;
  orderTrackingNumber = '';

  constructor(private formBuilder: FormBuilder,
    private formService: EcomFormServiceService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }

   ngOnInit(): void {
    this.reviewCartDetails();

    // read the user's email address from browser storage
    const storedEmail = this.storage.getItem('userEmail');
    const theEmail = storedEmail ? JSON.parse(storedEmail) : '';

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', 
                              [Validators.required, 
                               Validators.minLength(2), 
                               ECommValidator.notOnlyWhitespace]),

        lastName:  new FormControl('', 
                              [Validators.required, 
                               Validators.minLength(2), 
                               ECommValidator.notOnlyWhitespace]),
                               
        email: new FormControl(theEmail,
                              [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), 
                                     ECommValidator.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), 
                                   ECommValidator.notOnlyWhitespace]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), 
                                      ECommValidator.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), 
                                     ECommValidator.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), 
                                   ECommValidator.notOnlyWhitespace]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), 
                                      ECommValidator.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType: new FormControl('', [Validators.required]),
        nameOnCard:  new FormControl('', [Validators.required, Validators.minLength(2), 
                                          Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
        */
      })
    });


  }
  ngAfterViewInit(): void {
    this.setupStripePaymentForm();
    this.mountCardElement();
    this.scheduleMountRetries();

    const paymentPanel = document.getElementById('collapsePayment');
    paymentPanel?.addEventListener('shown.bs.collapse', this.paymentPanelShownHandler);
  }

  ngOnDestroy(): void {
    const paymentPanel = document.getElementById('collapsePayment');
    paymentPanel?.removeEventListener('shown.bs.collapse', this.paymentPanelShownHandler);

    if (this.cardElement && this.isCardMounted) {
      this.cardElement.unmount();
      this.isCardMounted = false;
    }

    if (this.mountRetryTimer) {
      clearTimeout(this.mountRetryTimer);
      this.mountRetryTimer = null;
    }
  }

  setupStripePaymentForm() {
    if (!this.initStripe()) {
      return;
    }

    // get a handle to stripe elements
    var elements = this.stripe.elements();

    const isNewCardElement = !this.cardElement;
    if (isNewCardElement) {
      // Create a card element ... and hide the zip-code field
      this.cardElement = elements.create('card', { hidePostalCode: true });
    }

    if (isNewCardElement) {
      // Add event binding for the 'change' event on the card element
      this.cardElement.on('change', (event: any) => {

        // get a handle to card-errors element
        this.displayError = document.getElementById('card-errors');

        if (event.complete) {
          this.displayError.textContent = "";
        } else if (event.error) {
          // show validation error to customer
          this.displayError.textContent = event.error.message;
        }

      });
    }
  }

  private initStripe(): boolean {
    if (this.stripe) {
      return true;
    }

    const stripeFactory = (window as any).Stripe;
    if (!stripeFactory) {
      this.displayError = document.getElementById('card-errors');
      if (this.displayError) {
        this.displayError.textContent = 'Stripe script is still loading. Please wait a second.';
      }
      return false;
    }

    this.stripe = stripeFactory(environment.stripePublishableKey);
    return true;
  }

  private mountCardElement(forceRemount: boolean = false): void {
    if (!this.cardElement) {
      return;
    }

    const host = document.getElementById('card-element');
    if (!host) {
      return;
    }

    if (forceRemount && this.isCardMounted) {
      this.cardElement.unmount();
      this.isCardMounted = false;
    }

    if (!this.isCardMounted) {
      try {
        this.cardElement.mount('#card-element');
        this.isCardMounted = true;
      } catch {
        this.isCardMounted = false;
      }
    }
  }

  private scheduleMountRetries(): void {
    if (this.isCardMounted || this.mountAttempts >= 20) {
      if (!this.isCardMounted) {
        this.displayError = document.getElementById('card-errors');
        if (this.displayError) {
          this.displayError.textContent = 'Unable to load card input. Please refresh and disable ad-block for Stripe.';
        }
      }
      return;
    }

    this.mountAttempts++;
    this.mountRetryTimer = setTimeout(() => {
      if (!this.cardElement) {
        this.setupStripePaymentForm();
      }
      this.mountCardElement(true);
      this.scheduleMountRetries();
    }, 250);
  }
   reviewCartDetails() {

    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

  }

  get firstName(): FormControl { return this.checkoutFormGroup.get('customer.firstName') as FormControl; }
  get lastName(): FormControl { return this.checkoutFormGroup.get('customer.lastName') as FormControl; }
  get email(): FormControl { return this.checkoutFormGroup.get('customer.email') as FormControl; }

  get shippingAddressStreet(): FormControl { return this.checkoutFormGroup.get('shippingAddress.street') as FormControl; }
  get shippingAddressCity(): FormControl { return this.checkoutFormGroup.get('shippingAddress.city') as FormControl; }
  get shippingAddressZipCode(): FormControl { return this.checkoutFormGroup.get('shippingAddress.zipCode') as FormControl; }
  get shippingAddressCountry(): FormControl { return this.checkoutFormGroup.get('shippingAddress.country') as FormControl; }

  get billingAddressStreet(): FormControl { return this.checkoutFormGroup.get('billingAddress.street') as FormControl; }
  get billingAddressCity(): FormControl { return this.checkoutFormGroup.get('billingAddress.city') as FormControl; }
  get billingAddressZipCode(): FormControl { return this.checkoutFormGroup.get('billingAddress.zipCode') as FormControl; }
  get billingAddressCountry(): FormControl { return this.checkoutFormGroup.get('billingAddress.country') as FormControl; }

  get creditCardType(): FormControl { return this.checkoutFormGroup.get('creditCard.cardType') as FormControl; }
  get creditCardNameOnCard(): FormControl { return this.checkoutFormGroup.get('creditCard.nameOnCard') as FormControl; }
  get creditCardNumber(): FormControl { return this.checkoutFormGroup.get('creditCard.cardNumber') as FormControl; }
  get creditCardSecurityCode(): FormControl { return this.checkoutFormGroup.get('creditCard.securityCode') as FormControl; }

  copyShippingAddressToBillingAddress(event: Event) {

    const checkbox = event.target as HTMLInputElement | null;
    const shippingAddressGroup = this.checkoutFormGroup.get('shippingAddress');
    const billingAddressGroup = this.checkoutFormGroup.get('billingAddress');

    if (!shippingAddressGroup || !billingAddressGroup) {
      return;
    }

    if (checkbox?.checked) {
      billingAddressGroup.setValue(shippingAddressGroup.value);
    } else {
      billingAddressGroup.reset();
    }
  }

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order(this.totalQuantity, this.totalPrice);
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way of doing the same thingy
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem.imageUrl!, tempCartItem.unitPrice!, tempCartItem.quantity, tempCartItem.id!));

    // set up purchase
    let purchase = new Purchase();
    
    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    
    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    purchase.shippingAddress.state = '';

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    purchase.billingAddress.state = '';
  
    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = this.totalPrice * 100;
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {

      this.isDisabled = true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                    address: {
                      line1: purchase.billingAddress.street,
                      city: purchase.billingAddress.city,
                      postal_code: purchase.billingAddress.zipCode,
                      country: purchase.billingAddress.country
                    }
                }
              }
            }, { handleActions: false })
          .then((result: any) => {
            if (result.error) {
              // inform the customer there was an error
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {
              // call REST API via the CheckoutService
              this.checkoutService.placeOrder(purchase).subscribe({
                next: (response: any) => {
                  this.orderTrackingNumber = response.orderTrackingNumber ?? '';
                  this.showOrderSuccess = true;
                  this.isDisabled = false;
                },
                error: (err: any) => {
                  alert(`There was an error: ${err.message}`);
                  this.isDisabled = false;
                }
              })
            }            
          });
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

  }
  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  placeOrder(): void {
    this.onSubmit();
  }

  closeOrderSuccess(): void {
    this.showOrderSuccess = false;
    this.resetCart();
  }

  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    if (!creditCardFormGroup) {
      return;
    }

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.formService.getCreditCardMonths(startMonth).subscribe(
      (data: number[]) => {
        console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

}
