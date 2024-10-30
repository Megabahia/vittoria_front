import {Injectable} from '@angular/core';
import {
  Router, CanActivate
  , ActivatedRouteSnapshot, RouterStateSnapshot
} from '@angular/router';
import {AuthService} from '../services/admin/auth.service';


@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.authService.isLoggedIn()) {
      return true;
    }

    if (route.routeConfig.path === 'consulta/producto') {
      localStorage.removeItem('pedidosWoocommerceUsuario');
      localStorage.setItem('consultaProducto', JSON.stringify('Consultar productos'));
    } else if (route.routeConfig.path === 'pedidos/woocommerce') {
      localStorage.removeItem('consultaProducto');
      localStorage.setItem('pedidosWoocommerceUsuario', JSON.stringify('Consulta de pedidos por usuario'));
    } else {
      localStorage.removeItem('pedidosWoocommerceUsuario');
      localStorage.removeItem('consultaProducto');
      localStorage.setItem('paginaExterna', JSON.stringify('Desde página externa'));
    }

    if (Object.keys(route.queryParams).length > 0) {
      localStorage.removeItem('consultaProducto');
      localStorage.removeItem('pedidosWoocommerceUsuario');
      localStorage.removeItem('paginaExterna');
      localStorage.setItem('productosWoocommerce', JSON.stringify(route.queryParams));
    }

    this.router.navigate(['/auth/signin']);
    return false;
  }

}
