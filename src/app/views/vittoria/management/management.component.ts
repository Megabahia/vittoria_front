import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html'
})
export class ManagementComponent implements OnInit, OnDestroy {
  sub;
  loggedUser;
  menu;

  constructor(
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.loggedUser = JSON.parse(localStorage.getItem('currentUser'));

    this.sub = this.route
      .data
      .subscribe(v => {
        let acciones = this.loggedUser.acciones;
        console.log(acciones[v.module]);
      });
    this.menu = {
      modulo: 'adm',
      seccion: 'index'
    };

    localStorage.removeItem('paginaExterna');
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
