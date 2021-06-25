import { Component, OnInit, Input } from '@angular/core';
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
  constructor(
    private prospectosService: ProspectosService
  ) { }

  ngOnInit(): void {
    this.prospectosService.obtenerProspecto(this.idUsuario).subscribe((info) => {
      this.prospecto = info;
    });
  }
  async ngAfterViewInit() {

  }
  async subirImagen(event) {
    let imagen = event.target.files[0];
    let imagenForm = new FormData();
    imagenForm.append('imagen', imagen, imagen.name);
    if (confirm('¿Desea cambiar la imagen?')) {
      this.prospectosService.insertarImagen(this.idUsuario, imagenForm).subscribe((data) => {
        console.log(data);
      });
    }
  }
  async actualizarProspecto(){
    this.prospectosService.actualizarProspecto(this.idUsuario,this.prospecto.confirmacionProspecto).subscribe(()=>{
      window.location.href = '/mdm/prospectosClientes/list';
    });
  }
}
