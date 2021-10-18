import { Component, OnInit, Input } from '@angular/core';
import { ParamService } from 'src/app/services/admin/param.service';
import { ProspectosService, Prospecto } from '../../../../services/mdm/prospectosCli/prospectos.service';

@Component({
  selector: 'app-prospectos-clientes-edit',
  templateUrl: './prospectos-clientes-edit.component.html',
})
export class ProspectosClientesEditComponent implements OnInit {
  @Input() idUsuario;
  @Input() confirmProspectoOpciones;
  prospecto: Prospecto = {
    nombres: "",
    apellidos: "",
    telefono: "",
    tipoCliente: "",
    whatsapp: "",
    facebook: "",
    twitter: "",
    instagram: "",
    correo1: "",
    correo2: "",
    ciudad: "",
    canal: "",
    codigoProducto: "",
    nombreProducto: "",
    precio: 0,
    tipoPrecio: "",
    nombreVendedor: "",
    confirmacionProspecto: "",
    imagen: "",
  }
  urlImagen;
  constructor(
    private prospectosService: ProspectosService,
    private globalParam: ParamService
  ) { }

  ngOnInit(): void {
    this.prospectosService.obtenerProspecto(this.idUsuario).subscribe((info) => {
      this.prospecto = info;
      this.urlImagen = info.imagen;
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
    if (confirm('¿Desea cambiar la imagen?')) {
      this.prospectosService.insertarImagen(this.idUsuario, imagenForm).subscribe((data) => {
        this.urlImagen = data.imagen;
      });
    }
  }
  eliminarImagen() {
    if (confirm('¿Desea eliminar la imagen?')) {
      this.prospectosService.insertarImagen(this.idUsuario, { imagen: null }).subscribe((data) => {
        this.urlImagen = data.imagen;
      });
    }
  }

  async actualizarProspecto() {
    this.prospectosService.actualizarProspecto(this.idUsuario, this.prospecto.confirmacionProspecto).subscribe(() => {
      window.location.href = '/mdm/prospectosClientes/list';
    });
  }
  eliminarProspecto() {
    if (confirm('¿Desea eliminar a este cliente?')) {
      this.prospectosService.eliminarProspecto(this.idUsuario).subscribe((info) => {
        window.location.href = '/mdm/prospectosClientes/list';
      });
    }
  }

}
