import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
  @Input('menu') menu;
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
      clientesList: ""
    }
  }
  menuUser;
  menuIndex;
  menuRoles;
  menuParam;
  constructor() { }

  ngOnInit(): void {
    this.selectMenu();
  }
  selectMenu() {
    this.menuToolbar[this.menu.modulo][this.menu.seccion] = "active";

  }
}
