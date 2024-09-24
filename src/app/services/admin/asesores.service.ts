import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AsesoresService {

  constructor(private http: HttpClient) { }

  insertarAsesor(asesor): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/asesores/create/`, asesor);
  }

  obtenerAsesoresRegistrados(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/asesores/list/`, datos);
  }

  confirmarAsesor(id, nuevoEstado) {
    const payload = { estado: nuevoEstado };
    return this.http.post<any>(`${apiUrl}/mdm/asesores/update/${id}`, payload);
  }
}
