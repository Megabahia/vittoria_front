import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ContactosService {


  constructor(private http: HttpClient) {
  }
  obtenerListaContactos(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/gdc/contact/list`, datos);
  }

  crearNuevoContacto(datos): Observable<any>{
    return this.http.post<any>(`${apiUrl}/gdc/contact/create`, datos);
  }

  obtenerContacto(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/gdc/contact/listOne/${id}`);
  }

}