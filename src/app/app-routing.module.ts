import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { LoginComponent } from './components/login/login.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductsPageComponent } from './components/products-page/products-page.component';
import { RegisterComponent } from './components/register/register.component';
import { TripDetailsComponent } from './components/trip-details/trip-details.component';
import { TripsPageComponent } from './components/trips-page/trips-page.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'search/:keyword', component: ProductsPageComponent },
  { path: 'products/category/:slug', component: ProductsPageComponent },
  { path: 'category/:id', component: ProductsPageComponent },
  { path: 'products', component: ProductsPageComponent },
  { path: 'trips', component: TripsPageComponent },
  { path: 'trips/:id', component: TripDetailsComponent },
  { path: 'cart-details', component: CartDetailsComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  {
    path: 'message',
    loadChildren: () => import('./pages/message/message.module').then((m) => m.MessageModule)
  },
  { path: '', component: ProductListComponent },
  { path: '**', redirectTo: '/products', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
