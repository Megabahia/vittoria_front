import {Component, OnInit, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit, OnChanges {
  @Input('menu') menu;
  usuario;
  acciones;
  menuToolbar = {
    adm: {
      user: '',
      index: '',
      roles: '',
      param: ''
    },
    mdm: {
      param: '',
      prospectosCli: '',
      clientesList: '',
      clientesTransac: ''
    },
    mdp: {
      param: '',
      cat: '',
      subCat: '',
      prodList: '',
      prodBusq: '',
      stockAct: '',
      abastRep: '',
      stockRep: '',
      caduRep: '',
      rotaRep: '',
      refilRep: ''
    },
    mdo: {
      param: '',
      predCross: '',
      predRefil: '',
      predNueProd: '',
      genOferta: ''
    },
    gde: {
      param: '',
      gestEntrega: ''
    },
    gdo: {
      param: '',
      gestOferta: ''
    },
    servi: {
      ciudades: '',
      guias: '',
    },
    todomegacentro: {
      inicio: '',
    }
  };
  menuUser;
  menuIndex;
  menuRoles;
  menuParam;

  constructor() {
  }

  ngOnInit(): void {
    console.warn('init toolbar');
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.acciones = this.usuario.acciones;
    // this.selectMenu();
  }

  ngOnChanges(): void {
    console.warn('changes toolbar');
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.acciones = this.usuario.acciones;
  }

  selectMenu(): void {
    this.menuToolbar[this.menu.modulo][this.menu.seccion] = 'active';

  }
}
