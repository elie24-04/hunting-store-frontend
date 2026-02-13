import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl'
})
export class ImageUrlPipe implements PipeTransform {

  private readonly defaultPlaceholder = '/assets/images/products/placeholder.png';

  transform(imageUrl?: string | null, fallback?: string): string {
    const safeFallback = this.normalizeUrl(fallback ?? this.defaultPlaceholder);

    if (!imageUrl?.trim()) {
      return safeFallback;
    }

    return this.normalizeUrl(imageUrl);
  }

  private normalizeUrl(value: string): string {
    // normalize separators to forward slashes so the browser can resolve the path
    const normalized = value.trim().replace(/\\/g, '/');
    const withoutSrc = normalized.replace(/^src\//i, '');
    const strippedLeading = withoutSrc.replace(/^\/+/, '');
    return `/${strippedLeading}`;
  }
}
