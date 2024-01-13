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

  obtenerCiudades(datos): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlServientrega}/api/ciudades/${datos}`);
  }
}
