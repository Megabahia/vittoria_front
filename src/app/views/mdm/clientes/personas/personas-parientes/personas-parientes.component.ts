import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClientesService, Pariente } from '../../../../../services/mdm/personas/clientes/clientes.service';
import { ParamService } from '../../../../../services/mdm/param/param.service';
import * as moment from 'moment';

@Component({
  selector: 'app-personas-parientes',
  templateUrl: './personas-parientes.component.html',
})
export class PersonasParientesComponent implements OnInit {
  @Output() volver = new EventEmitter<string>();
  @Input() idPariente;
  @Input() idCliente; 
  pariente: Pariente;
  tipoParientesOpciones;
  generoOpciones;
  nacionalidadOpciones;
  paisesOpciones;
  provinciaNacimientoOpciones;
  ciudadNacimientoOpciones;
  provinciaResidenciaOpciones;
  ciudadResidenciaOpciones;
  nivelEstudiosOpciones;
  profesionOpciones;
  provinciaTrabajoOpciones;
  ciudadTrabajoOpciones;
  estadoCivilOpciones;
  estadoOpcion;
  constructor(
    private clientesService:ClientesService,
    private paramService:ParamService
  ) {
    this.pariente = clientesService.inicializarPariente();
   }

  async ngOnInit() {
    
  }
  async ngAfterViewInit(){
    this.obtenerTipoParientesOpciones();
    this.obtenerGeneroOpciones();
    this.obtenerNacionalidadOpciones();
    this.obtenerPaisOpciones();
    this.obtenerNivelEstudiosOpciones();
    this.obtenerNivelProfesionOpciones();
    this.obtenerEstadoCivilOpciones();
    if(this.idPariente!=0){
      await this.clientesService.obtenerPariente(this.idPariente).subscribe((info)=>{
        this.pariente= info;
        this.estadoOpcion = info.estado=='Activo' ? 1:0;
        this.pariente.estado = info.estado;
        this.obtenerProvinciasNacimiento();
        this.obtenerCiudadNacimiento();
        this.obtenerProvinciasResidencia();
        this.obtenerCiudadResidencia();
        this.obtenerProvinciasTrabajo();
        this.obtenerCiudadTrabajo();
      });
    }else{
      this.pariente= this.clientesService.inicializarPariente();
    }
    this.pariente.cliente = this.idCliente;
  }
  async obtenerTipoParientesOpciones(){
    await this.paramService.obtenerListaPadres("TIPO_PARIENTE").subscribe((info)=>{
      this.tipoParientesOpciones = info;
    });
  }
  async obtenerGeneroOpciones(){
    await this.paramService.obtenerListaPadres("GENERO").subscribe((info)=>{
      this.generoOpciones = info;
    });
  }
  async obtenerNacionalidadOpciones(){
    await this.paramService.obtenerListaPadres("NACIONALIDAD").subscribe((info)=>{
      this.nacionalidadOpciones = info;
    });
  }
  async obtenerPaisOpciones(){
    await this.paramService.obtenerListaPadres("PAIS").subscribe((info)=>{
      this.paisesOpciones = info;
    });
  }
  async obtenerProvinciasNacimiento(){
    await this.paramService.obtenerListaHijos(this.pariente.paisNacimiento,"PAIS").subscribe((info)=>{
      this.provinciaNacimientoOpciones = info;
    });
  }
  async obtenerCiudadNacimiento(){
    await this.paramService.obtenerListaHijos(this.pariente.provinciaNacimiento,"PROVINCIA").subscribe((info)=>{
      this.ciudadNacimientoOpciones = info;
    });
  }
  async obtenerProvinciasResidencia(){
    await this.paramService.obtenerListaHijos(this.pariente.paisResidencia,"PAIS").subscribe((info)=>{
      this.provinciaResidenciaOpciones = info;
    });
  }
  async obtenerCiudadResidencia(){
    await this.paramService.obtenerListaHijos(this.pariente.provinciaResidencia,"PROVINCIA").subscribe((info)=>{
      this.ciudadResidenciaOpciones = info;
    });
  }
  async obtenerNivelEstudiosOpciones(){
    await this.paramService.obtenerListaPadres("NIVEL_ESTUDIOS").subscribe((info)=>{
      this.nivelEstudiosOpciones = info;
    });
  }
  async obtenerNivelProfesionOpciones(){
    await this.paramService.obtenerListaPadres("PROFESION").subscribe((info)=>{
      this.profesionOpciones = info;
    });
  }
  async obtenerProvinciasTrabajo(){
    await this.paramService.obtenerListaHijos(this.pariente.paisTrabajo,"PAIS").subscribe((info)=>{
      this.provinciaTrabajoOpciones = info;
    });
  }
  async obtenerCiudadTrabajo(){
    await this.paramService.obtenerListaHijos(this.pariente.provinciaTrabajo,"PROVINCIA").subscribe((info)=>{
      this.ciudadTrabajoOpciones = info;
    });
  }
  async obtenerEstadoCivilOpciones(){
    await this.paramService.obtenerListaPadres("ESTADO_CIVIL").subscribe((info)=>{
      this.estadoCivilOpciones = info;
    });
  }
  async calcularEdad(){
    this.pariente.edad = moment().diff(this.pariente.fechaNacimiento, 'years');
  }
  regresar() {
    this.volver.emit();
  }
  async cambiarEstado(){
    this.pariente.estado= this.estadoOpcion == 1 ? 'Activo':'Inactivo'
  }
  async guardarPariente(){
    if(this.idPariente!=0){
      await this.clientesService.actualizarPariente(this.idPariente,this.pariente).subscribe((info)=>{
        console.log(info);
      });
    }else{
      await this.clientesService.crearPariente(this.pariente).subscribe((info)=>{
        console.log(info);
      });
    }
    
  }
}
