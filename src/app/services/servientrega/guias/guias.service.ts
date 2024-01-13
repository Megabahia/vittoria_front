import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GuiasService {

  constructor(private http: HttpClient) {
  }

  generarGuia(datos): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlServientrega}/api/guiawebs/`, datos);
  }

  generarGuiaRetorno(datos): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlServientrega}/api/GuiaRetornoNacional/`, datos);
  }

  generarGuiaRecaudo(datos): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlServientrega}/api/GuiaRecaudo`, datos);
  }

  generarGuiaPDFA4(datos): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlServientrega}/api/GuiasWeb/${datos}`);
  }

  generarGuiaDigitalPDF(datos): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlServientrega}/api/GuiaDigital/${datos}`);
  }

  generarGuiaFormatoSticker(datos): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlServientrega}/api/ImprimeSticker/${datos}`);
  }

  generarManifiestoPDF(datos): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlServientrega}/api/Manifiestos/${datos}`);
  }

  generarRotulosFormatoPDF(datos): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlServientrega}/api/ImprimeRotulos/${datos}`);
  }
}
