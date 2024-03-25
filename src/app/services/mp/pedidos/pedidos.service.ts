import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
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

  actualizarPedido(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/update/${datos.id}`, datos);
  }

  actualizarPedidoFormData(datos: FormData): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/v3/orders/update/${datos.get('id')}`, datos);
  }

  obtenerPedido(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/api/v3/orders/listOne/${id}`);
  }
}
