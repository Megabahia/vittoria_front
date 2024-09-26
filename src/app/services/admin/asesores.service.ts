import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AsesoresService {

  constructor(private http: HttpClient) {
  }

  insertarAsesor(asesor): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/asesores/create/`, asesor);
  }

  obtenerAsesoresRegistrados(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/asesores/list/`, datos);
  }

  obtenerAsesor(id) {
    return this.http.get<any>(`${apiUrl}/mdm/asesores/listOne/${id}`);
  }

  confirmarAsesor(datos) {
    //const payload = {estado: nuevoEstado};
    return this.http.post<any>(`${apiUrl}/mdm/asesores/update/status/${datos.id}`, datos);
  }

  activarDesactivarAsesor(id, nuevoEstado, status) {
    const payload = {estado: nuevoEstado, state: status};
    return this.http.post<any>(`${apiUrl}/mdm/asesores/activate/${id}`, payload);
  }

  actualizarAsesorFormData(datos: FormData): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/asesores/update/${datos.get('id')}`, datos);
  }

  actualizarAsesor(id, datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/asesores/update/${id}`, datos);
  }
}
