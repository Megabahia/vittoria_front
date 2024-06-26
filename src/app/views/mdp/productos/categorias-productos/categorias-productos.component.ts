import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CategoriasService, Categoria} from '../../../../services/mdp/productos/categorias/categorias.service';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ParamService} from 'src/app/services/mdp/param/param.service';
import {AuthService} from '../../../../services/admin/auth.service';

@Component({
  selector: 'app-categorias-productos',
  templateUrl: './categorias-productos.component.html'
})
export class CategoriasProductosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('aviso') aviso;
  paramForm: FormGroup;
  menu;
  page = 1;
  pageSize: any = 3;
  maxSize: any;
  collectionSize: any;
  listaCategorias: any;
  categoria: Categoria;
  funcion: string;
  submitted: boolean;
  idCategoria: any;
  mensaje: string;
  estados;
  currentUserValue;
  mostrarSpinner = false;

  constructor(
    private modalService: NgbModal,
    private categoriasService: CategoriasService,
    private paramService: ParamService,
    private _formBuilder: FormBuilder,
    private authService: AuthService,
  ) {
    this.categoria = categoriasService.inicializarCategoria();
    this.currentUserValue = this.authService.currentUserValue;
  }

  get f() {
    return this.paramForm.controls;
  }

  ngAfterViewInit(): void {
    this.paramService.obtenerListaEstado().subscribe((result) => {
      this.estados = result;
    });
    this.iniciarPaginador();
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaCategorias();
    });
  }

  ngOnInit(): void {
    this.paramForm = this._formBuilder.group({
      nombre: ['', [Validators.required]],
      codigoCategoria: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      estado: ['', [Validators.required]]
    });
    this.menu = {
      modulo: 'mdp',
      seccion: 'cat'
    };
    this.obtenerListaCategorias();
  }

  obtenerListaCategorias(): void {
    this.categoriasService.obtenerCategorias({
      page: this.page - 1,
      page_size: this.pageSize
    }).subscribe((info) => {
      this.listaCategorias = info.info;
      this.collectionSize = info.cont;
    });
  }

  crearCategoria(): void {
    this.categoria = this.categoriasService.inicializarCategoria();
    this.funcion = 'insertar';
    this.submitted = false;
  }

  editarCategoria(id): void {
    this.funcion = 'editar';
    this.submitted = false;
    this.categoriasService.obtenerCategoria(id).subscribe((info) => {
      this.categoria = info;
    });
  }

  guardarCategoria(): void {
    this.submitted = true;
    if (this.paramForm.invalid) {
      return;
    }
    this.mostrarSpinner = true;
    if (this.funcion === 'insertar') {
      this.categoriasService.crearCategoria(this.categoria).subscribe(() => {
        this.obtenerListaCategorias();
        this.dismissModal.nativeElement.click();
        this.submitted = false;
        this.mensaje = 'Categoría guardada';
        this.abrirModal(this.aviso);
        this.mostrarSpinner = false;
      });
    } else if (this.funcion === 'editar') {
      this.categoriasService.actualizarCategoria(this.categoria).subscribe(() => {
        this.obtenerListaCategorias();
        this.dismissModal.nativeElement.click();
        this.submitted = false;
        this.mensaje = 'Categoría editada';
        this.abrirModal(this.aviso);
        this.mostrarSpinner = false;
      });
    }
  }

  abrirModal(modal, id = null): void {
    this.idCategoria = id;
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
    this.categoriasService.eliminarCategoria(this.idCategoria).subscribe(() => {
      this.obtenerListaCategorias();
    });
  }

}
