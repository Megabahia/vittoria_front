import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  template: '<router-outlet></router-outlet>'
})
export class AdminComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    
  }
  ngAfterViewInit(){
    let body = document.getElementsByTagName('body')[0];
    body.className = "";
    body.classList.add('vertical-layout');
    body.classList.add('vertical-menu-modern');
    body.classList.add('navbar-floating');
    body.classList.add('footer-static');
    body.classList.add('menu-expanded');
  }
}
