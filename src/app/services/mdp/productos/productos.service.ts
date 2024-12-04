import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {BehaviorSubject, Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

export interface Producto {
  id;
  canal;
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
  precioVentaF;
  precioVentaBultos;
  parametrizacion;
  estado;
  variableRefil;
  imagenes;
  fechaCaducidad;
  fechaElaboracion;
  caracteristicas;
  precioOferta;
  envioNivelNacional;
  lugarVentaProvincia;
  lugarVentaCiudad;
  courier;
  estadoLanding;
  video?;
  precioLanding;
  precioLandingOferta;
  idPadre;
  proveedor;
  stockVirtual?;
  peso;
  tamanio;
  link_catalogo;
  link_tienda;
  porcentaje_comision;
  valor_comision;
  titulo_uno;
  titulo_dos;
  titulo_tres;
  titulo_cuatro;
  titulo_cinco;
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

  //COMPARTIR DATOS
  private dataSource = new BehaviorSubject<any>(null);
  currentData = this.dataSource.asObservable();

  constructor(private http: HttpClient) {
  }

  inicializarProducto(): Producto {
    return {
      id: 0,
      canal: '',
      categoria: '',
      subCategoria: '',
      nombre: '',
      descripcion: '',
      codigoBarras: '',
      refil: 0,
      stock: 0,
      costoCompra: 0,
      precioVentaA: 0,
      precioVentaB: 0,
      precioVentaC: 0,
      precioVentaD: 0,
      precioVentaE: 0,
      precioVentaF: 0,
      precioVentaBultos: 0,
      parametrizacion: 0,
      estado: '',
      variableRefil: '',
      imagenes: [],
      fechaCaducidad: '',
      fechaElaboracion: '',
      caracteristicas: '',
      proveedor: '',
      precioOferta: '',
      envioNivelNacional: true,
      lugarVentaProvincia: '',
      lugarVentaCiudad: '',
      courier: '',
      estadoLanding: true,
      precioLanding: 0,
      precioLandingOferta: 0,
      idPadre: '',
      stockVirtual: [
        {
          canal: 'superbarato.megadescuento.com', estado: false
        }, {
          canal: 'vittoria-test.netlify.app', estado: false
        }, {
          canal: 'maxidescuento.megadescuento.com', estado: false
        }, {
        canal: 'megabahia.megadescuento.com', estado: false
      }, {
        canal: 'tiendamulticompras.megadescuento.com',
        estado: false
      }, {canal: 'contraentrega.megadescuento.com', estado: false}, {
        canal: 'mayorista.megadescuento.com',
        estado: false
      }, {canal: 'megadescuento.com', estado: false}, {canal: 'todomegacentro.megadescuento.com', estado: false}
      ],
      peso: 0,
      tamanio: 0,
      link_catalogo: '',
      link_tienda: '',
      porcentaje_comision: 0,
      valor_comision: 0,
      titulo_uno: '',
      titulo_dos: '',
      titulo_tres: '',
      titulo_cuatro: '',
      titulo_cinco: '',
    };
  }

  inicializarFichaTecnica(): FichaTecnicaProducto {
    return {
      id: 0,
      producto: 0,
      codigo: '',
      nombreAtributo: '',
      valor: ''
    };
  }

  updateData(data: any) {
    this.dataSource.next(data);
  }

  obtenerListaProductos(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/list/`, datos);
  }

  obtenerProducto(id) {
    return this.http.get<any>(`${apiUrl}/mdp/productos/listOne/${id}`);
  }

  obtenerProductoPorCodigo(codigo) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/search/producto/codigo/`, codigo);
  }
  obtenerProductoPorCodigoCanal(codigo) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/search/producto/codigo/canal/`, codigo);
  }

  enviarGmailInconsistencias(id) {
    return this.http.get<any>(`${apiUrl}/api/v3/orders/notificacion/${id}`);
  }

  crearProducto(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/create/`, datos);
  }

  actualizarProducto(datos, id) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/update/${id}`, datos);
  }

  eliminarProducto(id) {
    return this.http.delete<any>(`${apiUrl}/mdp/productos/delete/${id}`);
  }

  cargarStock(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/upload/excel/`, datos);
  }

  buscarListaProductos(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/search/producto/`, datos);
  }

  obtenerListaRefil(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/refil/list/`, datos);
  }

  obtenerListaAbastecimiento(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/abastecimiento/list/`, datos);
  }

  obtenerListaStock(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/stock/list/`, datos);
  }

  obtenerListaCaducidad(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/caducidad/list/`, datos);
  }

  obtenerListaRotacion(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/rotacion/list/`, datos);
  }

  eliminarImagen(id) {
    return this.http.delete<any>(`${apiUrl}/mdp/productos/imagen/delete/${id}`);
  }

  obtenerFichasTecnicas(id) {
    return this.http.get<any>(`${apiUrl}/mdp/fichaTecnicaProductos/list/${id}`);
  }

  obtenerFichaTecnica(id) {
    return this.http.get<any>(`${apiUrl}/mdp/fichaTecnicaProductos/listOne/${id}`);
  }

  crearFichaTecnica(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/fichaTecnicaProductos/create/`, datos);
  }

  editarFichaTecnica(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/fichaTecnicaProductos/update/${datos.id}`, datos);
  }

  eliminarFichaTecnica(id) {
    return this.http.delete<any>(`${apiUrl}/mdp/fichaTecnicaProductos/delete/${id}`);
  }

  obtenerProductoFree(id, data) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/listOne/free/${id}`, data);
  }

  obtenerProductoCodigo(codigo) {
    return this.http.get<any>(`${apiUrl}/mdp/productos/listOne/codigoProducto/${codigo}`);
  }

  obtenerReporteHtmlProductos(filtros) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/exportar/html/`, filtros);
  }

  exportar(filtros): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    let params = new HttpParams();
    // Iterar sobre los campos y agregar solo aquellos que tengan un valor
    for (const key in filtros) {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    }
    return this.http.get<any>(`${apiUrl}/mdp/productos/exportar`, {params, ...httpOptions});
  }

  copiarProducto(data, id) {
    return this.http.post<any>(`${apiUrl}/mdp/productos/copy/${id}`, data);
  }

  //CREAR TOKEN PARA CONTROLAR EL TIEMPO AL EXPORTAR HTML
  generarTokenReporteProductos(datos){
    return this.http.post<any>(`${apiUrl}/mdp/token-reporte-productos/create`, datos);
  }
}
