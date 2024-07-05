import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class SuperBaratoService {


  constructor(private http: HttpClient) {
  }
  obtenerListaSuperBarato(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gsb/superbarato/list`, datos);
  }

  obtenerListaInventario(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gsb/superbarato/list/inventario`, datos);
  }

  crearNuevoSuperBarato(datos): Observable<any>{
    return this.http.post<any>(`${apiUrl}/gsb/superbarato/create`, datos);
  }

  obtenerSuperBarato(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/gsb/superbarato/listOne/${id}`);
  }

  actualizarSuperBarato(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gsb/superbarato/update/${datos.id}`, datos);
  }

  actualizarSuperBaratoFormData(datos: FormData): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gsb/superbarato/update/${datos.get('id')}`, datos);
  }

  validarCamposSuperBarato(datos): Observable<any>{
    return this.http.post<any>(`${apiUrl}/gsb/superbarato/validate/contact`, datos);
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
    return this.http.get<any>(`${apiUrl}/gsb/superbarato/exportar`, {params, ...httpOptions});
  }
}
