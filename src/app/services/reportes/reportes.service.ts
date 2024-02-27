import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(private http: HttpClient) {
  }

  obtenerReporteProductos(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/facturas/reporte/productos`, datos);
  }

  obtenerReporteClientes(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/facturas/reporte/clientes`, datos);
  }

  obtenerClientesCompras(codigoProducto): Observable<any> {
    return this.http.get<any>(`${apiUrl}/mdm/facturas/clientes/compra/${codigoProducto}`);
  }
}
