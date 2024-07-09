import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class GmbMegabahiaService {


  constructor(private http: HttpClient) {
  }
  obtenerListaMegabahiaDespachos(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gmb/megabahia/list`, datos);
  }

  crearNuevoMegabahiaDespacho(datos): Observable<any>{
    return this.http.post<any>(`${apiUrl}/gmb/megabahia/create`, datos);
  }

  obtenerMegabahiaDespacho(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/gmb/megabahia/listOne/${id}`);
  }

  actualizarMegabahiaDespacho(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gmb/megabahia/update/${datos.id}`, datos);
  }

  actualizarMegabahiaDespachoFormData(datos: FormData): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gmb/megabahia/update/${datos.get('id')}`, datos);
  }

  validarCamposMegabahiaDespacho(datos): Observable<any>{
    return this.http.post<any>(`${apiUrl}/gmb/megabahia/validate/contact`, datos);
  }
}
