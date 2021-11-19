import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
  @Input('menu') menu;
  usuario;
  acciones;
  menuToolbar = {
    adm: {
      user: "",
      index: "",
      roles: "",
      param: ""
    },
    mdm:{
      param:"",
      prospectosCli:"",
      clientesList: "",
      clientesTransac:""
    },
    mdp:{
      param:"",
      cat:"",
      subCat:"",
      prodList:"",
      prodBusq:"",
      stockAct:"",
      abastRep:"",
      stockRep:"",
      caduRep:"",
      rotaRep:"",
      refilRep:""
    },
    mdo:{
      param:"",
      predCross:"",
      predRefil:"",
      predNueProd:"",
      genOferta:""
    },
    gde:{
      param:"",
      gestEntrega:""
    },
    gdo:{
      param:"",
      gestOferta:""
    }
  }
  menuUser;
  menuIndex;
  menuRoles;
  menuParam;
  constructor() { }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.acciones = this.usuario.acciones;
    this.selectMenu();
  }
  selectMenu() {
    this.menuToolbar[this.menu.modulo][this.menu.seccion] = "active";

  }
}
