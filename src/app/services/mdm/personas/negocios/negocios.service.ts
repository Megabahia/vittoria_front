import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
const apiUrl: string = environment.apiUrl;
export interface DatosBasicos {
  tipoNegocio;
  ruc;
  razonSocial;
  nombreComercial;
  nacionalidad;
  fechaCreacionNegocio;
  edadNegocio;
  paisOrigen;
  paisResidencia;
  provinciaResidencia;
  ciudadResidencia;
  numeroEmpleados;
  segmentoActividadEconomica;
  profesion;
  actividadEconomica;
  llevarContabilidad;
  ingresosPromedioMensual;
  gastosPromedioMensual;
  numeroEstablecimientos;
  telefonoOficina;
  celularOficina;
  celularPersonal;
  whatsappPersonal;
  whatsappSecundario;
  correoPersonal;
  correoOficina;
  googlePlus;
  twitter;
  facebook;
  instagram;
  created_at;
  estado;
}
export interface Personal {
  id;
  negocio;
  tipoContacto;
  cedula;
  nombres;
  apellidos;
  telefonoFijo;
  extension;
  celularEmpresa;
  whatsappEmpresa;
  celularPersonal;
  whatsappPersonal;
  correoEmpresa;
  correoPersonal;
  estado;
  created_at;
}
export interface Direcciones {
  id;
  negocio;
  tipoDireccion;
  pais;
  provincia;
  ciudad;
  callePrincipal;
  numero;
  calleSecundaria;
  edificio;
  piso;
  oficina;
  referencia;
  created_at;
}
@Injectable({
  providedIn: 'root'
})
export class NegociosService {

  constructor(private http: HttpClient) { }
  inicializarDatosBasicos() {
    let datosBasicos = {
      tipoNegocio: "",
      ruc: "",
      razonSocial: "",
      nombreComercial: "",
      nacionalidad: "",
      fechaCreacionNegocio: "",
      edadNegocio: "",
      paisOrigen: "",
      paisResidencia: "",
      provinciaResidencia: "",
      ciudadResidencia: "",
      numeroEmpleados: "",
      segmentoActividadEconomica: "",
      profesion: "",
      actividadEconomica: "",
      llevarContabilidad: "",
      ingresosPromedioMensual:"",
      gastosPromedioMensual: "",
      numeroEstablecimientos: "",
      telefonoOficina: "",
      celularOficina: "",
      celularPersonal: "",
      whatsappPersonal: "",
      whatsappSecundario: "",
      correoPersonal: "",
      correoOficina: "",
      googlePlus: "",
      twitter: "",
      facebook: "",
      instagram: "",
      estado: 0,
      created_at: ""
    }
    return datosBasicos;
  }
  inicializarPersonal() {
    return {
      id: 0,
      negocio: "",
      tipoContacto: "",
      cedula: "",
      nombres: "",
      apellidos: "",
      telefonoFijo: "",
      extension: "",
      celularEmpresa: "",
      whatsappEmpresa: "",
      celularPersonal: "",
      whatsappPersonal: "",
      correoEmpresa: "",
      correoPersonal: "",
      estado: 0,
      created_at: ""
    }
  }
  inicializarDireccion() {
    return {
      id: 0,
      negocio: "",
      tipoDireccion: "",
      pais: "",
      provincia: "",
      ciudad: "",
      callePrincipal: "",
      numero: "",
      calleSecundaria: "",
      edificio: "",
      piso: "",
      oficina: "",
      referencia: "",
      created_at: "",
    }
  }
  obtenerListaNegocios(data) {
    return this.http.post<any>(`${apiUrl}/mdm/negocios/list/`, data);
  }
  obtenerNegocio(id){
    return this.http.get<any>(`${apiUrl}/mdm/negocios/listOne/${id}`);
  }
  crearDatosBasicos(datos) {
    return this.http.post<any>(`${apiUrl}/mdm/negocios/create/`, datos);
  }
  editarDatosBasicos(id, datos) {
    return this.http.post<any>(`${apiUrl}/mdm/negocios/update/${id}`, datos);
  }
  obtenerPersonal(id,datos){
    return this.http.post<any>(`${apiUrl}/mdm/negocios/personal/list/${id}`,datos);
  }
  crearPersonal(datos) {
    return this.http.post<any>(`${apiUrl}/mdm/negocios/personal/create/`, datos);
  }
  editarPersonal(datos) {
    return this.http.post<any>(`${apiUrl}/mdm/negocios/personal/update/${datos.id}`, datos);
  }
  obtenerUnPersonal(id){
    return this.http.get<any>(`${apiUrl}/mdm/negocios/personal/listOne/${id}`, );
  }
  eliminarPersonal(id){
    return this.http.delete<any>(`${apiUrl}/mdm/negocios/personal/delete/${id}`, );
  }
  obtenerDireccion(id,datos){
    return this.http.post<any>(`${apiUrl}/mdm/negocios/direcciones/list/${id}`,datos);
  }
  crearDireccion(datos) {
    return this.http.post<any>(`${apiUrl}/mdm/negocios/direcciones/create/`, datos);
  }
  editarDireccion(datos) {
    return this.http.post<any>(`${apiUrl}/mdm/negocios/direcciones/update/${datos.id}`, datos);
  }
  obtenerUnaDireccion(id){
    return this.http.get<any>(`${apiUrl}/mdm/negocios/direcciones/listOne/${id}`, );
  }
  eliminarDireccion(id){
    return this.http.delete<any>(`${apiUrl}/mdm/negocios/direcciones/delete/${id}`, );
  }
}
