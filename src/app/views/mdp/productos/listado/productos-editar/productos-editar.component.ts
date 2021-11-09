import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbPagination, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriasService } from '../../../../../services/mdp/productos/categorias/categorias.service';
import { Producto, ProductosService } from '../../../../../services/mdp/productos/productos.service';
import { SubcategoriasService } from '../../../../../services/mdp/productos/subcategorias/subcategorias.service';
import { map } from 'rxjs/operators';
import { ParamService } from 'src/app/services/mdp/param/param.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-productos-editar',
  templateUrl: './productos-editar.component.html'
})
export class ProductosEditarComponent implements OnInit {
  @Input() idProducto;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('aviso') aviso;
  producto: Producto;
  datosProducto: FormData = new FormData();
  productoForm: FormGroup; 
  fichaTecnicaForm: FormGroup; 
  submittedProductoForm:boolean = false;
  submittedFichaTecnicaForm: boolean = false;
  opcion;
  categoriasOpciones;
  subcategoriasOpciones;
  fichaTecnica;
  fichaTecnicaLista;
  idFichaTecnica;
  abastecimientoOpciones;
  archivos:File[] = [];
  mensaje: string;
  numRegex = /^-?\d*[.,]?\d{0,2}$/;

  constructor(
    private categoriasService: CategoriasService,
    private subcategoriasService: SubcategoriasService,
    private productosService: ProductosService,
    private modalService: NgbModal,
    private paramService: ParamService,
    private _formBuilder: FormBuilder,
  ) {
    this.producto = this.productosService.inicializarProducto();
    this.fichaTecnica = this.productosService.inicializarFichaTecnica();
  }

  get fp() {
    return this.productoForm.controls;
  }
  get fft() {
    return this.fichaTecnicaForm.controls;
  }

  ngOnInit(): void {
    this.productoForm = this._formBuilder.group({
      categoria: ['', [Validators.required]],
      subCategoria: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      codigoBarras: ['', [Validators.required]],
      refil: ['', [Validators.required]],
      stock: ['', [Validators.required]],
      parametrizacion: ['', [Validators.required]],
      costoCompra: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaA: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaB: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaC: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaD: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaE: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaBultos: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      estado: ['', [Validators.required]],
      caducidad: ['', [Validators.required]],
      variableRefil: ['', [Validators.required]],
      fechaCaducidad: ['', [Validators.required]],
      fechaElaboracion: ['', [Validators.required]],
    });
    this.fichaTecnicaForm = this._formBuilder.group({
      codigo: ['', [Validators.required]],
      nombreAtributo: ['', [Validators.required]],
      valor: ['', [Validators.required, Validators.pattern(this.numRegex)]]
    })
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

    this.submittedProductoForm = true;
    if (this.fichaTecnicaForm.invalid) {
      return;
    }
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
    this.opcion = "insertar";
    this.submittedFichaTecnicaForm = false;
    this.fichaTecnica.producto = this.idProducto;
  }
  editarFichaTecnica(id) {
    this.productosService.obtenerFichaTecnica(id).subscribe((info) => {
      this.fichaTecnica = info;
      this.submittedFichaTecnicaForm = false;
      this.opcion = "editar"
    });
  }
  eliminarFichaTecnica(id) {
    this.productosService.eliminarFichaTecnica(id).subscribe(() => {
    });
  }
  guardarFichaTecnica() {
    this.submittedFichaTecnicaForm = true;
    if (this.fichaTecnicaForm.invalid) {
      return;
    }
    if (this.opcion === "insertar") {
      this.productosService.crearFichaTecnica(this.fichaTecnica).subscribe((info) => {
        this.obtenerFichasTecnicas();
        this.dismissModal.nativeElement.click();
        this.submittedFichaTecnicaForm = false;
        this.mensaje = "Ficha técnica guardada";
        this.abrirModal(this.aviso);
      });
    } else if (this.opcion === "editar"){
      this.productosService.editarFichaTecnica(this.fichaTecnica).subscribe((info) => {
        this.obtenerFichasTecnicas();
        this.dismissModal.nativeElement.click();
        this.submittedFichaTecnicaForm = false;
        this.mensaje = "Ficha técnica guardada";
        this.abrirModal(this.aviso);
      });
    }
  }
  abrirModal(modal, id = null) {
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
