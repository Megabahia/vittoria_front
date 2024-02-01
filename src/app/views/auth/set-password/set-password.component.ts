import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../services/admin/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html'
})
export class SetPasswordComponent implements OnInit {
  @ViewChild('mensajeModal') mensajeModal;
  @ViewChild('errorAuth') errorAuth;
  token;
  password;
  email;
  confirmPassword;
  confirmar = true;
  submitted = false;
  mensaje = '';
  public form: FormGroup;
  public captcha: boolean;
  public siteKey: string;

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }
    this.siteKey = environment.setKey;
    this.form = this.formBuilder.group({
      password: ['', [Validators.minLength(8),
        Validators.pattern('(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$'),
        Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
    });
  }

  get f() {
    return this.form.controls;
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

    if (this.form.invalid || !this.captcha) {
      return;
    }

    if (this.confirmar && this.password) {
      this.authService.enviarClaveNueva(
        {
          token: this.token,
          password: this.password,
          email: this.email
        }
      ).subscribe(info => {
        this.mensaje = 'Contraseña actualizada correctamente, haga click en continuar para ir a la página de inicio';
        this.abrirModal(this.mensajeModal);
        this.router.navigate(['/auth/signin']);
      }, error => {
        let errores = Object.values(error);
        let llaves = Object.keys(error);
        this.mensaje = '';
        errores.map((infoErrores, index) => {
          this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
        });
        this.abrirModal(this.errorAuth);

      });
    }
  }

  abrirModal(modal) {
    this.modalService.open(modal);
  }

  cerrarModal() {
    this.modalService.dismissAll();
  }

  captchaValidado(evento): void {
    this.captcha = true;
  }
}
