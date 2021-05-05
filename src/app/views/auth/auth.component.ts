import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-auth-component',
    template: `<router-outlet></router-outlet>`
})

export class AuthComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
        
    }
    ngAfterViewInit(){
        
        let body = document.getElementsByTagName('body')[0];
        body.className = "";
        body.classList.add('vertical-layout');
        body.classList.add('vertical-menu-modern');
        body.classList.add('navbar-floating');
        body.classList.add('footer-static');
        body.classList.add('blank-page');
    }
}
