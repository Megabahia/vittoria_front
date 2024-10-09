import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class GestionInventarioService {


  constructor(private http: HttpClient) {
  }

  cargarProductosProveedores(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdp/gestion-inventario/cargar-productos-proveedores/`, datos);
  }

  filtrarProductosProveedores(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdp/productos/list/`, datos);
  }

  obtenerProveedores(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/mdp/gestion-inventario/proveedores/`);
  }

  cargarStock(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdp/gestion-inventario/cargar/stock/`, datos);
  }
  cargarStockMegabahia(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdp/gestion-inventario/cargar/stock/megabahia`, datos);
  }
  cargarStockCanal(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdp/gestion-inventario/cargar/stock/canales`, datos);
  }

  exportar(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/mdp/gestion-inventario/exportar/`, httpOptions);
  }

  reporteProductosStock(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/mdp/gestion-inventario/exportar/productos/stock/`, httpOptions);
  }

  sincronizarFotos(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/mdp/gestion-inventario/sincronizar/fotos/productos/`);
  }
}
