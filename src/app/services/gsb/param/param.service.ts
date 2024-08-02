import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class GdParamService {

  constructor(private http: HttpClient) {
  }

  obtenerListaParametrosGd(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gd/param/list/`, datos);
  }

  obtenerListaTiposGd(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/gd/param/list/tipo/`);
  }

  insertarParametroGd(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gd/param/create/`, datos);
  }

  editarParametroGd(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gd/param/update/${datos.id}`, datos);
  }

  eliminarParametroGd(id): Observable<any> {
    return this.http.delete<any>(`${apiUrl}/gd/param/delete/${id}`,);
  }

  obtenerParametroGd(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/gd/param/listOne/${id}`);
  }

  obtenerListaPadresGd(tipo): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gd/param/list/tipo/todos/`, {tipo});
  }

  obtenerParametroNombreTipoGd(nombre, tipo): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gd/param/list/listOne`, {nombre, tipo});
  }

  obtenerListaEstadoGd(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/gd/param/list/estado/`);
  }

  obtenerListaValorGd(valor): Observable<any>{
    return this.http.post<any>(`${apiUrl}/gd/param/list/valor/`, valor);
  }

  exportarGd(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/gd/param/exportar/`, httpOptions);
  }

  actualizarArchivoGd(id, data): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gd/param/update/${id}`, data);
  }
}
