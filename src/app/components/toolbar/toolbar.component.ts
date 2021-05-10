import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
  @Input('menu') menu;
  menuUser;
  menuIndex;
  menuRoles;
  menuParam;
  constructor() { }

  ngOnInit(): void {
    this.selectMenu();
  }
  initiateMenu(){
    this.menuUser="";
    this.menuIndex="";
    this.menuRoles="";
    this.menuParam="";
  }
  selectMenu(){
    this.initiateMenu();
    switch(this.menu){
      case "index":
        this.menuIndex="active";
        break;
      case "user":
        this.menuUser="active";
        break;
      case "roles":
        this.menuRoles="active";
        break;
      case "param":
        this.menuParam="active";
        break;
    }
  }
}
