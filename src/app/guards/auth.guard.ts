import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);  // Inyectar el servicio de autenticación
  const router = inject(Router);  // Inyectar el Router

  // Si el usuario está autenticado, permitimos el acceso
  if (authService.isAuthenticated() && authService.checkTokenExpiration()) {
    return true;
  }

  // Si no está autenticado, redirigimos al login
  router.navigate(['/login']);
  return false;
};
