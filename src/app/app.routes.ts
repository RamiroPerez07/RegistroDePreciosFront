import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProductsComponent } from './components/products/products.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {path: "", component: ProductsComponent, canActivate: [authGuard]},
  {path: "products", component: ProductsComponent, canActivate: [authGuard]},
  {path: "login", component: LoginComponent}, // ruta del login
];
