import {Component, OnInit, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {ParamService} from 'src/app/services/admin/param.service';
import {ProspectosService, Prospecto} from '../../../../services/mdm/prospectosCli/prospectos.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import {Toaster} from 'ngx-toast-notifications';
import {ProductosService} from '../../../../services/gdp/productos/productos.service';

@Component({
  selector: 'app-prospectos-clientes-edit',
  templateUrl: './prospectos-clientes-edit.component.html',
})
export class ProspectosClientesEditComponent implements OnInit {
  @Output() messageEvent = new EventEmitter<string>();
  @ViewChild('eliminarImagenMdl') eliminarImagenMdl;
  @ViewChild('eliminarProspectoMdl') eliminarProspectoMdl;
  @Input() idUsuario;
  @Input() confirmProspectoOpciones;
  prospecto: Prospecto = {
    nombres: '',
    apellidos: '',
    telefono: '',
    tipoCliente: '',
    whatsapp: '',
    facebook: '',
    twitter: '',
    instagram: '',
    correo1: '',
    correo2: '',
    ciudad: '',
    canal: '',
    codigoProducto: '',
    nombreProducto: '',
    precio: 0,
    tipoPrecio: '',
    nombreVendedor: '',
    confirmacionProspecto: '',
    imagen: '',
    comentariosVendedor: '',
  };
  urlImagen;
  producto;

  constructor(
    private prospectosService: ProspectosService,
    private globalParam: ParamService,
    private productosServicer: ProductosService,
    private modalService: NgbModal,
    private router: Router,
    private toaster: Toaster,
  ) {
  }

  ngOnInit(): void {
    this.prospectosService.obtenerProspecto(this.idUsuario).subscribe((info) => {
      this.prospecto = info;
      this.urlImagen = info.imagen;
      this.productosServicer.obtenerProductoCodigo(this.prospecto.codigoProducto).subscribe((producto) => {
        this.producto = producto;
      });
    });
  }

  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }

  async ngAfterViewInit() {

  }

  async subirImagen(event) {
    let imagen = event.target.files[0];
    let imagenForm = new FormData();
    imagenForm.append('imagen', imagen, imagen.name);
    this.prospectosService.insertarImagen(this.idUsuario, imagenForm).subscribe((data) => {
      this.urlImagen = data.imagen;
    });

  }

  abrirModalEliminarImagen(): void {
    this.abrirModal(this.eliminarImagenMdl);
  }

  abrirModalEliminarProspecto(): void {
    this.abrirModal(this.eliminarProspectoMdl);

  }

  eliminarImagen(): void {
    this.prospectosService.insertarImagen(this.idUsuario, {imagen: null}).subscribe((data) => {
      this.urlImagen = data.imagen;
      this.cerrarModal();
    });
  }

  async actualizarProspecto() {
    if (!this.prospecto.confirmacionProspecto) {
      this.toaster.open('Llenar campos', {type: 'warning'});
      return;
    }
    this.prospectosService.actualizarProspecto(
      this.idUsuario, this.prospecto.confirmacionProspecto, this.prospecto.comentariosVendedor
    ).subscribe(() => {
      this.toaster.open('Actualizacion', {type: 'success'});
      this.messageEvent.emit('lista');
    });
  }

  eliminarProspecto(): void {
    this.prospectosService.eliminarProspecto(this.idUsuario).subscribe((info) => {
      this.messageEvent.emit('lista');
      this.cerrarModal();
    });
  }

  abrirModal(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }

  abrirModalProducto(modal): void {
    this.modalService.open(modal, { size: 'lg', backdrop: 'static' });
  }

}
