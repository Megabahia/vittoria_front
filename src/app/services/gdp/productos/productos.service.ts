import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';

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
  costoCompra;
  precioVentaA;
  precioVentaB;
  precioVentaC;
  precioVentaD;
  precioVentaE;
  precioVentaBultos;
  parametrizacion;
  estado;
  variableRefil;
  imagenes;
  fechaCaducidad;
  fechaElaboracion;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {


  constructor(private http: HttpClient) {
  }

  inicializarProducto(): any {
    return {
      id: 0,
      titulo: '',
      subtitulo: '',
      precio: '',
      video: '',
      descripcion: '',
      caracteristicas: '',
      estado: '',
      imagenes: [],
    };
  }

  obtenerListaProductos(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/list/`, datos);
  }

  obtenerProducto(id) {
    return this.http.get<any>(`${apiUrl}/gdp/productos/listOne/${id}`);
  }

  obtenerProductoPorCodigo(codigo) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/search/producto/codigo/`, codigo);
  }

  crearProducto(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/create/`, datos);
  }

  actualizarProducto(datos, id) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/update/${id}`, datos);
  }

  eliminarProducto(id) {
    return this.http.delete<any>(`${apiUrl}/gdp/productos/delete/${id}`);
  }

  cargarStock(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/upload/excel/`, datos);
  }

  buscarListaProductos(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/search/producto/`, datos);
  }

  obtenerListaRefil(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/refil/list/`, datos);
  }

  obtenerListaAbastecimiento(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/abastecimiento/list/`, datos);
  }

  obtenerListaStock(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/stock/list/`, datos);
  }

  obtenerListaCaducidad(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/caducidad/list/`, datos);
  }

  obtenerListaRotacion(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/productos/rotacion/list/`, datos);
  }

  eliminarImagen(id) {
    return this.http.delete<any>(`${apiUrl}/gdp/productos/imagen/delete/${id}`);
  }

  obtenerFichasTecnicas(id) {
    return this.http.get<any>(`${apiUrl}/gdp/fichaTecnicaProductos/list/${id}`);
  }

  obtenerFichaTecnica(id) {
    return this.http.get<any>(`${apiUrl}/gdp/fichaTecnicaProductos/listOne/${id}`);
  }

  crearFichaTecnica(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/fichaTecnicaProductos/create/`, datos);
  }

  editarFichaTecnica(datos) {
    return this.http.post<any>(`${apiUrl}/gdp/fichaTecnicaProductos/update/${datos.id}`, datos);
  }

  eliminarFichaTecnica(id) {
    return this.http.delete<any>(`${apiUrl}/gdp/fichaTecnicaProductos/delete/${id}`);
  }

  obtenerProductoFree(id) {
    return this.http.get<any>(`${apiUrl}/gdp/productos/listOne/free/${id}`);
  }
}
