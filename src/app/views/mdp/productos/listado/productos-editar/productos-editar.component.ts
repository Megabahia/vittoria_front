import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbPagination, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriasService } from '../../../../../services/mdp/productos/categorias/categorias.service';
import { Producto, ProductosService } from '../../../../../services/mdp/productos/productos.service';
import { SubcategoriasService } from '../../../../../services/mdp/productos/subcategorias/subcategorias.service';
import { map } from 'rxjs/operators';
import { ParamService } from 'src/app/services/mdp/param/param.service';

@Component({
  selector: 'app-productos-editar',
  templateUrl: './productos-editar.component.html'
})
export class ProductosEditarComponent implements OnInit {
  @Input() idProducto;
  @ViewChild(NgbPagination) paginator: NgbPagination;
  producto: Producto;
  datosProducto: FormData = new FormData();
  categoriasOpciones;
  subcategoriasOpciones;
  fichaTecnica;
  fichaTecnicaLista;
  idFichaTecnica;
  abastecimientoOpciones;
  archivos:File[] = [];
  constructor(
    private categoriasService: CategoriasService,
    private subcategoriasService: SubcategoriasService,
    private productosService: ProductosService,
    private modalService: NgbModal,
    private paramService: ParamService 
  ) {
    this.producto = this.productosService.inicializarProducto();
    this.fichaTecnica = this.productosService.inicializarFichaTecnica();
  }

  ngOnInit(): void {
    this.obtenerAbastecimientoOpciones();
    this.obtenerCategoriasOpciones();
    if (this.idProducto != 0) {
      this.obtenerProducto();
      this.obtenerFichasTecnicas();
    }
  }
  obtenerProducto() {
    this.productosService.obtenerProducto(this.idProducto).subscribe((info) => {
      let producto = info;
      let imagenes = info.imagenes;
      delete producto.imagenes; 
      this.producto = producto;
      this.obtenerListaSubcategorias();
    });
  }
  async obtenerAbastecimientoOpciones() {
    await this.paramService.obtenerListaPadres("ALERTA_ABASTECIMIENTO").subscribe((info) => {
      this.abastecimientoOpciones = info;
    });
  }
  obtenerFichasTecnicas() {
    this.productosService.obtenerFichasTecnicas(this.idProducto).subscribe((info) => {
      this.fichaTecnicaLista = info.info;
    });
  }
  async obtenerCategoriasOpciones() {
    await this.categoriasService.obtenerListaCategorias().subscribe((info) => {
      this.categoriasOpciones = info;
    });
  }
  async obtenerListaSubcategorias() {
    await this.subcategoriasService.obtenerListaSubcategoriasHijas(this.producto.categoria).subscribe((info) => {
      this.subcategoriasOpciones = info;
    });
  }

  onSelect(event) {
    this.archivos.push(...event.addedFiles);
  }

  onRemove(event) {
    this.archivos.splice(this.archivos.indexOf(event), 1);
  }
  removeAll() {
    this.archivos = [];
  }
  guardarProducto() {
    let llaves = Object.keys(this.producto);
    let valores = Object.values(this.producto);

    valores.map((valor, pos) => {
        this.datosProducto.append(llaves[pos], valor)
    });
    // this.files.map((archivo, pos) => {
      

    // this.productosService.crearProducto(this.datosProducto).subscribe((info) => {
    //   console.log(info);
    // });
    if (this.idProducto != 0) {
      //   this.archivos.map((valor, pos) => {
      //   this.datosProducto.append("imagenes[" + pos + "].id", valor.id);
      //   this.datosProducto.append("imagenes[" + pos + "].imagen", valor.imagen);
      //   this.datosProducto.append("imagenes[" + pos + "].producto", this.producto.id);
      // });
      console.log(this.archivos);
      this.archivos.map((valor, pos) => {
        this.datosProducto.append("imagenes[" + pos + "].imagen", valor);
      });
      this.productosService.actualizarProducto(this.datosProducto, this.producto.id).subscribe((info) => {
        console.log(info);
      });
    } else {
      this.archivos.map((valor, pos) => {
        this.datosProducto.append("imagenes[" + pos + "].imagen", valor);
      });
      this.productosService.crearProducto(this.datosProducto).subscribe((info) => {
        console.log(info);
      });
    }
  }

  crearFichaTecnica() {
    this.fichaTecnica = this.productosService.inicializarFichaTecnica();
    this.fichaTecnica.producto = this.idProducto;
  }
  editarFichaTecnica(id) {
    this.productosService.obtenerFichaTecnica(id).subscribe((info) => {
      this.fichaTecnica = info;
    });
  }
  eliminarFichaTecnica(id) {
    this.productosService.eliminarFichaTecnica(id).subscribe(() => {
    });
  }
  guardarFichaTecnica() {
    if (this.fichaTecnica.id == 0) {
      this.productosService.crearFichaTecnica(this.fichaTecnica).subscribe((info) => {
        this.obtenerFichasTecnicas();
      });
    } else {
      this.productosService.editarFichaTecnica(this.fichaTecnica).subscribe((info) => {
        this.obtenerFichasTecnicas();
      });
    }
  }
  abrirModal(modal, id) {
    this.idFichaTecnica = id;
    this.modalService.open(modal)
  }
  cerrarModal() {
    this.modalService.dismissAll();
    this.productosService.eliminarFichaTecnica(this.idFichaTecnica).subscribe(() => {
      this.obtenerFichasTecnicas();
    });
  }
}
