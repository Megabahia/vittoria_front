import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
      <app-app-layout>
          <router-outlet></router-outlet>
      </app-app-layout>
  `,
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    let body = document.getElementsByTagName('body')[0];
    body.className = "";
    body.classList.add('vertical-layout');
    body.classList.add('vertical-menu-modern');
    body.classList.add('navbar-floating');
    body.classList.add('footer-static');
    body.classList.add('menu-expanded');
  }
}
