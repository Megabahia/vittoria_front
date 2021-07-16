import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const apiUrl: string = environment.apiUrl;

export interface Producto {
  id;
  categoria;
  subCategoria;
  nombre;
  descripcion;
  codigoBarras;
  refil;
  stock;
  caducidad;
  costoCompra;
  precioVentaA;
  precioVentaB;
  precioVentaC;
  precioVentaD;
  precioVentaE;
  precioVentaBultos;
  alertaAbastecimiento;
  estado;
  variableRefil;
}
export interface FichaTecnicaProducto {
  id;
  producto;
  codigo;
  nombreAtributo;
  valor;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private http: HttpClient) { }
  inicializarProducto() {
    return {
      id: 0,
      categoria: "",
      subCategoria: "",
      nombre: "",
      descripcion: "",
      codigoBarras: "",
      refil: 0,
      stock: 0,
      caducidad: "",
      costoCompra: 0,
      precioVentaA: 0,
      precioVentaB: 0,
      precioVentaC: 0,
      precioVentaD: 0,
      precioVentaE: 0,
      precioVentaBultos: 0,
      alertaAbastecimiento: "",
      estado: "",
      variableRefil:""
    }
  }
  inicializarFichaTecnica() {
    return {
      id: 0,
      producto: 0,
      codigo: "",
      nombreAtributo: "",
      valor: ""
    }
  }
  obtenerListaProductos(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/list/`, datos);
  }
  obtenerProducto(id) {
    return this.http.get<any>(`${apiUrl}/mdp/productos/listOne/${id}`);
  }
  crearProducto(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/create/`, datos);
  }
  actualizarProducto(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/update/${datos.id}`, datos);
  }
  eliminarProducto(id){
    return this.http.delete<any>(`${apiUrl}/mdp/productos/delete/${id}` );
  }
  obtenerFichasTecnicas(id){
    return this.http.get<any>(`${apiUrl}/mdp/fichaTecnicaProductos/list/${id}` );
  }
  obtenerFichaTecnica(id){
    return this.http.get<any>(`${apiUrl}/mdp/fichaTecnicaProductos/listOne/${id}` );
  }
  crearFichaTecnica(datos){
    return this.http.post<any>(`${apiUrl}/mdp/fichaTecnicaProductos/create/`,datos );
  }
  editarFichaTecnica(datos){
    return this.http.post<any>(`${apiUrl}/mdp/fichaTecnicaProductos/update/${datos.id}`,datos );
  }
  eliminarFichaTecnica(id){
    return this.http.delete<any>(`${apiUrl}/mdp/fichaTecnicaProductos/delete/${id}` );
  }
}
