import { Component, OnInit } from '@angular/core';
import { ProductCategory } from 'src/app/common/product-category';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-category-menu',
  templateUrl: './product-category-menu.component.html',
  styleUrls: ['./product-category-menu.component.css']
})
export class ProductCategoryMenuComponent implements OnInit {
  productCategories: ProductCategory[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.listProductCategories();
  }

  listProductCategories(): void {
    this.productService.getProductCategories().subscribe({
      next: data => {
        console.log('Loaded product categories', data);
        this.productCategories = data;
      },
      error: err => {
        console.error('Failed to load product categories', err);
        this.productCategories = [];
      }
    });
  }

  toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  iconForCategory(categoryName: string): string {
    const key = (categoryName || '').toLowerCase();
    if (key.includes('gun') || key.includes('firearm') || key.includes('rifle')) {
      return '🔫';
    }
    if (key.includes('cloth') || key.includes('apparel') || key.includes('gear') || key.includes('outerwear')) {
      return '🧢';
    }
    if (key.includes('trip') || key.includes('hunt') || key.includes('adventure')) {
      return '🧭';
    }
    return categoryName ? categoryName.charAt(0).toUpperCase() : '•';
  }
}
