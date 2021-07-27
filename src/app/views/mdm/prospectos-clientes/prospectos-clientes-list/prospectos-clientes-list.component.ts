import { Component, OnInit, ViewChild } from '@angular/core';
import { ProspectosService } from '../../../../services/mdm/prospectosCli/prospectos.service';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-prospectos-clientes-list',
  templateUrl: './prospectos-clientes-list.component.html'
})
export class ProspectosClientesListComponent implements OnInit {
  @ViewChild(NgbPagination)paginator:NgbPagination;
  menu;
  canalOpciones;
  canalLista="";
  vendedor="";
  vendedorOpciones;
  fecha="";
  confirmProspectoLista="";
  confirmProspectoOpciones;
  tipoPrecioOpciones;
  tipoClienteOpciones;
  pageSize:any = 10;
  page = 1;
  maxSize;
  collectionSize;
  lista;
  usuario: FormData = new FormData();
  idUsuario;
  nombres;
  apellidos;
  telefono;
  tipoCliente="";
  whatsapp;
  facebook;
  twitter;
  instagram;
  correo1;
  correo2;
  ciudad;
  canal="";
  codigoProducto;
  nombreProducto;
  precio;
  tipoPrecio="";
  nombreVendedor;
  confirmacionProspecto="";
  imagen;
  vista;
  constructor(
    private prospectosService:ProspectosService
  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "prospectosCli"
    };
    this.vista = 'lista';
  }
  async ngAfterViewInit(){
    this.obtenerCanales();
    this.obtenerProspectos();
    this.obtenerVendedores();
    this.obtenerListaProspectos();
    this.iniciarPaginador();
    this.obtenerTiposPrecio();
    this.obtenerTiposCliente();
  }
  async iniciarPaginador(){
    this.paginator.pageChange.subscribe(()=>{
    this.obtenerListaProspectos();
    });
  }
  async obtenerListaProspectos(){
     await this.prospectosService.obtenerLista(
       {
         page:this.page-1,
         page_size:this.pageSize,
         canal:this.canalLista,
         created_at: this.fecha,
         nombreVendedor:this.vendedor,
         confirmacionProspecto:this.confirmProspectoLista
        }
        ).subscribe((info)=>{
          this.lista = info.info;
          this.collectionSize = info.cont;
        });
  }
  async obtenerCanales(){
    await this.prospectosService.obtenerFiltro("CANAL").subscribe((info)=>{
      this.canalOpciones = info;
    });
  }
  async obtenerVendedores(){
    await this.prospectosService.obtenerVendedor("Vendedor").subscribe((info)=>{
      this.vendedorOpciones = info;
    });
  }
  async obtenerProspectos(){
    await this.prospectosService.obtenerFiltro("CONFIRMACION_PROSPECTO").subscribe((info)=>{
      this.confirmProspectoOpciones = info;
    });
  }
  async obtenerTiposPrecio(){
    await this.prospectosService.obtenerFiltro("TIPO_PRECIO").subscribe((info)=>{
      this.tipoPrecioOpciones = info;
    });
  }
  async obtenerTiposCliente(){
    await this.prospectosService.obtenerFiltro("TIPO_CLIENTE").subscribe((info)=>{
      this.tipoClienteOpciones = info;
    });
  }
  async guardarImagen(event){
    this.imagen = event.target.files[0];
    console.log(this.imagen);
  } 
  async crearProspecto(){
    this.usuario.append('nombres',this.nombres);
    this.usuario.append('apellidos',this.apellidos);
    this.usuario.append('telefono',this.telefono);
    this.usuario.append('tipoCliente',this.tipoCliente);
    this.usuario.append('whatsapp',this.whatsapp);
    this.usuario.append('facebook',this.facebook);
    this.usuario.append('twitter',this.twitter);
    this.usuario.append('instagram',this.instagram);
    this.usuario.append('correo1',this.correo1);
    this.usuario.append('correo2',this.correo2);
    this.usuario.append('ciudad',this.ciudad);
    this.usuario.append('canal',this.canal);
    this.usuario.append('codigoProducto',this.codigoProducto);
    this.usuario.append('nombreProducto',this.nombreProducto);
    this.usuario.append('tipoPrecio',this.tipoPrecio);
    this.usuario.append('nombreVendedor',this.nombreVendedor);
    this.usuario.append('confirmacionProspecto',this.confirmacionProspecto);
    this.usuario.append('imagen',this.imagen,this.imagen.name);
    this.prospectosService.crearProspectos(this.usuario).subscribe(()=>{
      this.obtenerListaProspectos();
    });
  }
  
  editarProspecto(id){
    this.idUsuario = id;
    this.vista = 'editar';
  }
  eliminarProspecto(id){
    if(confirm('¿Desea eliminar a este cliente?')){
      this.prospectosService.eliminarProspecto(id).subscribe((info)=>{
        this.obtenerListaProspectos();
      });
    }
  }

}
