import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html'
})
export class ManagementComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu='index';
  }

}
