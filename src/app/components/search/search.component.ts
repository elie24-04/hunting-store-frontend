import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  keyword = '';

  constructor(private router: Router) {}

  onSubmit(): void {
    const trimmedKeyword = this.keyword.trim();

    if (trimmedKeyword.length > 0) {
      this.router.navigate(['/search', trimmedKeyword]);
      this.keyword = '';
    }
  }
}
