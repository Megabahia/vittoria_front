import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbPagination, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriasService } from '../../../../../services/mdp/productos/categorias/categorias.service';
import { Producto, ProductosService } from '../../../../../services/mdp/productos/productos.service';
import { SubcategoriasService } from '../../../../../services/mdp/productos/subcategorias/subcategorias.service';

@Component({
  selector: 'app-productos-editar',
  templateUrl: './productos-editar.component.html'
})
export class ProductosEditarComponent implements OnInit {
  @Input() idProducto;
  @ViewChild(NgbPagination)paginator:NgbPagination;
  producto:Producto;
  categoriasOpciones;
  subcategoriasOpciones;
  fichaTecnica;
  files: File[] = [];
  fichaTecnicaLista;
  idFichaTecnica;
  constructor(
    private categoriasService:CategoriasService,
    private subcategoriasService:SubcategoriasService,
    private productosService:ProductosService,
    private modalService: NgbModal
    ) {
    this.producto = this.productosService.inicializarProducto();
    this.fichaTecnica = this.productosService.inicializarFichaTecnica();
  }

  ngOnInit(): void {
    if(this.idProducto!=0){
      this.obtenerProducto();
      this.obtenerFichasTecnicas();
    }
  }
  obtenerProducto(){
    this.productosService.obtenerProducto(this.idProducto).subscribe((info)=>{
      this.producto = info;
    });  
  }
  obtenerFichasTecnicas(){
    this.productosService.obtenerFichasTecnicas(this.idProducto).subscribe((info)=>{
      this.fichaTecnicaLista = info.info;
    });  
  }
  async obtenerCategoriasOpciones(){
    await this.categoriasService.obtenerListaCategorias().subscribe((info)=>{
      this.categoriasOpciones = info;
    });
  }
  async obtenerListaSubcategorias(){
    await this.subcategoriasService.obtenerListaSubcategorias().subscribe((info)=>{
      this.subcategoriasOpciones = info;
    });
  }
  
  onSelect(event) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }
  removeAll(){
    this.files = [];
  }
  guardarProducto(){
    if(this.idProducto!=0){
      this.productosService.actualizarProducto(this.producto).subscribe((info)=>{
        console.log(info);
      });
    }else{
      this.productosService.crearProducto(this.producto).subscribe((info)=>{
        console.log(info);
      });
    }
  }

  crearFichaTecnica(){
    this.fichaTecnica = this.productosService.inicializarFichaTecnica();
    this.fichaTecnica.producto = this.idProducto;
  }
  editarFichaTecnica(id){
    this.productosService.obtenerFichaTecnica(id).subscribe((info)=>{
      this.fichaTecnica=info;
    });
  }
  eliminarFichaTecnica(id){
    this.productosService.eliminarFichaTecnica(id).subscribe(()=>{
    });
  }
  guardarFichaTecnica(){
    if(this.fichaTecnica.id==0){
      this.productosService.crearFichaTecnica(this.fichaTecnica).subscribe((info)=>{
        this.obtenerFichasTecnicas();
      });
    }else{
      this.productosService.editarFichaTecnica(this.fichaTecnica).subscribe((info)=>{
        this.obtenerFichasTecnicas();
      });
    }
  }
  abrirModal(modal,id){
    this.idFichaTecnica=id;
    this.modalService.open(modal)
  }
  cerrarModal(){
    this.modalService.dismissAll();
    this.productosService.eliminarFichaTecnica(this.idFichaTecnica).subscribe(()=>{
      this.obtenerFichasTecnicas();
    });
  }
}
