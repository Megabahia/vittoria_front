import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {

  constructor(private http: HttpClient) {
  }

  cargarArchivoFacturas(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/facturacion/upload/facturas/`, datos);
  }

  obtenerFacturas(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/facturacion/facturas/list/`, datos);
  }

  obtenerFacturaId(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/facturacion/facturas/listOne/${id}`);
  }

  facturar(data): Observable<any> {
    return this.http.post<any>(`${apiUrl}/facturacion/facturas/facturar/`, data);
  }

  facturarLocales(data): Observable<any> {
    return this.http.post<any>(`${apiUrl}/facturacion/facturas/locales/facturar/`, data);
  }

  facturarWoocommerce(data): Observable<any> {
    return this.http.post<any>(`${apiUrl}/facturacion/facturas/woocommerce/facturar/`, data);
  }
}
