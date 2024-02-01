import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CiudadesService {

  constructor(private http: HttpClient) {
  }

  obtenerCiudades(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/servientrega/api/ciudades/`);
  }
}
