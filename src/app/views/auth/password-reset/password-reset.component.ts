import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/admin/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html'
})
export class PasswordResetComponent implements OnInit {
  @ViewChild('errorAuth') errorAuth;
  token;
  password;
  email;
  confirmPassword;
  confirmar = true;
  submitted = false;
  mensaje = "";
  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
    });
  }
  verificarPassword() {

    if (this.password == this.confirmPassword) {
      this.confirmar = true;
    } else {
      this.confirmar = false;
    }
  }

  enviarPassword() {
    this.submitted = true;

    if (this.confirmar && this.password) {
      this.authService.enviarClaveNueva(
        {
          token: this.token,
          password: this.password,
          email: this.email
        }
      ).subscribe(info => {
        window.location.href = '/auth/signin';
      }, error => {
        let errores = Object.values(error);
        let llaves = Object.keys(error);
        this.mensaje = "";
        errores.map((infoErrores, index) => {
          this.mensaje += llaves[index] + ": " + infoErrores + "<br>";
        });
        this.abrirModal(this.errorAuth);

      });
    }
  }
  abrirModal(modal) {
    this.modalService.open(modal)
  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
}
