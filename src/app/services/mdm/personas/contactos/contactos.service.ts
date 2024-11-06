import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;


export interface Contacto {
  nombres: string;
  apellidos: string;
  telefono: string;
  tipoCliente: string;
  whatsapp: string;
  facebook: string;
  twitter: string;
  instagram: string;
  correo1: string;
  correo2: string;
  pais: string;
  provincia: string;
  ciudad: string;
  canalOrigen: string;
  canal: string;
  metodoPago: string;
  codigoProducto: string;
  nombreProducto: string;
  precio: number;
  tipoPrecio: string;
  nombreVendedor: string;
  confirmacionContacto: string;
  imagen: string;
  comentariosVendedor: string;
  cantidad: string;
  tipoIdentificacion: string;
  identificacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactosService {

  constructor(private http: HttpClient) {
  }

  obtenerLista(parametros) {
    return this.http.post<any>(`${apiUrl}/mdm/contactos/list/`, parametros);
  }

  crearContactos(data) {
    return this.http.post<any>(`${apiUrl}/mdm/contactos/create/`, data);
  }

  obtenerContacto(id) {
    return this.http.get<any>(`${apiUrl}/mdm/contactos/listOne/${id}`);
  }

  insertarImagen(id, imagen) {
    return this.http.post<any>(`${apiUrl}/mdm/contactos/update/imagen/${id}`, imagen);
  }

  actualizarContacto(data) {
    // const data = {confirmacionContacto, comentariosVendedor};
    return this.http.post<any>(`${apiUrl}/mdm/contactos/update/${data.id}`, data);
  }
  actualizarEstadoContacto(id, nuevoEstado) {
    const payload = { estado: nuevoEstado };
    return this.http.post<any>(`${apiUrl}/mdm/contactos/update/${id}`, payload);
  }
  actualizarEstadoGestionContacto(id, nuevoEstado, estadoContacto, fechaVentaConcretada) {
    const payload = { estadoGestion: nuevoEstado, estado: estadoContacto,fecha_venta_concretada: fechaVentaConcretada};
    return this.http.post<any>(`${apiUrl}/mdm/contactos/update/${id}`, payload);
  }

  eliminarContacto(id) {
    return this.http.delete<any>(`${apiUrl}/mdm/contactos/delete/${id}`);
  }

  exportar(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/mdm/contactos/exportar/`, httpOptions);
  }
}
