import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first, timeout } from 'rxjs/operators';
import { AuthService } from 'src/app/services/admin/auth.service';
// import Swal from 'sweetalert2';
import { ReCaptchaV3Service } from 'ngx-captcha';
// import { AuthService } from '../../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  providers: [],

})
export class SignInComponent implements OnInit {
  @ViewChild('errorAuth') errorAuth;
  @ViewChild('captchaElem') captchaElem
  captcha: boolean;
  username: '';
  password: '';
  siteKey: string;
  submitted = false;
  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private reCaptchaV3Service: ReCaptchaV3Service,

  ) {
    this.siteKey = "6Lf8RtUaAAAAAJ-X1OdWM1yk80S_U4dF_A3nNMc1";
    this.captcha = false;
  }

  ngOnInit() {
    this.authService.signOut();

  }
  captchaValidado(evento) {
    this.captcha = true;
  }

  signIn(): void {
    this.submitted = true;
    if (this.captcha) {
      this.authService.signIn({ 'username': this.username, 'password': this.password })
        .pipe(first())
        .subscribe((result) => {

          window.location.href = '/admin/management';

        }, (error) => {
          this.abrirModal(this.errorAuth);
        });
    } else {

    }


  }
  abrirModal(modal) {
    this.modalService.open(modal)
  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
}
