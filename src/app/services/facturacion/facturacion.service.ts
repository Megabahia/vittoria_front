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
}
