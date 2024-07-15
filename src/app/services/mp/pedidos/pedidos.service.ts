import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  inicializarGestionEntrega(): any {
    return {
      id: 0,
      entregoProducto: '',
      fechaEntrega: '',
      calificacion: '',
      estado: ''
    };
  }

  constructor(private http: HttpClient) {
  }

  obtenerListaPedidos(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/list`, datos);
  }

  crearPedido(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders`, datos);
  }

  obtenerListaPedidosBodega(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/list/bodega`, datos);
  }

  obtenerDetalleBodega(datos, id): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/listOne/bodega/${id}`, datos);
  }

  actualizarProductoBodega(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/update/bodega/${datos.id}`, datos);
  }

  actualizarPedido(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/update/${datos.id}`, datos);
  }

  devolucion(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/devolucion/${datos.id}`, datos);
  }

  actualizarPedidoFormData(datos: FormData): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/update/${datos.get('id')}`, datos);
  }

  obtenerPedido(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/api/v3/orders/listOne/${id}`);
  }

  exportar(filtros): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    let params = new HttpParams();
    // Iterar sobre los campos y agregar solo aquellos que tengan un valor
    for (const key in filtros) {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    }
    return this.http.get<any>(`${apiUrl}/api/v3/orders/exportar`, {params, ...httpOptions});
  }
}
