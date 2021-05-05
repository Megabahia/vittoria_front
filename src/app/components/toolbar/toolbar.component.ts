import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
  @Input('menu') menu;
  menuUser;
  menuIndex;
  constructor() { }

  ngOnInit(): void {
    this.selectMenu();
  }
  initiateMenu(){
    this.menuUser="";
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
    }
  }
}
