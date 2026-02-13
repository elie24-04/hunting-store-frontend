import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Trip } from 'src/app/core/models/trip.model';
import { TripService } from 'src/app/services/trip.service';
import { GetResponseProducts, ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/common/product';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';
import { ProductCategory } from 'src/app/common/product-category';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  @Input() showHero = true;
  @Input() showTrips = true;
  @Input() showShotkam = true;

  products: Product[] = [];
  heroImageUrl = '/assets/images/wallpaper2.jpg';
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;
  isLoading = true;
  skeletonArray = Array.from({ length: 8 });
  adding: Record<number, boolean> = {};
  featuredTrips: Trip[] = [];
  categories: ProductCategory[] = [];
  categoriesReady = false;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  showReserveForm = false;
  reserveForm: FormGroup;
  formSubmitted = false;
  formSuccess = false;
  formError = '';

  previousKeyword = '';

  highlightFeatures = [
    {
      title: 'Field-Tested Durability',
      description: 'Every layer is trail-proven in wind, rain, and snow so you get gear that endures.',
    },
    {
      title: 'Tailored Outfit Pairings',
      description: 'Styling guides and kits make it easier to kit out for specific seasons or terrain.',
    },
    {
      title: 'Expedited Delivery',
      description: 'Free delivery on all orders plus in-stock alerts for restocks and limited runs.',
    },
  ];

  testimonial = {
    quote:
      '“Backcountry Outfitters never settles for “good enough.” Every vest, pant, and jacket is inspected with a guide’s eye before it reaches a hunter.”',
    author: 'Lena Hart',
    role: 'Field Prep Specialist, Ridge Outfitters',
  };

  trustedBy = ['Ridge Outfitters', 'Summit Hunting Co.', 'Wilder Trail Guides'];

  shotkamVideos = [
    {
      src: '/assets/videos/shotkam/10349f1375be441895a72cd871c65f66.mp4',
      caption: 'Balanced capture tech for long-range surveillance shots.'
    },
    {
      src: '/assets/videos/shotkam/aaa3842113134cb59bb0f4f569405b14.mp4',
      caption: 'Magnetic clamps and silent locks mount in seconds.'
    },
    {
      src: '/assets/videos/shotkam/561906caa0b1487981ce3b5400c07b36.mp4',
      caption: 'Thermal-ready sensors built for variable light in the field.'
    }
  ];

  playVideo(video: HTMLVideoElement) {
    video.play().catch(() => {});
  }

  pauseVideo(video: HTMLVideoElement) {
    video.pause();
  }

  constructor(
    private fb : FormBuilder,
    private http: HttpClient,
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService
  ) {
    this.reserveForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]]
    });
   }

   toggleReserveForm(): void{
    this.showReserveForm = !this.showReserveForm;
    this.formSubmitted = false;
    this.formSuccess = false;
    this.formError = '';
    this.reserveForm.reset();
   }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
    this.productService.getProductCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoriesReady = true;
        if (this.route.snapshot.paramMap.has('slug')) {
          this.listProducts();
        }
      },
      error: () => {
        this.categories = [];
        this.categoriesReady = true;
        if (this.route.snapshot.paramMap.has('slug')) {
          this.listProducts();
        }
      }
    });
    if (this.showTrips) {
      this.tripService.getTrips().subscribe((trips) => (this.featuredTrips = trips.slice(0, 3)));
    }
  }

  listProducts() {

    if (this.route.snapshot.paramMap.has('slug') && !this.categoriesReady) {
      return;
    }

    this.isLoading = true;

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();
    }

  }

  handleSearchProducts() {

    const theKeyword = this.route.snapshot.paramMap.get('keyword') ?? '';

    // if we have a different keyword than previous
    // then set thePageNumber to 1

    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);

    // now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber - 1,
                                               this.thePageSize,
                                               theKeyword)
                                               .pipe(finalize(() => (this.isLoading = false)))
                                               .subscribe(this.processResult());
                                               
  }

  handleListProducts() {
    const hasCategoryParam = this.route.snapshot.paramMap.has('slug') || this.route.snapshot.paramMap.has('id');
    if (!hasCategoryParam) {
      this.handleListAllProducts();
      return;
    }

    this.currentCategoryId = this.resolveCategoryId();

    //
    // Check if we have a different category than previous
    // Note: Angular will reuse a component if it is currently being viewed
    //

    // if we have a different category id than previous
    // then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    // now get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber - 1,
                                               this.thePageSize,
                                               this.currentCategoryId)
                                               .pipe(finalize(() => (this.isLoading = false)))
                                               .subscribe(this.processResult());
  }

  handleListAllProducts() {
    this.productService.getAllProductsPaginate(this.thePageNumber - 1,
                                               this.thePageSize)
                                               .pipe(finalize(() => (this.isLoading = false)))
                                               .subscribe(this.processResult());
  }

  processResult() {
    return (data: GetResponseProducts) => {
      this.products = data._embedded?.products ?? [];
      this.thePageNumber = data.page?.number !== undefined ? data.page.number + 1 : 1;
      this.thePageSize = data.page?.size ?? this.thePageSize;
      this.theTotalElements = data.page?.totalElements ?? this.theTotalElements;
    };
  }

  updatePageSize(pageSize: string) {
    const parsedPageSize = Number(pageSize);
    this.thePageSize = Number.isNaN(parsedPageSize) ? this.thePageSize : parsedPageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCart(theProduct: Product) {
    const productId = theProduct.id ?? 0;

    if (this.adding[productId]) {
      return;
    }

    this.adding[productId] = true;

    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);

    setTimeout(() => {
      this.adding[productId] = false;
    }, 250);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/products/placeholder.png';
  }

  goShop(): void {
    this.router.navigate(['/products']);
  }

  private resolveCategoryId(): number {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      const matched = this.categories.find((category) => this.slugify(category.categoryName) === slug);
      return matched?.id ?? 1;
    }

    const categoryIdParam = this.route.snapshot.paramMap.get('id');
    if (categoryIdParam) {
      const categoryId = Number(categoryIdParam);
      return Number.isNaN(categoryId) ? 1 : categoryId;
    }

    return 1;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

}
