import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles: string[] = route.data['roles'] ?? [];
    if (allowedRoles.length && !allowedRoles.includes(this.authService.getRole || '')) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}