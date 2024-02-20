import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../../services/admin/auth.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mail-password',
  templateUrl: './mail-password.component.html'
})
export class MailPasswordComponent implements OnInit {
  @ViewChild('mensajeModal') mensajeModal;
  correo = '';
  public submitted;
  public form: FormGroup;
  public mensaje;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
  ) {
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }
    this.form = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
  }

  get f() {
    return this.form.controls;
  }

  enviarCorreo(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.authService.enviarCorreoCambioClave({
      email: this.correo
    }).subscribe((info) => {
      console.log(info);
      this.mensaje = 'Revise su correo para cambiar su contraseña';
      this.abrirModal(this.mensajeModal);
      this.submitted = false;
      this.router.navigate(['auth/signin']);
    }, (error) => {
      this.mensaje = 'No existe el correo';
      this.abrirModal(this.mensajeModal);
    });
  }

  abrirModal(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }
}
